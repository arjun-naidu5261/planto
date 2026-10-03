# 🌿 PlantMe 3-Way Ecosystem & Central Command Architecture

> **Official Master System Architecture & Build Release Specification**  
> *Separate Standalone Mobile Apps: PlantMe (Customer), Nursery Store (Vendor), Delivery Partner (Rider).*

---

## 🏛️ 1. Platform Matrix & Separate Projects

```
                                    ┌───────────────────────────────────┐
                                    │    PLANTME CENTRAL REST ENGINE    │
                                    │     (Node.js Express / Port 5002) │
                                    └─────────────────┬─────────────────┘
                                                      │
              ┌──────────────────────────┬────────────┴─────────────┬──────────────────────────┐
              ▼                          ▼                          ▼                          ▼
   ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
   │ 🛍️ PlantMe          │    │ 🏬 Nursery Store    │    │ 🛵 Delivery Partner │    │ ⚙️ Admin Portal     │
   │ (Customer App)      │    │ (Vendor App)        │    │ (Rider App)         │    │ (Platform Command)  │
   ├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
   │ • Web Portal (Vite) │    │ • Mobile App Only   │    │ • Mobile App Only   │    │ • Web Portal Only   │
   │ • Mobile (iOS/Andr) │    │ • (Android & iOS)   │    │ • (Android & iOS)   │    │ • (React Dashboard) │
   │ • Shop, Cart, Track │    │ • Camera, Inventory │    │ • GPS, Duty, OTP    │    │ • Fleet & GMV Stats │
   │ Location: `client/` │    │ Location:           │    │ Location:           │    │ Location:           │
   │ & `mobile/`         │    │ `mobile-vendor/`    │    │ `mobile-delivery/`  │    │ `client/` at /admin │
   └─────────────────────┘    └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

---

## 📦 2. Generated Installation Binaries (Android APK & iOS IPA)

| Application Name | Target Persona | Platform | Binary File Name | Local File Path | Web HTTP Download |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PlantMe** | 🛍️ Customer | **Android** | `plantme-customer.apk` (90 MB) | [`mobile/dist-builds/plantme-customer.apk`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile/dist-builds/plantme-customer.apk) | [`/downloads/plantme-customer.apk`](http://localhost:5173/downloads/plantme-customer.apk) |
| **PlantMe** | 🛍️ Customer | **iOS** | `plantme-customer.ipa` (44 MB) | [`mobile/dist-builds/plantme-customer.ipa`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile/dist-builds/plantme-customer.ipa) | [`/downloads/plantme-customer.ipa`](http://localhost:5173/downloads/plantme-customer.ipa) |
| **Nursery Store** | 🏬 Vendor | **Android** | `nursery-store-vendor.apk` (90 MB) | [`mobile/dist-builds/nursery-store-vendor.apk`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile/dist-builds/nursery-store-vendor.apk) | [`/downloads/nursery-store-vendor.apk`](http://localhost:5173/downloads/nursery-store-vendor.apk) |
| **Nursery Store** | 🏬 Vendor | **iOS** | `nursery-store-vendor.ipa` (44 MB) | [`mobile/dist-builds/nursery-store-vendor.ipa`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile/dist-builds/nursery-store-vendor.ipa) | [`/downloads/nursery-store-vendor.ipa`](http://localhost:5173/downloads/nursery-store-vendor.ipa) |
| **Delivery Partner** | 🛵 Rider Hero | **Android** | `delivery-partner.apk` (90 MB) | [`mobile/dist-builds/delivery-partner.apk`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile/dist-builds/delivery-partner.apk) | [`/downloads/delivery-partner.apk`](http://localhost:5173/downloads/delivery-partner.apk) |
| **Delivery Partner** | 🛵 Rider Hero | **iOS** | `delivery-partner.ipa` (44 MB) | [`mobile/dist-builds/delivery-partner.ipa`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile/dist-builds/delivery-partner.ipa) | [`/downloads/delivery-partner.ipa`](http://localhost:5173/downloads/delivery-partner.ipa) |

---

## 📱 3. Separate Standalone Mobile Projects

### **1. 🛍️ Customer App — PlantMe ([`mobile/`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile/App.tsx))**
* **Bundle ID:** `in.plantme.customer`
* **Features:** Live Plant Shop, 20-min checkout, AI Doctor plant diagnostics scanner, Live GPS Order Tracking with **Customer Doorstep OTP** (e.g. `8401`), Profile, Wallet, Reminders.

### **2. 🏬 Nursery Vendor App — Nursery Store ([`mobile-vendor/`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile-vendor/App.tsx))**
* **Bundle ID:** `in.plantme.vendor`
* **Features:**
  * **📸 Live Device Camera Integration (`expo-image-picker`)**: Snap photos of live foliage and pots directly into listings.
  * **➕ Add Plant Products**: Set name, category, price in ₹, stock count, description, and upload camera photos to live catalog.
  * **🗑️ Delete Products**: 1-Tap removal with confirmation dialog and catalog synchronization.
  * **🏪 Store Status Switch**: Toggle `🟢 OPEN` / `🔴 CLOSED`.
  * **🔐 4-Digit Pickup PIN Verification Modal**: Nursery staff enters Rider's PIN (`2918`) before handing over crates.
  * **💰 Payouts & Settlement Ledger**: Daily earnings, platform commission (10%), and bank withdrawal.

### **3. 🛵 Delivery Partner App — Delivery Partner ([`mobile-delivery/`](file:///Users/futureforbespvtltd/Desktop/Planto/mobile-delivery/App.tsx))**
* **Bundle ID:** `in.plantme.delivery`
* **Features:**
  * **🟢 Duty Switch**: Online / Offline toggle with real-time dispatch synchronization.
  * **⚡ 30-Second Flash Trip Cards**: Route breakdown, distance, and earnings (+₹60).
  * **🗺️ 1-Tap Navigation**: Deep links to Google Maps / Apple Maps.
  * **🔢 4-Digit Pickup PIN Display (`2918`)**: Presented to nursery storekeeper upon arrival.
  * **🌱 Plant Care & Safety Checklist**: Pot upright, root moisture secured.
  * **📍 Live GPS Telemetry Broadcaster**: Streams location every 3.5s to customer live map.
  * **🔐 Customer Doorstep OTP Verification (`8401`)**: Validates customer code at delivery and credits +₹60 to rider's wallet.

---

## 🔐 4. Test Credentials Summary

| App Name | Role | Login Email | Password | Access Location |
| :--- | :--- | :--- | :--- | :--- |
| **PlantMe** | 🛍️ Customer | `customer@plantme.in` | `plantme123` | `mobile/` & Web (`/`) |
| **Nursery Store** | 🏬 Nursery Vendor | `vendor@plantme.in` | `vendor123` | `mobile-vendor/` |
| **Delivery Partner** | 🛵 Delivery Hero | `delivery@plantme.in` | `delivery123` | `mobile-delivery/` |
| **Platform Command**| ⚙️ Platform Admin | `admin@plantme.in` | `admin123` | Web Portal Only (`/admin`) |

---

## 🧪 5. Live Handshake Test Walkthrough

```
1. Active Order: ORD-8920 (Indiranagar Nursery ➔ Customer Suhas K.)
2. Open Delivery Partner App  ──► See Pickup PIN: [ 2918 ]
3. Open Nursery Store App     ──► Enter PIN [ 2918 ] ──► Handover Confirmed (Status: Picked Up)
4. Open PlantMe Customer App  ──► View Live Map & Doorstep OTP: [ 8401 ]
5. In Delivery Partner App    ──► Enter Customer OTP [ 8401 ] ──► Order Delivered (+₹60 Credited)
```
