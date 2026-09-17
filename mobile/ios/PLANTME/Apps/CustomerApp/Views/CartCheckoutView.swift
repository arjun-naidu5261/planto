import SwiftUI

struct CartCheckoutView: View {
    @ObservedObject var viewModel: CustomerAppViewModel
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        ZStack(alignment: .bottom) {
            CustomerTheme.bgDark
                .ignoresSafeArea()
            
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Text("Cart & Checkout")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                        Spacer()
                        Button(action: { presentationMode.wrappedValue.dismiss() }) {
                            Text("Done")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(CustomerTheme.textMuted)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    
                    if viewModel.cartItems.isEmpty {
                        VStack(spacing: 8) {
                            Text("Your Cart is Empty")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                    } else {
                        VStack(spacing: 10) {
                            ForEach(viewModel.cartItems) { item in
                                HStack(spacing: 12) {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(item.product.name)
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(CustomerTheme.textPrimary)
                                        Text("₹\(Int(item.product.price))")
                                            .font(.system(size: 13, weight: .bold))
                                            .foregroundColor(CustomerTheme.accentMint)
                                    }
                                    Spacer()
                                    HStack(spacing: 10) {
                                        Button(action: { viewModel.removeFromCart(productId: item.product.id) }) {
                                            Text("-")
                                                .font(.system(size: 14, weight: .bold))
                                                .foregroundColor(.white)
                                        }
                                        Text("\(item.quantity)")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.white)
                                        Button(action: { viewModel.addToCart(product: item.product) }) {
                                            Text("+")
                                                .font(.system(size: 14, weight: .bold))
                                                .foregroundColor(.white)
                                        }
                                    }
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(CustomerTheme.cardBgElevated)
                                    .cornerRadius(10)
                                }
                                .padding(12)
                                .background(CustomerTheme.cardBg)
                                .cornerRadius(14)
                                .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        VStack(spacing: 6) {
                            HStack {
                                Text("Item Total")
                                    .font(.system(size: 13))
                                    .foregroundColor(CustomerTheme.textSecondary)
                                Spacer()
                                Text("₹\(Int(viewModel.cartTotal))")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(CustomerTheme.textPrimary)
                            }
                            HStack {
                                Text("Express Delivery")
                                    .font(.system(size: 13))
                                    .foregroundColor(CustomerTheme.textSecondary)
                                Spacer()
                                Text("₹35")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(CustomerTheme.textPrimary)
                            }
                            Divider().background(CustomerTheme.glassBorder).padding(.vertical, 4)
                            HStack {
                                Text("Total Amount")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(CustomerTheme.textPrimary)
                                Spacer()
                                Text("₹\(Int(viewModel.cartTotal) + 35)")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(CustomerTheme.accentMint)
                            }
                        }
                        .padding(14)
                        .background(CustomerTheme.cardBg)
                        .cornerRadius(14)
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                        .padding(.horizontal, 20)
                        .padding(.bottom, 100)
                    }
                }
            }
            
            if !viewModel.cartItems.isEmpty {
                Button(action: {
                    viewModel.placeOrder()
                    presentationMode.wrappedValue.dismiss()
                    viewModel.activeTab = .track
                }) {
                    Text("Place Order • ₹\(Int(viewModel.cartTotal) + 35)")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(CustomerTheme.emeraldGradient)
                        .cornerRadius(14)
                }
                .padding(20)
                .background(CustomerTheme.bgDark)
            }
        }
    }
}
