import SwiftUI

struct DashboardView: View {
    @ObservedObject var vm: DeliveryViewModel
    @State private var selectedTab: DTab = .home
    @State private var showLogoutAlert = false

    enum DTab { case home, orders, earnings, profile }

    var body: some View {
        ZStack(alignment: .bottom) {
            DTheme.bg.ignoresSafeArea()

            Group {
                switch selectedTab {
                case .home:     HomeTab(vm: vm)
                case .orders:   OrdersTab(vm: vm)
                case .earnings: EarningsTab(vm: vm)
                case .profile:  ProfileTab(vm: vm, showLogoutAlert: $showLogoutAlert)
                }
            }
            .padding(.bottom, 90)

            // ── Bottom Tab Bar ────────────────────────────────────────────────
            HStack(spacing: 0) {
                tabBtn(.home,     icon: "house.fill",          label: "Home")
                tabBtn(.orders,   icon: "list.bullet.clipboard", label: "Orders")
                tabBtn(.earnings, icon: "indianrupeesign.circle.fill", label: "Earnings")
                tabBtn(.profile,  icon: "person.fill",         label: "Profile")
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 12)
            .background(.ultraThinMaterial.opacity(0.95))
            .background(DTheme.surfaceRaised)
            .cornerRadius(28)
            .overlay(RoundedRectangle(cornerRadius: 28).stroke(DTheme.border, lineWidth: 1))
            .padding(.horizontal, 16)
            .padding(.bottom, 20)
            .shadow(color: .black.opacity(0.4), radius: 20, y: 8)
        }
        .alert("Sign Out", isPresented: $showLogoutAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Sign Out", role: .destructive) { vm.logout() }
        } message: {
            Text("Are you sure you want to sign out of PLANTO Delivery?")
        }
    }

    func tabBtn(_ tab: DTab, icon: String, label: String) -> some View {
        let active = selectedTab == tab
        return Button(action: { withAnimation(.spring(response: 0.3)) { selectedTab = tab }}) {
            VStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundStyle(active
                        ? AnyShapeStyle(DTheme.gradientEmerald)
                        : AnyShapeStyle(DTheme.textMuted)
                    )
                    .scaleEffect(active ? 1.1 : 1.0)
                    .animation(.spring(response: 0.25), value: active)
                Text(label)
                    .font(.system(size: 10, weight: active ? .bold : .medium))
                    .foregroundColor(active ? DTheme.emeraldLight : DTheme.textMuted)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Home Tab
struct HomeTab: View {
    @ObservedObject var vm: DeliveryViewModel

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 22) {

                // ── Top bar ───────────────────────────────────────────────────
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("PLANTO DELIVERY")
                            .font(.system(size: 10, weight: .heavy, design: .monospaced))
                            .foregroundColor(DTheme.gold)
                            .tracking(3)
                        Text("Hello, \(vm.rider?.name.components(separatedBy: " ").first ?? "Rider") 👋")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(DTheme.textPrimary)
                    }
                    Spacer()

                    // Online toggle pill
                    HStack(spacing: 8) {
                        Circle()
                            .fill(vm.isOnline ? DTheme.emerald : Color.gray)
                            .frame(width: 8, height: 8)
                        Text(vm.isOnline ? "Online" : "Offline")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(vm.isOnline ? DTheme.emeraldLight : DTheme.textMuted)
                        Toggle("", isOn: $vm.isOnline)
                            .toggleStyle(SwitchToggleStyle(tint: DTheme.emerald))
                            .labelsHidden()
                            .scaleEffect(0.85)
                    }
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(DTheme.surface)
                    .cornerRadius(20)
                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(DTheme.border, lineWidth: 1))
                }
                .padding(.horizontal, 20)
                .padding(.top, 60)

                // ── Stats row ─────────────────────────────────────────────────
                HStack(spacing: 12) {
                    DStatTile(icon: "indianrupeesign.circle.fill",
                              value: "₹\(Int(vm.rider?.totalEarnings ?? 4250))",
                              label: "Total Earned", color: DTheme.gold)
                    DStatTile(icon: "checkmark.seal.fill",
                              value: "\(vm.rider?.completedTrips ?? 42)",
                              label: "Trips Done", color: DTheme.emerald)
                    DStatTile(icon: "star.fill",
                              value: "4.9 ★",
                              label: "Rating", color: DTheme.emeraldLight)
                }
                .padding(.horizontal, 20)

