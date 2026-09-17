import SwiftUI

struct HomeMarketplaceView: View {
    @ObservedObject var viewModel: CustomerAppViewModel
    
    let categories = ["All", "Indoor", "Outdoor", "Succulents", "Pots & Tools", "Fertilizers"]
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 20) {
                // Sleek Header Bar
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("LOCATION")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(CustomerTheme.textMuted)
                        HStack(spacing: 4) {
                            Text("Indiranagar, Bengaluru")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                            Image(systemName: "chevron.down")
                                .font(.system(size: 12))
                                .foregroundColor(CustomerTheme.textMuted)
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: { viewModel.activeTab = .wallet }) {
                        HStack(spacing: 6) {
                            Text("₹\(Int(viewModel.walletBalance))")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(CustomerTheme.accentMint)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(CustomerTheme.cardBg)
                        .cornerRadius(20)
                        .overlay(RoundedRectangle(cornerRadius: 20).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                
                // Minimal Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 15))
                        .foregroundColor(CustomerTheme.textMuted)
                    TextField("Search plants, pots & fertilizers...", text: $viewModel.searchQuery)
                        .font(.system(size: 15))
                        .foregroundColor(CustomerTheme.textPrimary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(CustomerTheme.cardBg)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                .padding(.horizontal, 20)
                
                // Elegant Minimal Hero Banner
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(CustomerTheme.cardGradient)
                        .frame(height: 140)
                        .overlay(RoundedRectangle(cornerRadius: 20).stroke(CustomerTheme.glassBorderActive, lineWidth: 1))
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("30 MIN EXPRESS DELIVERY")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(CustomerTheme.accentEmerald)
                        
                        Text("Fresh Organic Plants\nDirect from Local Nurseries")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                            .lineSpacing(2)
                        
                        Text("Redeem PlantCoins for 20% OFF")
                            .font(.system(size: 12))
                            .foregroundColor(CustomerTheme.textSecondary)
                    }
                    .padding(20)
                }
                .padding(.horizontal, 20)
                
                // Category Pills
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(categories, id: \.self) { cat in
                            Button(action: { viewModel.selectedCategory = cat }) {
                                Text(cat)
                                    .font(.system(size: 13, weight: .medium))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(viewModel.selectedCategory == cat ? CustomerTheme.accentEmerald : CustomerTheme.cardBg)
                                    .foregroundColor(viewModel.selectedCategory == cat ? .black : CustomerTheme.textSecondary)
                                    .cornerRadius(18)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 18)
                                            .stroke(viewModel.selectedCategory == cat ? Color.clear : CustomerTheme.glassBorder, lineWidth: 1)
                                    )
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
                
                // Local Nurseries Section
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        Text("Local Nurseries")
                            .font(.system(size: 17, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                        Spacer()
                        Button("See All") { viewModel.activeTab = .stalls }
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(CustomerTheme.accentEmerald)
                    }
                    .padding(.horizontal, 20)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(viewModel.stalls) { stall in
                                Button(action: { viewModel.selectedStall = stall }) {
                                    VStack(alignment: .leading, spacing: 8) {
                                        ZStack(alignment: .topTrailing) {
                                            RoundedRectangle(cornerRadius: 14)
                                                .fill(CustomerTheme.cardBgElevated)
                                                .frame(width: 180, height: 95)
                                            
                                            Text("\(String(format: "%.1f", stall.rating)) ★")
                                                .font(.system(size: 11, weight: .bold))
                                                .foregroundColor(CustomerTheme.accentGold)
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 4)
                                                .background(Color.black.opacity(0.6))
                                                .cornerRadius(8)
                                                .padding(8)
                                        }
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(stall.name)
                                                .font(.system(size: 14, weight: .bold))
                                                .foregroundColor(CustomerTheme.textPrimary)
                                                .lineLimit(1)
                                            Text("\(stall.distance) • 30 Min Express")
                                                .font(.system(size: 11))
                                                .foregroundColor(CustomerTheme.textMuted)
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
                
                // Plant Products Grid
                VStack(alignment: .leading, spacing: 14) {
                    Text("Featured Plants & Care")
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                        .padding(.horizontal, 20)
                    
                    LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 14) {
                        ForEach(viewModel.filteredProducts) { product in
                            VStack(alignment: .leading, spacing: 10) {
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(CustomerTheme.cardBgElevated)
                                    .frame(height: 125)
                                    .overlay(
                                        VStack {
                                            Text(product.category.uppercased())
                                                .font(.system(size: 9, weight: .bold))
                                                .foregroundColor(CustomerTheme.textMuted)
                                                .padding(6)
                                                .background(Color.black.opacity(0.3))
                                                .cornerRadius(6)
                                        }, alignment: .topLeading
                                    )
                                    .padding(6)
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(product.name)
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(CustomerTheme.textPrimary)
                                        .lineLimit(1)
                                    
                                    Text(product.stallName)
                                        .font(.system(size: 11))
                                        .foregroundColor(CustomerTheme.textMuted)
                                        .lineLimit(1)
                                    
                                    HStack {
                                        Text("₹\(Int(product.price))")
                                            .font(.system(size: 15, weight: .bold))
                                            .foregroundColor(CustomerTheme.accentMint)
                                        
                                        Spacer()
                                        
                                        Button(action: { viewModel.addToCart(product: product) }) {
                                            Text("+")
                                                .font(.system(size: 16, weight: .bold))
                                                .foregroundColor(.black)
                                                .frame(width: 28, height: 28)
                                                .background(CustomerTheme.emeraldGradient)
                                                .clipShape(Circle())
                                        }
                                    }
                                    .padding(.top, 2)
                                }
                                .padding(.horizontal, 10)
                                .padding(.bottom, 10)
                            }
                            .background(CustomerTheme.cardBg)
                            .cornerRadius(16)
                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                            .onTapGesture {
                                viewModel.selectedProduct = product
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.bottom, 110)
            }
        }
    }
}
