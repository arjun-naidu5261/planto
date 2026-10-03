#!/usr/bin/env python3
import os
import sys
import shutil
import glob
import subprocess
import plistlib
from PIL import Image

WORKSPACE = "/Users/futureforbespvtltd/Desktop/Planto"
BASE_APK = os.path.join(WORKSPACE, "mobile/dist-builds/plantme-v1.0.5.apk")
BASE_IPA = os.path.join(WORKSPACE, "mobile/dist-builds/plantme-ios.ipa")
KEYSTORE = os.path.expanduser("~/.android/debug.keystore")
BUILD_TOOLS = "/Users/futureforbespvtltd/Library/Android/sdk/build-tools/35.0.0"
JAVA_BIN = "/opt/homebrew/opt/openjdk/bin"
ENV = os.environ.copy()
ENV["PATH"] = f"{JAVA_BIN}:{BUILD_TOOLS}:{ENV.get('PATH', '')}"

APPS = [
    {
        "id": "customer",
        "name": "PlantMe",
        "package": "in.plantme.customer",
        "scheme": "plantme",
        "apk_name": "plantme-customer.apk",
        "ipa_name": "plantme-customer.ipa",
        "icon_src": os.path.join(WORKSPACE, "assets/app_icons/customer_512.png"),
        "android_bundle": glob.glob(os.path.join(WORKSPACE, "mobile/dist-android/_expo/static/js/android/*.hbc"))[0],
        "android_assets": os.path.join(WORKSPACE, "mobile/dist-android/assets"),
        "ios_bundle": glob.glob(os.path.join(WORKSPACE, "mobile/dist-ios/_expo/static/js/ios/*.hbc"))[0],
    },
    {
        "id": "vendor",
        "name": "Nursery Store",
        "package": "in.plantme.vendor",
        "scheme": "plantme-vendor",
        "apk_name": "nursery-store-vendor.apk",
        "ipa_name": "nursery-store-vendor.ipa",
        "icon_src": os.path.join(WORKSPACE, "assets/app_icons/vendor_512.png"),
        "android_bundle": glob.glob(os.path.join(WORKSPACE, "mobile-vendor/dist-android/_expo/static/js/android/*.hbc"))[0],
        "android_assets": os.path.join(WORKSPACE, "mobile-vendor/dist-android/assets"),
        "ios_bundle": glob.glob(os.path.join(WORKSPACE, "mobile-vendor/dist-ios/_expo/static/js/ios/*.hbc"))[0],
    },
    {
        "id": "delivery",
        "name": "Delivery Partner",
        "package": "in.plantme.delivery",
        "scheme": "plantme-delivery",
        "apk_name": "delivery-partner.apk",
        "ipa_name": "delivery-partner.ipa",
        "icon_src": os.path.join(WORKSPACE, "assets/app_icons/delivery_512.png"),
        "android_bundle": glob.glob(os.path.join(WORKSPACE, "mobile-delivery/dist-android/_expo/static/js/android/*.hbc"))[0],
        "android_assets": os.path.join(WORKSPACE, "mobile-delivery/dist-android/assets"),
        "ios_bundle": glob.glob(os.path.join(WORKSPACE, "mobile-delivery/dist-ios/_expo/static/js/ios/*.hbc"))[0],
    },
]

def run(cmd, cwd=None):
    print(f"--> Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, cwd=cwd, env=ENV, shell=isinstance(cmd, str), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ERROR: {res.stderr}\n{res.stdout}")
        sys.exit(1)
    return res.stdout

def update_android_icons(target_dir, icon_path):
    im = Image.open(icon_path).convert("RGBA")
    sizes = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432)
    }
    for folder, (icon_sz, fg_sz) in sizes.items():
        d = os.path.join(target_dir, "res", folder)
        if not os.path.exists(d):
            continue
        # Standard icon
        im.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS).save(os.path.join(d, "ic_launcher.webp"), "PNG")
        # Round icon
        im.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS).save(os.path.join(d, "ic_launcher_round.webp"), "PNG")
        # Foreground icon centered on transparent canvas
        fg = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
        offset = int(fg_sz * 0.15)
        inner_sz = fg_sz - 2 * offset
        resized_inner = im.resize((inner_sz, inner_sz), Image.Resampling.LANCZOS).convert("RGBA")
        fg.paste(resized_inner, (offset, offset), resized_inner)
        fg.save(os.path.join(d, "ic_launcher_foreground.webp"), "PNG")
    print(f"Updated Android icons using {icon_path}")