                // ── Active order ──────────────────────────────────────────────
                if let order = vm.activeOrder {
                    ActiveOrderCard(order: order, vm: vm)
                        .padding(.horizontal, 20)
                } else {
                    // No order state
                    DCard {
                        HStack(spacing: 16) {
                            Image(systemName: "timer")
                                .font(.system(size: 36))
                                .foregroundStyle(DTheme.gradientEmerald)
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Waiting for Orders")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(DTheme.textPrimary)
                                Text("Stay online to receive new delivery assignments.")
                                    .font(.system(size: 12))
                                    .foregroundColor(DTheme.textSecondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }

                // ── Today summary ─────────────────────────────────────────────
                VStack(alignment: .leading, spacing: 14) {
                    DSectionHeader(icon: "calendar.badge.clock", title: "Today's Summary")

                    HStack(spacing: 12) {
                        summaryTile(icon: "bolt.fill",        value: "3",    label: "Trips", color: DTheme.emerald)
                        summaryTile(icon: "clock",            value: "2h 14m", label: "Online", color: DTheme.gold)
                        summaryTile(icon: "fuelpump.fill",    value: "18 km", label: "Distance", color: DTheme.emeraldLight)
                    }
                }
                .padding(.horizontal, 20)

                // ── Perks banner ──────────────────────────────────────────────
                perksBanner
                    .padding(.horizontal, 20)

                Spacer().frame(height: 20)
            }
        }
    }

    func summaryTile(icon: String, value: String, label: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 18)).foregroundColor(color)
            Text(value).font(.system(size: 15, weight: .bold)).foregroundColor(DTheme.textPrimary)
            Text(label).font(.system(size: 10)).foregroundColor(DTheme.textSecondary)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 14)
        .background(DTheme.surface)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(color.opacity(0.15), lineWidth: 1))
    }

    var perksBanner: some View {
        HStack(spacing: 14) {
            Image(systemName: "gift.fill")
                .font(.system(size: 26))
                .foregroundStyle(DTheme.gradientGold)
            VStack(alignment: .leading, spacing: 4) {
                Text("Complete 5 more trips today!")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(DTheme.textPrimary)
                Text("Earn a ₹200 bonus reward 🎁")
                    .font(.system(size: 12))
                    .foregroundColor(DTheme.gold)
            }
            Spacer()
        }
        .padding(16)
        .background(
            LinearGradient(colors: [DTheme.gold.opacity(0.12), DTheme.amber.opacity(0.05)],
                           startPoint: .leading, endPoint: .trailing)
        )
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(DTheme.borderGold, lineWidth: 1))
    }
}

// MARK: - Active Order Card
struct ActiveOrderCard: View {
    let order: ActiveOrder
    @ObservedObject var vm: DeliveryViewModel

