import SwiftUI

public struct LiveTrackingView: View {
    public let order: DeliveryOrder
    
    public init(order: DeliveryOrder) {
        self.order = order
    }
    
    public var body: some View {
        ZStack {
            CustomerTheme.bgDark
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 4) {
                    Text("LIVE GPS TRACKING")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(CustomerTheme.accentGold)
                    Text("Eco Express Delivery")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                }
                .padding(.top, 20)
                
                // Map Mock Container
                ZStack(alignment: .bottomLeading) {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(CustomerTheme.cardBgElevated)
                        .frame(height: 240)
                        .overlay(RoundedRectangle(cornerRadius: 20).stroke(CustomerTheme.glassBorderActive, lineWidth: 1))
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("ARRIVING IN")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(CustomerTheme.textMuted)
                        Text("\(order.estimatedDeliveryMinutes) Mins")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(CustomerTheme.accentMint)
                    }
                    .padding(16)
                }
                .padding(.horizontal, 20)
                
                // Order Stepper Status Card
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        Text(order.id)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                        Spacer()
                        Text(order.status.rawValue)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(CustomerTheme.accentMint)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(CustomerTheme.accentMint.opacity(0.15))
                            .cornerRadius(10)
                    }
                    
                    Divider().background(CustomerTheme.glassBorder)
                    
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Delivery Partner")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(CustomerTheme.textMuted)
                            Text(order.deliveryPartnerName)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                        }
                        Spacer()
                        Text("Call")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(CustomerTheme.accentMint)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(CustomerTheme.cardBgElevated)
                            .cornerRadius(12)
                    }
                }
                .padding(16)
                .background(CustomerTheme.cardBg)
                .cornerRadius(18)
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                .padding(.horizontal, 20)
                
                Spacer()
            }
        }
    }
}