def build_apk(app, base_decoded_dir):
    print(f"\n==========================================")
    print(f"Building APK for: {app['name']} ({app['package']})")
    print(f"==========================================")
    
    build_dir = f"/tmp/build_apk_{app['id']}"
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    shutil.copytree(base_decoded_dir, build_dir)
    
    # 1. Update AndroidManifest.xml
    manifest_path = os.path.join(build_dir, "AndroidManifest.xml")
    with open(manifest_path, "r") as f:
        manifest = f.read()
    
    manifest = manifest.replace('package="in.plantme.app"', f'package="{app["package"]}"')
    manifest = manifest.replace('in.plantme.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION', f'{app["package"]}.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION')
    manifest = manifest.replace('in.plantme.app.FileSystemFileProvider', f'{app["package"]}.FileSystemFileProvider')
    manifest = manifest.replace('in.plantme.app.androidx-startup', f'{app["package"]}.androidx-startup')
    manifest = manifest.replace('android:scheme="plantme"', f'android:scheme="{app["scheme"]}"')
    
    with open(manifest_path, "w") as f:
        f.write(manifest)
        
    # 2. Update strings.xml (app_name)
    strings_path = os.path.join(build_dir, "res/values/strings.xml")
    with open(strings_path, "r") as f:
        strings = f.read()
    strings = strings.replace('<string name="app_name">PlantMe.in</string>', f'<string name="app_name">{app["name"]}</string>')
    with open(strings_path, "w") as f:
        f.write(strings)
        
    # 3. Update smali BuildConfig APPLICATION_ID
    buildconfig_smali = os.path.join(build_dir, "smali_classes2/in/plantme/app/BuildConfig.smali")
    if os.path.exists(buildconfig_smali):
        with open(buildconfig_smali, "r") as f:
            smali = f.read()
        smali = smali.replace('"in.plantme.app"', f'"{app["package"]}"')
        with open(buildconfig_smali, "w") as f:
            f.write(smali)
            
    # 4. Update Icons
    update_android_icons(build_dir, app["icon_src"])
    
    # 5. Inject JavaScript Bundle and Assets
    dest_bundle = os.path.join(build_dir, "assets/index.android.bundle")
    shutil.copy2(app["android_bundle"], dest_bundle)
    
    # Copy all assets
    dest_assets = os.path.join(build_dir, "assets")
    for f in os.listdir(app["android_assets"]):
        src_f = os.path.join(app["android_assets"], f)
        if os.path.isfile(src_f):
            shutil.copy2(src_f, os.path.join(dest_assets, f))
            
    # 6. Build APK with apktool
    unaligned_apk = f"/tmp/{app['id']}_unaligned.apk"
    if os.path.exists(unaligned_apk):
        os.remove(unaligned_apk)
    run(["apktool", "b", build_dir, "-o", unaligned_apk])
    
    # 7. Zipalign (4-byte alignment, page align uncompressed shared objects)
    aligned_apk = f"/tmp/{app['id']}_aligned.apk"
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)
    zipalign_bin = os.path.join(BUILD_TOOLS, "zipalign")
    run([zipalign_bin, "-p", "-f", "-v", "4", unaligned_apk, aligned_apk])
    
    # 8. Sign with apksigner (v1, v2, v3)
    final_apk = f"/tmp/{app['apk_name']}"
    if os.path.exists(final_apk):
        os.remove(final_apk)
    apksigner_bin = os.path.join(BUILD_TOOLS, "apksigner")
    run([
        apksigner_bin, "sign",
        "--ks", KEYSTORE,
        "--ks-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        "--key-pass", "pass:android",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        "--out", final_apk,
        aligned_apk
    ])
    
    # 9. Verify Signature
    verify_out = run([apksigner_bin, "verify", "-v", final_apk])
    print(f"apksigner verification:\n{verify_out.strip()}")
    
    # 10. Check badging
    aapt2_bin = os.path.join(BUILD_TOOLS, "aapt2")
    badging_out = run([aapt2_bin, "dump", "badging", final_apk])
    for line in badging_out.splitlines()[:10]:
        print(f"  {line}")
        
    # 11. Check resources.arsc compression
    unzip_out = subprocess.run(["unzip", "-v", final_apk, "resources.arsc"], capture_output=True, text=True).stdout
    print(f"resources.arsc status:\n{unzip_out.strip()}")
    
    return final_apk