    var body: some View {
        DCard(borderColor: DTheme.borderActive) {
            VStack(spacing: 14) {
                // Header
                HStack {
                    HStack(spacing: 8) {
                        Image(systemName: order.status.icon)
                            .foregroundStyle(DTheme.gradientEmerald)
                        Text(order.status.label)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(DTheme.emeraldLight)
                    }
                    Spacer()
                    Text("ACTIVE ORDER")
                        .font(.system(size: 9, weight: .heavy, design: .monospaced))
                        .foregroundColor(DTheme.gold)
                        .tracking(2)
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(DTheme.gold.opacity(0.1))
                        .cornerRadius(6)
                }

                Divider().background(DTheme.border)

                // Order ID + payout
                HStack {
                    Text(order.id)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(DTheme.emeraldLight)
                    Spacer()
                    Text(order.payout + " Payout")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(DTheme.gold)
                }

                // Route
                VStack(spacing: 10) {
                    HStack(spacing: 12) {
                        Circle().fill(DTheme.emerald).frame(width: 10, height: 10)
                        VStack(alignment: .leading, spacing: 1) {
                            Text("PICKUP").font(.system(size: 9, weight: .bold)).foregroundColor(DTheme.textMuted).tracking(1)
                            Text(order.pickup).font(.system(size: 13)).foregroundColor(DTheme.textSecondary)
                        }
                    }
                    // Dashed connector
                    HStack {
                        Spacer().frame(width: 4)
                        VStack(spacing: 3) { ForEach(0..<4, id: \.self) { _ in Rectangle().fill(DTheme.border).frame(width: 2, height: 5) } }
                        Spacer()
                    }
                    HStack(spacing: 12) {
                        Circle().fill(DTheme.red).frame(width: 10, height: 10)
                        VStack(alignment: .leading, spacing: 1) {
                            Text("DROP").font(.system(size: 9, weight: .bold)).foregroundColor(DTheme.textMuted).tracking(1)
                            Text(order.drop).font(.system(size: 13)).foregroundColor(DTheme.textSecondary)
                        }
                    }
                }

                // Distance chip
                HStack {
                    Label(order.distanceKm, systemImage: "location.fill")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(DTheme.textMuted)
                    Spacer()
                }

                // Action buttons
                VStack(spacing: 10) {
                    if order.status == .assigned {
                        DPrimaryButton(label: "Navigate to Pickup (\(order.distanceKm))",
                                       icon: "arrow.triangle.turn.up.right.circle.fill",
                                       isLoading: false) {}

                        Button(action: { vm.advanceOrderStatus() }) {
                            HStack(spacing: 8) {
                                Image(systemName: "bicycle").font(.system(size: 14))
                                Text("Mark as Picked Up")
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            .foregroundColor(DTheme.emeraldLight)
                            .frame(maxWidth: .infinity).padding(.vertical, 12)
                            .background(DTheme.emerald.opacity(0.1))
                            .cornerRadius(13)
                            .overlay(RoundedRectangle(cornerRadius: 13).stroke(DTheme.emerald.opacity(0.25), lineWidth: 1))
                        }
                    } else if order.status == .pickedUp {
                        DPrimaryButton(label: "Navigate to Drop-off",
                                       icon: "arrow.triangle.turn.up.right.circle.fill",
                                       isLoading: false) {}

                        Button(action: { vm.advanceOrderStatus() }) {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle.fill").font(.system(size: 14))
                                Text("Mark as Delivered")
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            .foregroundColor(DTheme.gold)
                            .frame(maxWidth: .infinity).padding(.vertical, 12)
                            .background(DTheme.gold.opacity(0.1))
                            .cornerRadius(13)
                            .overlay(RoundedRectangle(cornerRadius: 13).stroke(DTheme.borderGold, lineWidth: 1))
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Orders Tab
struct OrdersTab: View {
    @ObservedObject var vm: DeliveryViewModel

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 18) {
                sectionTitle("Orders")

                if vm.recentOrders.isEmpty {
                    emptyState(icon: "list.bullet.clipboard", message: "No completed orders yet.")
                } else {
                    ForEach(vm.recentOrders) { order in
                        DCard {
                            HStack(spacing: 14) {
                                ZStack {
                                    Circle().fill(DTheme.emerald.opacity(0.1)).frame(width: 44, height: 44)
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(DTheme.emerald).font(.system(size: 20))
                                }
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(order.id).font(.system(size: 14, weight: .bold)).foregroundColor(DTheme.emeraldLight)
                                    Text(order.pickup).font(.system(size: 12)).foregroundColor(DTheme.textSecondary).lineLimit(1)
                                    Text("→ " + order.drop).font(.system(size: 12)).foregroundColor(DTheme.textMuted).lineLimit(1)
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 4) {
                                    Text(order.payout).font(.system(size: 14, weight: .bold)).foregroundColor(DTheme.gold)
                                    Text(order.distanceKm).font(.system(size: 11)).foregroundColor(DTheme.textMuted)
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
                Spacer().frame(height: 20)
            }
        }
    }
}

// MARK: - Earnings Tab
struct EarningsTab: View {
    @ObservedObject var vm: DeliveryViewModel

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                sectionTitle("Earnings")

                // Big earning card
                DCard(borderColor: DTheme.borderGold) {
                    VStack(spacing: 18) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("TOTAL EARNINGS")
                                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                                    .foregroundColor(DTheme.textMuted).tracking(2)
                                Text("₹\(Int(vm.rider?.totalEarnings ?? 4250))")
                                    .font(.system(size: 40, weight: .heavy))
                                    .foregroundStyle(DTheme.gradientGold)
                            }
                            Spacer()
                            Image(systemName: "indianrupeesign.circle.fill")
                                .font(.system(size: 50))
                                .foregroundStyle(DTheme.gradientGold)
                                .opacity(0.6)
                        }

                        Divider().background(DTheme.border)

                        HStack(spacing: 0) {
                            earningSegment(label: "Today",   value: "₹415")
                            Divider().frame(height: 40).background(DTheme.border)
                            earningSegment(label: "This Week",  value: "₹2,840")
                            Divider().frame(height: 40).background(DTheme.border)
                            earningSegment(label: "This Month", value: "₹4,250")
                        }
                    }
                }
                .padding(.horizontal, 20)

                // Breakdown
                DSectionHeader(icon: "chart.bar.fill", title: "Trip Breakdown")
                    .padding(.horizontal, 20)

                ForEach(vm.recentOrders) { order in
                    HStack {
                        Text(order.id).font(.system(size: 13, weight: .semibold)).foregroundColor(DTheme.textPrimary)
                        Spacer()
                        Text(order.payout).font(.system(size: 14, weight: .bold)).foregroundColor(DTheme.gold)
                    }
                    .padding(.horizontal, 20).padding(.vertical, 10)
                    .background(DTheme.surface)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(DTheme.border, lineWidth: 1))
                    .padding(.horizontal, 20)
                }

                Spacer().frame(height: 20)
            }
        }
    }

    func earningSegment(label: String, value: String) -> some View {
        VStack(spacing: 5) {
            Text(value).font(.system(size: 15, weight: .bold)).foregroundColor(DTheme.textPrimary)
            Text(label).font(.system(size: 10)).foregroundColor(DTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Profile Tab
struct ProfileTab: View {
    @ObservedObject var vm: DeliveryViewModel
    @Binding var showLogoutAlert: Bool

    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 20) {
                sectionTitle("My Profile")

                // Avatar + name
                VStack(spacing: 12) {
                    ZStack {
                        Circle().fill(DTheme.gradientEmerald).frame(width: 90, height: 90)
                        Text(String(vm.rider?.name.prefix(1) ?? "R"))
                            .font(.system(size: 38, weight: .bold)).foregroundColor(.black)
                    }
                    Text(vm.rider?.name ?? "Rider")
                        .font(.system(size: 22, weight: .bold)).foregroundColor(DTheme.textPrimary)
                    Text("Delivery Partner • \(vm.rider?.vehicle ?? "Electric Scooter")")
                        .font(.system(size: 13)).foregroundColor(DTheme.textSecondary)

                    // Status badge
                    let status = vm.rider?.approvalStatus ?? .approved
                    Text(status.label)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(status.isActive ? DTheme.emerald : .orange)
                        .padding(.horizontal, 12).padding(.vertical, 5)
                        .background((status.isActive ? DTheme.emerald : Color.orange).opacity(0.1))
                        .cornerRadius(20)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
                .background(DTheme.surface)
                .cornerRadius(20)
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(DTheme.border, lineWidth: 1))
                .padding(.horizontal, 20)

                // Details card
                DCard {
                    VStack(spacing: 14) {
                        profileRow(icon: "envelope",               label: "Email",       value: vm.rider?.email ?? "—")
                        if let p = vm.rider?.phone          { profileRow(icon: "phone",               label: "Phone",       value: p) }
                        if let v = vm.rider?.vehicle        { profileRow(icon: "car.side",            label: "Vehicle",     value: v) }
                        if let n = vm.rider?.vehicleNumber  { profileRow(icon: "number",              label: "Vehicle No.", value: n) }
                        if let d = vm.rider?.drivingLicense { profileRow(icon: "creditcard",          label: "DL Number",   value: d) }
                        if let a = vm.rider?.aadhaar        { profileRow(icon: "person.text.rectangle", label: "Aadhaar",   value: a) }
                    }
                }
                .padding(.horizontal, 20)

                // Logout button
                Button(action: { showLogoutAlert = true }) {
                    HStack(spacing: 10) {
                        Image(systemName: "rectangle.portrait.and.arrow.right").font(.system(size: 15))
                        Text("Sign Out").font(.system(size: 15, weight: .semibold))
                    }
                    .foregroundColor(DTheme.red)
                    .frame(maxWidth: .infinity).padding(.vertical, 14)
                    .background(DTheme.red.opacity(0.08))
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(DTheme.red.opacity(0.2), lineWidth: 1))
                }
                .padding(.horizontal, 20)

                Spacer().frame(height: 20)
            }
        }
    }

    func profileRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 14)).foregroundColor(DTheme.emerald).frame(width: 22)
            Text(label).font(.system(size: 13)).foregroundColor(DTheme.textSecondary).frame(width: 90, alignment: .leading)
            Text(value).font(.system(size: 13, weight: .semibold)).foregroundColor(DTheme.textPrimary)
            Spacer()
        }
    }
}

// MARK: - Shared helpers
func sectionTitle(_ title: String) -> some View {
    Text(title)
        .font(.system(size: 26, weight: .bold))
        .foregroundColor(DTheme.textPrimary)
        .padding(.horizontal, 20)
        .padding(.top, 60)
}

func emptyState(icon: String, message: String) -> some View {
    VStack(spacing: 14) {
        Image(systemName: icon).font(.system(size: 44)).foregroundColor(DTheme.textMuted)
        Text(message).font(.system(size: 14)).foregroundColor(DTheme.textSecondary)
    }
    .frame(maxWidth: .infinity).padding(.vertical, 50)
}
