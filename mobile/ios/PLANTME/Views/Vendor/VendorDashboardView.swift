import SwiftUI

public struct VendorDashboardView: View {
    @State private var isAcceptingOrders = true
    
    public init() {}
    
    public var body: some View {
        ZStack {
            CustomerTheme.bgDark
                .ignoresSafeArea()
            
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("VENDOR PORTAL")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(CustomerTheme.accentGold)
                            Text("Green Thumb Nursery")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(CustomerTheme.textPrimary)
                        }
                        Spacer()
                        
                        Toggle("", isOn: $isAcceptingOrders)
                            .toggleStyle(SwitchToggleStyle(tint: CustomerTheme.accentEmerald))
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    
                    // Metrics Row
                    HStack(spacing: 12) {
                        MetricCard(title: "Today's Orders", value: "18", change: "+4")
                        MetricCard(title: "Earnings", value: "₹4,850", change: "+12%")
                    }
                    .padding(.horizontal, 20)
                    
                    // Incoming Live Orders
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Active Incoming Orders")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                            .padding(.horizontal, 20)
                        
                        VStack(spacing: 10) {
                            OrderRow(orderId: "#ORD-9482", customerName: "Rahul Sharma", items: "1x Premium Golden Pothos, 2x Neem Fertilizer", total: "₹749")
                            OrderRow(orderId: "#ORD-9481", customerName: "Priya Patel", items: "1x Areca Palm (Large)", total: "₹899")
                        }
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.bottom, 40)
            }
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let change: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(CustomerTheme.textMuted)
            Text(value)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(CustomerTheme.textPrimary)
            Text(change)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(CustomerTheme.accentMint)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CustomerTheme.cardBg)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
    }
}

struct OrderRow: View {
    let orderId: String
    let customerName: String
    let items: String
    let total: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(orderId)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(CustomerTheme.accentMint)
                Spacer()
                Text(total)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(CustomerTheme.textPrimary)
            }
            Text(customerName)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(CustomerTheme.textPrimary)
            Text(items)
                .font(.system(size: 12))
                .foregroundColor(CustomerTheme.textSecondary)
        }
        .padding(12)
        .background(CustomerTheme.cardBg)
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(CustomerTheme.glassBorder, lineWidth: 1))
    }
}
