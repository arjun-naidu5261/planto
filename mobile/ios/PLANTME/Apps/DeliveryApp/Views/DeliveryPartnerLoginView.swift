import SwiftUI

public struct DeliveryPartnerLoginView: View {
    @ObservedObject var viewModel: DeliveryAppViewModel
    @State private var showRegister = false
    @State private var showPassword = false

    public init(viewModel: DeliveryAppViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        ZStack {
            // Background
            CustomerTheme.bgDark.ignoresSafeArea()

            // Subtle radial glow
            RadialGradient(
                gradient: Gradient(colors: [
                    CustomerTheme.accentEmerald.opacity(0.12),
                    Color.clear
                ]),
                center: .top,
                startRadius: 0,
                endRadius: 400
            )
            .ignoresSafeArea()

            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 0) {
                    // Header / Logo
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(CustomerTheme.emeraldGradient.opacity(0.18))
                                .frame(width: 90, height: 90)
                            Image(systemName: "bicycle.circle.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 50, height: 50)
                                .foregroundColor(CustomerTheme.accentEmerald)
                        }
                        .padding(.top, 60)

                        Text("PLANTO")
                            .font(.system(size: 13, weight: .heavy, design: .monospaced))
                            .foregroundColor(CustomerTheme.accentGold)
                            .tracking(6)

                        Text("Delivery Partner")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)

                        Text("Sign in to your fleet account")
                            .font(.system(size: 14))
                            .foregroundColor(CustomerTheme.textSecondary)
                    }
                    .padding(.bottom, 40)

                    // Login Card
                    VStack(spacing: 20) {
                        // Email
                        VStack(alignment: .leading, spacing: 8) {
                            Label("Email Address", systemImage: "envelope")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(CustomerTheme.textSecondary)

                            TextField("rider@example.com", text: $viewModel.loginEmail)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 13)
                                .background(CustomerTheme.cardBgElevated)
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(CustomerTheme.glassBorderActive, lineWidth: 1)
                                )
                                .foregroundColor(CustomerTheme.textPrimary)
                        }

                        // Password
                        VStack(alignment: .leading, spacing: 8) {
                            Label("Password", systemImage: "lock")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(CustomerTheme.textSecondary)

                            HStack {
                                Group {
                                    if showPassword {
                                        TextField("••••••••", text: $viewModel.loginPassword)
                                    } else {
                                        SecureField("••••••••", text: $viewModel.loginPassword)
                                    }
                                }
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                                .foregroundColor(CustomerTheme.textPrimary)

                                Button(action: { showPassword.toggle() }) {
                                    Image(systemName: showPassword ? "eye.slash" : "eye")
                                        .foregroundColor(CustomerTheme.textMuted)
                                        .font(.system(size: 14))
                                }
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 13)
                            .background(CustomerTheme.cardBgElevated)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(CustomerTheme.glassBorderActive, lineWidth: 1)
                            )
                        }

                        // Error message
                        if !viewModel.loginError.isEmpty {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.orange)
                                    .font(.system(size: 13))
                                Text(viewModel.loginError)
                                    .font(.system(size: 13))
                                    .foregroundColor(.orange)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(12)
                            .background(Color.orange.opacity(0.08))
                            .cornerRadius(10)
                        }

                        // Login button
                        Button(action: { viewModel.login() }) {
                            HStack(spacing: 10) {
                                if viewModel.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                        .scaleEffect(0.85)
                                } else {
                                    Image(systemName: "arrow.right.circle.fill")
                                        .font(.system(size: 18))
                                }
                                Text(viewModel.isLoading ? "Signing In…" : "Sign In")
                                    .font(.system(size: 16, weight: .bold))
                            }
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 15)
                            .background(
                                viewModel.isLoading
                                    ? AnyView(Color.gray.opacity(0.6))
                                    : AnyView(CustomerTheme.emeraldGradient)
                            )
                            .cornerRadius(14)
                            .shadow(color: CustomerTheme.accentEmerald.opacity(0.35), radius: 10, y: 4)
                        }
                        .disabled(viewModel.isLoading)
                        .animation(.easeInOut(duration: 0.2), value: viewModel.isLoading)

                        // Divider
                        HStack {
                            Rectangle().fill(CustomerTheme.glassBorder).frame(height: 1)
                            Text("or").font(.system(size: 12)).foregroundColor(CustomerTheme.textMuted)
                            Rectangle().fill(CustomerTheme.glassBorder).frame(height: 1)
                        }

                        // Register CTA
                        Button(action: { showRegister = true }) {
                            HStack(spacing: 6) {
                                Image(systemName: "person.badge.plus")
                                    .font(.system(size: 14))
                                Text("Register as a Delivery Partner")
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            .foregroundColor(CustomerTheme.accentMint)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(CustomerTheme.accentEmerald.opacity(0.08))
                            .cornerRadius(14)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(CustomerTheme.accentEmerald.opacity(0.25), lineWidth: 1)
                            )
                        }
                    }
                    .padding(24)
                    .background(CustomerTheme.cardBg)
                    .cornerRadius(24)
                    .overlay(
                        RoundedRectangle(cornerRadius: 24)
                            .stroke(CustomerTheme.glassBorder, lineWidth: 1)
                    )
                    .padding(.horizontal, 20)

                    // Demo credentials hint
                    VStack(spacing: 6) {
                        Text("Demo Credentials")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(CustomerTheme.textMuted)
                        Text("Email: delivery@planto.in  •  Any password")
                            .font(.system(size: 11))
                            .foregroundColor(CustomerTheme.textMuted)
                    }
                    .padding(.top, 24)
                    .padding(.bottom, 50)
                }
            }
        }
        .sheet(isPresented: $showRegister) {
            DeliveryPartnerRegisterView(viewModel: viewModel)
        }
    }
}
