import SwiftUI

struct StallDetailView: View {
    let stall: NurseryStall
    @ObservedObject var viewModel: CustomerAppViewModel
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ZStack {
            CustomerTheme.bgDark
                .ignoresSafeArea()
            
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 16) {
                    // Header
                    HStack {
                        Button(action: { presentationMode.wrappedValue.dismiss() }) {
                            Text("Back")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(CustomerTheme.cardBg)
                                .cornerRadius(14)
                        }
                        Spacer()
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text(stall.name)
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                        Text("\(stall.address) • \(stall.distance)")
                            .font(.system(size: 13))
                            .foregroundColor(CustomerTheme.textSecondary)
                        Text("\(String(format: "%.1f", stall.rating)) ★ Rating • Verified Partner")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(CustomerTheme.accentMint)
                    }
                    .padding(.horizontal, 20)
                    
                    Divider().background(CustomerTheme.glassBorder).padding(.horizontal, 20)
                    
                    Text("Nursery Inventory")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                        .padding(.horizontal, 20)
                    
                    let stallProducts = viewModel.products.filter { $0.stallName == stall.name }
                    
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(stallProducts.isEmpty ? viewModel.products : stallProducts) { product in
                            VStack(alignment: .leading, spacing: 8) {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(CustomerTheme.cardBgElevated)
                                    .frame(height: 100)
                                
                                Text(product.name)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(CustomerTheme.textPrimary)
                                    .lineLimit(1)
                                
                                HStack {
                                    Text("₹\(Int(product.price))")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(CustomerTheme.accentMint)
                                    Spacer()
                                    Button(action: { viewModel.addToCart(product: product) }) {
                                        Text("+")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.black)
                                            .frame(width: 24, height: 24)
                                            .background(CustomerTheme.emeraldGradient)
                                            .clipShape(Circle())
                                    }
                                }
                            }
                            .padding(10)
                            .background(CustomerTheme.cardBg)
                            .cornerRadius(14)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                            .onTapGesture {
                                viewModel.selectedProduct = product
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
        }
    }
}
