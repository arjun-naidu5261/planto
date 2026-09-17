import SwiftUI

struct LoginView: View {
    @ObservedObject var vm: DeliveryViewModel
    @State private var showRegister = false

    var body: some View {
        ZStack {
            // ── Background ────────────────────────────────────────────────────
            DTheme.bg.ignoresSafeArea()

            // Top radial glow
            RadialGradient(
                colors: [DTheme.emerald.opacity(0.14), .clear],
                center: .top, startRadius: 0, endRadius: 500
            )
            .ignoresSafeArea()

            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 0) {

                    // ── Hero / Brand ──────────────────────────────────────────
                    VStack(spacing: 16) {
                        ZStack {
                            // Pulsing outer ring
                            Circle()
                                .stroke(DTheme.gradientEmerald, lineWidth: 1.5)
                                .frame(width: 108, height: 108)
                                .opacity(0.5)
                                .blur(radius: 3)

                            Circle()
                                .fill(DTheme.surfaceRaised)
                                .frame(width: 100, height: 100)

                            Image(systemName: "bicycle.circle.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 54, height: 54)
                                .foregroundStyle(DTheme.gradientEmerald)
                        }
                        .padding(.top, 24)

                        VStack(spacing: 6) {
                            Text("PLANTO DELIVERY")
                                .font(.system(size: 12, weight: .heavy, design: .monospaced))
                                .foregroundColor(DTheme.gold)
                                .tracking(4)

                            Text("Partner Portal")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [DTheme.emeraldLight, DTheme.emerald],
                                        startPoint: .leading, endPoint: .trailing
                                    )
                                )

                            Text("Sign in to manage orders & earnings")
                                .font(.system(size: 14))
                                .foregroundColor(DTheme.textSecondary)
                        }
                        .multilineTextAlignment(.center)
                    }
                    .padding(.bottom, 20)

                    // ── Login Card ────────────────────────────────────────────
                    DCard(padding: 24) {
                        VStack(spacing: 20) {

                            DInputField(label: "Email Address", icon: "envelope",
                                        placeholder: "rider@planto.in", text: $vm.loginEmail,
                                        keyboard: .emailAddress)

                            DInputField(label: "Password", icon: "lock",
                                        placeholder: "••••••••", text: $vm.loginPassword,
                                        isSecure: true)

                            DErrorBanner(message: vm.authError)

                            DPrimaryButton(label: "Sign In", icon: "arrow.right.circle.fill",
                                           isLoading: vm.isLoading) {
                                vm.login()
                            }

                            // Divider
                            HStack {
                                Rectangle().fill(DTheme.border).frame(height: 1)
                                Text("OR").font(.system(size: 11, weight: .bold)).foregroundColor(DTheme.textMuted)
                                Rectangle().fill(DTheme.border).frame(height: 1)
                            }

                            // Register CTA
                            Button(action: { showRegister = true }) {
                                HStack(spacing: 8) {
                                    Image(systemName: "person.badge.plus").font(.system(size: 14))
                                    Text("Apply as Delivery Partner")
                                        .font(.system(size: 14, weight: .semibold))
                                }
                                .foregroundColor(DTheme.emeraldLight)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(DTheme.emerald.opacity(0.09))
                                .cornerRadius(14)
                                .overlay(RoundedRectangle(cornerRadius: 14)
                                    .stroke(DTheme.emerald.opacity(0.28), lineWidth: 1))
                            }
                        }
                    }
                    .padding(.horizontal, 20)

                    // ── Demo hint ─────────────────────────────────────────────
                    VStack(spacing: 5) {
                        Text("DEMO LOGIN")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundColor(DTheme.textMuted)
                            .tracking(2)
                        Text("delivery@planto.in  •  any password")
                            .font(.system(size: 12))
                            .foregroundColor(DTheme.textMuted)

                        // Quick-fill demo button
                        Button(action: {
                            vm.loginEmail    = "delivery@planto.in"
                            vm.loginPassword = "planto123"
                        }) {
                            Label("Fill Demo Credentials", systemImage: "wand.and.stars")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(DTheme.emerald)
                        }
                        .padding(.top, 4)
                    }
                    .padding(.top, 24)
                    .padding(.bottom, 60)
                }
            }
        }
        .sheet(isPresented: $showRegister) {
            RegisterView(vm: vm)
        }
    }
}
