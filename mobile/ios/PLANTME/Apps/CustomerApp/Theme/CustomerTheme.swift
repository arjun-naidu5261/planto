import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

public struct CustomerTheme {
    public static let bgDark = Color(hex: "080C0A")
    public static let cardBg = Color(hex: "121814")
    public static let cardBgElevated = Color(hex: "18201B")
    
    public static let accentEmerald = Color(hex: "10B981")
    public static let accentMint = Color(hex: "34D399")
    public static let accentGold = Color(hex: "F59E0B")
    
    public static let textPrimary = Color.white
    public static let textSecondary = Color(hex: "9CA3AF")
    public static let textMuted = Color(hex: "6B7280")
    
    public static let glassBorder = Color.white.opacity(0.08)
    public static let glassBorderActive = Color(hex: "10B981").opacity(0.4)
    
    public static let emeraldGradient = LinearGradient(
        gradient: Gradient(colors: [Color(hex: "10B981"), Color(hex: "059669")]),
        startPoint: .leading,
        endPoint: .trailing
    )
    
    public static let cardGradient = LinearGradient(
        gradient: Gradient(colors: [Color(hex: "141D17"), Color(hex: "0E1410")]),
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
