import SwiftUI

struct GreenWalletView: View {
    @ObservedObject var viewModel: CustomerAppViewModel
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 20) {
                VStack(spacing: 4) {
                    Text("Green Wallet")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                }
                .padding(.top, 20)
                
                // Sleek Clean Wallet Card
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        Text("AVAILABLE BALANCE")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(CustomerTheme.textMuted)
                        Spacer()
                        Text("PLANTCOINS: \(viewModel.plantCoins)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(CustomerTheme.accentGold)
                    }
                    
                    Text("₹\(String(format: "%.2f", viewModel.walletBalance))")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(CustomerTheme.accentMint)
                }
                .padding(20)
                .background(CustomerTheme.cardBg)
                .cornerRadius(18)
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                .padding(.horizontal, 20)
                
                // Quick Top-up Amount Pills
                VStack(alignment: .leading, spacing: 10) {
                    Text("Top Up Balance")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                    
                    HStack(spacing: 10) {
                        ForEach([200, 500, 1000], id: \.self) { amount in
                            Button(action: { viewModel.topUpWallet(amount: Double(amount)) }) {
                                Text("+₹\(amount)")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(CustomerTheme.accentEmerald)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(CustomerTheme.cardBg)
                                    .cornerRadius(14)
                                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                
                // Eco Footprint Minimal Block
                VStack(alignment: .leading, spacing: 10) {
                    Text("Eco Impact")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                    
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("14 Trees")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                            Text("Planted in City")
                                .font(.system(size: 11))
                                .foregroundColor(CustomerTheme.textMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(14)
                        .background(CustomerTheme.cardBg)
                        .cornerRadius(14)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("28.4 kg")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(CustomerTheme.accentMint)
                            Text("CO2 Offset")
                                .font(.system(size: 11))
                                .foregroundColor(CustomerTheme.textMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(14)
                        .background(CustomerTheme.cardBg)
                        .cornerRadius(14)
                    }
                }
                .padding(.horizontal, 20)
                
                Text("Powered by Future Forbes Pvt. Ltd.")
                    .font(.system(size: 11))
                    .foregroundColor(CustomerTheme.textMuted)
                    .padding(.top, 10)
            }
            .padding(.bottom, 100)
        }
    }
}
