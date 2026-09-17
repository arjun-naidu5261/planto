import SwiftUI

public struct DeliveryDashboardView: View {
    @ObservedObject var viewModel: DeliveryAppViewModel
    @State private var showLogoutAlert = false

    public init(viewModel: DeliveryAppViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        ZStack {
            CustomerTheme.bgDark.ignoresSafeArea()

            // Subtle top glow
            RadialGradient(
                gradient: Gradient(colors: [CustomerTheme.accentGold.opacity(0.10), Color.clear]),
                center: .top,
                startRadius: 0,
                endRadius: 350
            )
            .ignoresSafeArea()

            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {

                    // MARK: - Header
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("DELIVERY PARTNER")
                                .font(.system(size: 10, weight: .bold, design: .monospaced))
                                .foregroundColor(CustomerTheme.accentGold)
                                .tracking(3)
                            Text(viewModel.rider?.name ?? "Rider")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(viewModel.isOnline ? CustomerTheme.accentEmerald : Color.gray)
                                    .frame(width: 8, height: 8)
                                Text(viewModel.isOnline ? "Online — Ready to Deliver" : "Offline")
                                    .font(.system(size: 12))
                                    .foregroundColor(viewModel.isOnline ? CustomerTheme.accentMint : CustomerTheme.textMuted)
                            }
                        }
                        Spacer()

                        VStack(spacing: 10) {
                            // Online toggle
                            Toggle("", isOn: $viewModel.isOnline)
                                .toggleStyle(SwitchToggleStyle(tint: CustomerTheme.accentEmerald))
                                .labelsHidden()

                            // Logout
                            Button(action: { showLogoutAlert = true }) {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                    .font(.system(size: 16))
                                    .foregroundColor(CustomerTheme.textMuted)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)

                    // MARK: - Stats Row
                    HStack(spacing: 12) {
                        StatBadge(
                            icon: "indianrupeesign.circle.fill",
                            label: "Earnings",
                            value: "₹\(Int(viewModel.rider?.totalEarnings ?? 4250))",
                            color: CustomerTheme.accentGold
                        )
                        StatBadge(
                            icon: "checkmark.seal.fill",
                            label: "Trips Done",
                            value: "\(viewModel.rider?.completedTrips ?? 42)",
                            color: CustomerTheme.accentEmerald
                        )
                        StatBadge(
                            icon: "star.fill",
                            label: "Rating",
                            value: "4.9 ★",
                            color: CustomerTheme.accentMint
                        )
                    }
                    .padding(.horizontal, 20)

                    // MARK: - Status Banner (if not APPROVED)
                    if let status = viewModel.rider?.status, status != "APPROVED" {
                        HStack(spacing: 10) {
                            Image(systemName: "clock.badge.exclamationmark.fill")
                                .foregroundColor(.orange)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Account Status: \(status)")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.orange)
                                Text("Contact support if you have any questions.")
                                    .font(.system(size: 11))
                                    .foregroundColor(CustomerTheme.textMuted)
                            }
                        }
                        .padding(14)
                        .background(Color.orange.opacity(0.08))
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.orange.opacity(0.2), lineWidth: 1))
                        .padding(.horizontal, 20)
                    }

                    // MARK: - Active Order Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Label("Active Assigned Order", systemImage: "shippingbox.fill")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                            Spacer()
                            Text("IN PROGRESS")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(CustomerTheme.accentEmerald)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(CustomerTheme.accentEmerald.opacity(0.1))
                                .cornerRadius(6)
                        }

                        Divider().background(CustomerTheme.glassBorder)

                        HStack {
                            Text(viewModel.activeOrderId)
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(CustomerTheme.accentMint)
                            Spacer()
                            Text(viewModel.orderPayout + " Payout")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(CustomerTheme.accentGold)
                        }

                        // Pickup
                        HStack(spacing: 10) {
                            Circle().fill(CustomerTheme.accentEmerald).frame(width: 10, height: 10)
                            Text("Pickup: \(viewModel.pickupLocation)")
                                .font(.system(size: 12))
                                .foregroundColor(CustomerTheme.textSecondary)
                        }

                        // Drop
                        HStack(spacing: 10) {
                            Circle().fill(Color.red.opacity(0.8)).frame(width: 10, height: 10)
                            Text("Drop: \(viewModel.dropLocation)")
                                .font(.system(size: 12))
                                .foregroundColor(CustomerTheme.textSecondary)
                        }

                        // Distance indicator
                        HStack {
                            Image(systemName: "location.fill")
                                .font(.system(size: 11))
                                .foregroundColor(CustomerTheme.textMuted)
                            Text(viewModel.distanceKm + " to pickup")
                                .font(.system(size: 12))
                                .foregroundColor(CustomerTheme.textMuted)
                        }

                        // Navigate button
                        Button(action: {}) {
                            HStack(spacing: 8) {
                                Image(systemName: "arrow.triangle.turn.up.right.circle.fill")
                                    .font(.system(size: 16))
                                Text("Navigate to Pickup (\(viewModel.distanceKm))")
                                    .font(.system(size: 14, weight: .bold))
                            }
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 13)
                            .background(CustomerTheme.emeraldGradient)
                            .cornerRadius(13)
                            .shadow(color: CustomerTheme.accentEmerald.opacity(0.3), radius: 8, y: 3)
                        }
                        .padding(.top, 4)

                        // Mark Delivered
                        Button(action: {}) {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle")
                                    .font(.system(size: 14))
                                Text("Mark as Delivered")
                                    .font(.system(size: 13, weight: .semibold))
                            }
                            .foregroundColor(CustomerTheme.accentMint)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 11)
                            .background(CustomerTheme.accentEmerald.opacity(0.08))
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(CustomerTheme.accentEmerald.opacity(0.2), lineWidth: 1)
                            )
                        }
                    }
                    .padding(18)
                    .background(CustomerTheme.cardBg)
                    .cornerRadius(20)
                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                    .padding(.horizontal, 20)

                    // MARK: - Rider Info Card
                    if let rider = viewModel.rider {
                        VStack(alignment: .leading, spacing: 14) {
                            Label("My Profile", systemImage: "person.circle.fill")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)

                            Divider().background(CustomerTheme.glassBorder)

                            riderInfoRow(icon: "envelope", label: "Email", value: rider.email)
                            if let phone = rider.phone { riderInfoRow(icon: "phone", label: "Phone", value: phone) }
                            if let vehicle = rider.vehicle { riderInfoRow(icon: "car.side", label: "Vehicle", value: vehicle) }
                            if let vehicleNum = rider.vehicleNumber { riderInfoRow(icon: "number", label: "Vehicle No.", value: vehicleNum) }
                        }
                        .padding(18)
                        .background(CustomerTheme.cardBg)
                        .cornerRadius(20)
                        .overlay(RoundedRectangle(cornerRadius: 20).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                        .padding(.horizontal, 20)
                    }

                    Spacer().frame(height: 40)
                }
            }
        }
        .alert("Sign Out", isPresented: $showLogoutAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Sign Out", role: .destructive) {
                viewModel.logout()
            }
        } message: {
            Text("Are you sure you want to sign out?")
        }
    }

    func riderInfoRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 13))
                .foregroundColor(CustomerTheme.accentMint)
                .frame(width: 22)
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(CustomerTheme.textSecondary)
                .frame(width: 80, alignment: .leading)
            Text(value)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(CustomerTheme.textPrimary)
            Spacer()
        }
    }
}

// MARK: - Stat Badge
struct StatBadge: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
            Text(value)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(CustomerTheme.textPrimary)
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(CustomerTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(CustomerTheme.cardBg)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(color.opacity(0.15), lineWidth: 1)
        )
    }
}
