import SwiftUI

struct ProductDetailView: View {
    let product: PlantProduct
    @ObservedObject var viewModel: CustomerAppViewModel
    @Environment(\.presentationMode) var presentationMode
    @State private var quantity = 1
    
    var body: some View {
        ZStack(alignment: .bottom) {
            CustomerTheme.bgDark
                .ignoresSafeArea()
            
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    // Clean Image Banner Area
                    ZStack(alignment: .topLeading) {
                        RoundedRectangle(cornerRadius: 0)
                            .fill(CustomerTheme.cardBgElevated)
                            .frame(height: 260)
                        
                        Button(action: { presentationMode.wrappedValue.dismiss() }) {
                            Text("Close")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(Color.black.opacity(0.6))
                                .cornerRadius(16)
                        }
                        .padding(.top, 50)
                        .padding(.leading, 20)
                    }
                    
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(product.name)
                                    .font(.system(size: 22, weight: .bold))
                                    .foregroundColor(CustomerTheme.textPrimary)
                                Text(product.stallName)
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(CustomerTheme.accentEmerald)
                            }
                            Spacer()
                            Text("₹\(Int(product.price))")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(CustomerTheme.accentMint)
                        }
                        
                        Text(product.description)
                            .font(.system(size: 14))
                            .foregroundColor(CustomerTheme.textSecondary)
                            .lineSpacing(3)
                        
                        Divider().background(CustomerTheme.glassBorder)
                        
                        Text("Plant Care Specs")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                        
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                            CareTile(title: "Light", value: product.careInstructions.light)
                            CareTile(title: "Water", value: product.careInstructions.water)
                            CareTile(title: "Pets", value: product.careInstructions.petFriendly ? "Pet Safe" : "Non Pet Safe")
                            CareTile(title: "Care", value: product.careInstructions.difficulty)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 120)
                }
            }
            
            // Bottom Sticky Action Bar
            HStack(spacing: 16) {
                HStack(spacing: 16) {
                    Button(action: { if quantity > 1 { quantity -= 1 } }) {
                        Text("-")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                    Text("\(quantity)")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                    Button(action: { quantity += 1 }) {
                        Text("+")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(CustomerTheme.cardBg)
                .cornerRadius(14)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                
                Button(action: {
                    for _ in 0..<quantity {
                        viewModel.addToCart(product: product)
                    }
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Text("Add to Cart • ₹\(Int(product.price) * quantity)")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(CustomerTheme.emeraldGradient)
                        .cornerRadius(14)
                }
            }
            .padding(20)
            .background(CustomerTheme.bgDark)
            .overlay(Rectangle().frame(height: 1).foregroundColor(CustomerTheme.glassBorder), alignment: .top)
        }
    }
}

struct CareTile: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(CustomerTheme.textMuted)
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(CustomerTheme.textPrimary)
                .lineLimit(1)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CustomerTheme.cardBg)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CustomerTheme.glassBorder, lineWidth: 1))
    }
}
