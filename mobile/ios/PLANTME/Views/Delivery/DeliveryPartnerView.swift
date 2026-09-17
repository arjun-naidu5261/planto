import SwiftUI

public struct DeliveryPartnerView: View {
    @State private var isOnline = true
    
    public init() {}
    
    public var body: some View {
        ZStack {
            CustomerTheme.bgDark
                .ignoresSafeArea()
            
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("DELIVERY PARTNER")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(CustomerTheme.accentGold)
                            Text("Ramesh Kumar")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                        }
                        Spacer()
                        Toggle("", isOn: $isOnline)
                            .toggleStyle(SwitchToggleStyle(tint: CustomerTheme.accentEmerald))
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Active Assigned Order")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("#ORD-9482")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(CustomerTheme.accentMint)
                                Spacer()
                                Text("₹120 Payout")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(CustomerTheme.accentGold)
                            }
                            Text("Pickup: Green Thumb Nursery, Indiranagar")
                                .font(.system(size: 12))
                                .foregroundColor(CustomerTheme.textSecondary)
                            Text("Drop: 100 Feet Rd, 12th Main, Bengaluru")
                                .font(.system(size: 12))
                                .foregroundColor(CustomerTheme.textSecondary)
                            
                            Button(action: {}) {
                                Text("Navigate to Pickup (1.2 km)")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(.black)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(CustomerTheme.emeraldGradient)
                                    .cornerRadius(12)
                            }
                            .padding(.top, 4)
                        }
                        .padding(14)
                        .background(CustomerTheme.cardBg)
                        .cornerRadius(16)
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.bottom, 40)
            }
        }
    }
}
