import SwiftUI

struct PlantMeCustomerApp: View {
    @StateObject private var viewModel = CustomerAppViewModel()
    @State private var showCartModal = false
    
    var body: some View {
        Group {
            if !viewModel.hasCompletedOnboarding {
                OnboardingView(viewModel: viewModel)
            } else {
                ZStack(alignment: .bottom) {
                    CustomerTheme.bgDark
                        .ignoresSafeArea()
                    
                    Group {
                        switch viewModel.activeTab {
                        case .home:
                            HomeMarketplaceView(viewModel: viewModel)
                        case .stalls:
                            ScrollView(.vertical, showsIndicators: false) {
                                VStack(alignment: .leading, spacing: 16) {
                                    Text("Local Nurseries")
                                        .font(.system(size: 22, weight: .bold))
                                        .foregroundColor(CustomerTheme.textPrimary)
                                        .padding(.horizontal, 20)
                                        .padding(.top, 20)
                                    
                                    ForEach(viewModel.stalls) { stall in
                                        Button(action: { viewModel.selectedStall = stall }) {
                                            HStack(spacing: 14) {
                                                RoundedRectangle(cornerRadius: 12)
                                                    .fill(CustomerTheme.cardBgElevated)
                                                    .frame(width: 70, height: 70)
                                                
                                                VStack(alignment: .leading, spacing: 4) {
                                                    Text(stall.name)
                                                        .font(.system(size: 15, weight: .bold))
                                                        .foregroundColor(CustomerTheme.textPrimary)
                                                    Text(stall.address)
                                                        .font(.system(size: 12))
                                                        .foregroundColor(CustomerTheme.textSecondary)
                                                    Text("\(String(format: "%.1f", stall.rating)) ★ • \(stall.distance)")
                                                        .font(.system(size: 11, weight: .semibold))
                                                        .foregroundColor(CustomerTheme.accentMint)
                                                }
                                                Spacer()
                                            }
                                            .padding(12)
                                            .background(CustomerTheme.cardBg)
                                            .cornerRadius(16)
                                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                                            .padding(.horizontal, 20)
                                        }
                                    }
                                }
                                .padding(.bottom, 120)
                            }
                        case .aiDoctor:
                            AIDiagnosticsView(viewModel: viewModel)
                        case .wallet:
                            GreenWalletView(viewModel: viewModel)
                        case .track:
                            if let order = viewModel.liveTrackingOrder {
                                LiveTrackingView(order: order)
                            } else {
                                VStack(spacing: 12) {
                                    Text("No Active Orders")
                                        .font(.system(size: 16, weight: .bold))
                                        .foregroundColor(CustomerTheme.textPrimary)
                                    Text("Place an order from local nurseries to track live delivery status.")
                                        .font(.system(size: 13))
                                        .foregroundColor(CustomerTheme.textSecondary)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, 40)
                                }
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                            }
                        }
                    }
                    
                    // Floating Bottom Nav Bar
                    VStack(spacing: 8) {
                        if !viewModel.cartItems.isEmpty && viewModel.activeTab != .track {
                            Button(action: { showCartModal = true }) {
                                HStack {
                                    Text("View Cart (\(viewModel.cartItems.reduce(0) { $0 + $1.quantity }))")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.black)
                                    Spacer()
                                    Text("₹\(Int(viewModel.cartTotal)) Checkout")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.black)
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                                .background(CustomerTheme.emeraldGradient)
                                .cornerRadius(14)
                            }
                            .padding(.horizontal, 20)
                        }
                        
                        // Clean Bottom Tab Items
                        HStack {
                            NavItem(title: "Explore", isActive: viewModel.activeTab == .home) {
                                viewModel.activeTab = .home
                            }
                            Spacer()
                            NavItem(title: "Stalls", isActive: viewModel.activeTab == .stalls) {
                                viewModel.activeTab = .stalls
                            }
                            Spacer()
                            NavItem(title: "AI Doctor", isActive: viewModel.activeTab == .aiDoctor) {
                                viewModel.activeTab = .aiDoctor
                            }
                            Spacer()
                            NavItem(title: "Wallet", isActive: viewModel.activeTab == .wallet) {
                                viewModel.activeTab = .wallet
                            }
                            Spacer()
                            NavItem(title: "Track", isActive: viewModel.activeTab == .track) {
                                viewModel.activeTab = .track
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(CustomerTheme.cardBg)
                        .cornerRadius(24)
                        .overlay(RoundedRectangle(cornerRadius: 24).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                        .padding(.horizontal, 16)
                        .padding(.bottom, 20)
                    }
                }
                .sheet(isPresented: $showCartModal) {
                    CartCheckoutView(viewModel: viewModel)
                }
                .sheet(item: $viewModel.selectedStall) { stall in
                    StallDetailView(stall: stall, viewModel: viewModel)
                }
                .sheet(item: $viewModel.selectedProduct) { product in
                    ProductDetailView(product: product, viewModel: viewModel)
                }
            }
        }
    }
}

struct NavItem: View {
    let title: String
    let isActive: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(title)
                    .font(.system(size: 12, weight: isActive ? .bold : .medium))
                    .foregroundColor(isActive ? CustomerTheme.accentMint : CustomerTheme.textMuted)
                
                Circle()
                    .fill(isActive ? CustomerTheme.accentMint : Color.clear)
                    .frame(width: 4, height: 4)
            }
        }
    }
}