def build_ipa(app):
    print(f"\n==========================================")
    print(f"Building IPA for: {app['name']} ({app['package']})")
    print(f"==========================================")
    
    extract_dir = f"/tmp/build_ipa_{app['id']}"
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    os.makedirs(extract_dir, exist_ok=True)
    
    # Extract base IPA
    subprocess.run(["unzip", "-q", BASE_IPA, "-d", extract_dir], check=True)
    
    app_dir = os.path.join(extract_dir, "Payload/PlantMe.app")
    if not os.path.exists(app_dir):
        # find .app
        for d in os.listdir(os.path.join(extract_dir, "Payload")):
            if d.endswith(".app"):
                app_dir = os.path.join(extract_dir, "Payload", d)
                break
                
    # Update main.jsbundle
    dest_bundle = os.path.join(app_dir, "main.jsbundle")
    shutil.copy2(app["ios_bundle"], dest_bundle)
    
    # Update Info.plist
    info_plist_path = os.path.join(app_dir, "Info.plist")
    with open(info_plist_path, "rb") as f:
        plist = plistlib.load(f)
        
    plist["CFBundleDisplayName"] = app["name"]
    plist["CFBundleName"] = app["name"]
    plist["CFBundleIdentifier"] = app["package"]
    if "CFBundleURLTypes" in plist and len(plist["CFBundleURLTypes"]) > 0:
        plist["CFBundleURLTypes"][0]["CFBundleURLSchemes"] = [app["scheme"]]
        
    with open(info_plist_path, "wb") as f:
        plistlib.dump(plist, f)
        
    # Update iOS App Icons
    im = Image.open(app["icon_src"]).convert("RGBA")
    for icon_file in glob.glob(os.path.join(app_dir, "AppIcon*")):
        try:
            old_im = Image.open(icon_file)
            sz = old_im.size
            im.resize(sz, Image.Resampling.LANCZOS).save(icon_file, "PNG")
        except Exception:
            pass
            
    final_ipa = f"/tmp/{app['ipa_name']}"
    if os.path.exists(final_ipa):
        os.remove(final_ipa)
        
    cmd = f"cd '{extract_dir}' && zip -r -y -q '{final_ipa}' Payload/"
    subprocess.run(cmd, shell=True, check=True)
    print(f"Created {final_ipa} ({os.path.getsize(final_ipa)} bytes)")
    return final_ipa

def main():
    print("=== DECODING BASE APK ===")
    base_decoded = "/tmp/base_apk_clean"
    if not os.path.exists(base_decoded):
        run(["apktool", "d", "-f", BASE_APK, "-o", base_decoded])
    print(f"Base APK ready at {base_decoded}")
    
    dests = [
        os.path.join(WORKSPACE, "mobile/dist-builds"),
        os.path.join(WORKSPACE, "client/dist/downloads"),
        os.path.join(WORKSPACE, "client/public/downloads")
    ]
    for d in dests:
        os.makedirs(d, exist_ok=True)
        
    for app in APPS:
        apk_path = build_apk(app, base_decoded)
        ipa_path = build_ipa(app)
        
        for d in dests:
            shutil.copy2(apk_path, os.path.join(d, app["apk_name"]))
            shutil.copy2(ipa_path, os.path.join(d, app["ipa_name"]))
            print(f"Saved {app['apk_name']} and {app['ipa_name']} to {d}")
            
    print("\n=== ALL APKS AND IPAS BUILT SUCCESSFULLY! ===")

if __name__ == "__main__":
    main()
