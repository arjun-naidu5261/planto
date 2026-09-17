import SwiftUI

struct RoleSelectionView: View {
    @State private var selectedRole: AppRole? = nil

    enum AppRole {
        case customer
        case delivery
    }

    var body: some View {
        ZStack {
            // Deep dark bg
            CustomerTheme.bgDark.ignoresSafeArea()

            // Top radial glow
            RadialGradient(
                gradient: Gradient(colors: [
                    CustomerTheme.accentEmerald.opacity(0.15),
                    Color.clear
                ]),
                center: .top,
                startRadius: 0,
                endRadius: 450
            )
            .ignoresSafeArea()

            if let role = selectedRole {
                // Transition into role
                Group {
                    if role == .customer {
                        PlantMeCustomerApp()
                            .transition(.asymmetric(
                                insertion: .move(edge: .leading).combined(with: .opacity),
                                removal: .opacity
                            ))
                    } else {
                        DeliveryPartnerRootView()
                            .transition(.asymmetric(
                                insertion: .move(edge: .trailing).combined(with: .opacity),
                                removal: .opacity
                            ))
                    }
                }
            } else {
                selectionContent
            }
        }
        .animation(.spring(response: 0.5, dampingFraction: 0.85), value: selectedRole)
    }

    var selectionContent: some View {
        VStack(spacing: 0) {
            Spacer()

            // Logo + branding
            VStack(spacing: 14) {
                ZStack {
                    // Glow ring
                    Circle()
                        .stroke(CustomerTheme.emeraldGradient, lineWidth: 2)
                        .frame(width: 100, height: 100)
                        .blur(radius: 4)
                        .opacity(0.6)

                    Circle()
                        .fill(CustomerTheme.cardBg)
                        .frame(width: 100, height: 100)

                    Image(systemName: "leaf.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 46, height: 46)
                        .foregroundStyle(CustomerTheme.emeraldGradient)
                }

                VStack(spacing: 6) {
                    Text("PLANTO")
                        .font(.system(size: 32, weight: .heavy, design: .rounded))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [CustomerTheme.accentMint, CustomerTheme.accentEmerald],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .tracking(4)

                    Text("Smart Plant & Nursery Marketplace")
                        .font(.system(size: 13))
                        .foregroundColor(CustomerTheme.textSecondary)
                }
            }
            .padding(.bottom, 56)

            // Who are you? label
            VStack(spacing: 6) {
                Text("WHO ARE YOU?")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(CustomerTheme.textMuted)
                    .tracking(3)
                Text("Select your role to continue")
                    .font(.system(size: 14))
                    .foregroundColor(CustomerTheme.textSecondary)
            }
            .padding(.bottom, 24)

            // Role Cards
            VStack(spacing: 16) {
                // Customer card
                RoleCard(
                    icon: "house.fill",
                    title: "I'm a Customer",
                    subtitle: "Order plants & track live delivery",
                    gradient: LinearGradient(
                        colors: [Color(hex: "10B981"), Color(hex: "059669")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    accentColor: CustomerTheme.accentEmerald
                ) {
                    withAnimation { selectedRole = .customer }
                }

                // Delivery card
                RoleCard(
                    icon: "bicycle.circle.fill",
                    title: "I'm a Delivery Partner",
                    subtitle: "Manage orders & track your earnings",
                    gradient: LinearGradient(
                        colors: [Color(hex: "F59E0B"), Color(hex: "D97706")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    accentColor: CustomerTheme.accentGold
                ) {
                    withAnimation { selectedRole = .delivery }
                }
            }
            .padding(.horizontal, 24)

            Spacer()

            // Footer
            Text("© 2026 PLANTO • Bengaluru, India")
                .font(.system(size: 10))
                .foregroundColor(CustomerTheme.textMuted.opacity(0.5))
                .padding(.bottom, 30)
        }
    }
}

// MARK: - Role Card
struct RoleCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let gradient: LinearGradient
    let accentColor: Color
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 18) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(accentColor.opacity(0.12))
                        .frame(width: 64, height: 64)
                    Image(systemName: icon)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 30, height: 30)
                        .foregroundStyle(gradient)
                }

                VStack(alignment: .leading, spacing: 5) {
                    Text(title)
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(CustomerTheme.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right.circle.fill")
                    .font(.system(size: 22))
                    .foregroundStyle(gradient)
                    .opacity(0.7)
            }
            .padding(18)
            .background(CustomerTheme.cardBg)
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(accentColor.opacity(0.2), lineWidth: 1)
            )
            .scaleEffect(isPressed ? 0.97 : 1.0)
            .shadow(color: accentColor.opacity(0.1), radius: 12, y: 4)
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in withAnimation(.easeInOut(duration: 0.1)) { isPressed = true } }
                .onEnded { _ in withAnimation(.easeInOut(duration: 0.15)) { isPressed = false } }
        )
    }
}
