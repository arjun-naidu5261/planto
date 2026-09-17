import SwiftUI

// MARK: - PLANTO Delivery Partner Design System

public struct DTheme {
    // ── Backgrounds ──────────────────────────────────────────────────────────
    public static let bg            = Color(hex: "070A09")
    public static let surface       = Color(hex: "0E1512")
    public static let surfaceRaised = Color(hex: "141D17")
    public static let surfaceHigh   = Color(hex: "1B2820")

    // ── Brand Accents ─────────────────────────────────────────────────────────
    public static let emerald       = Color(hex: "10B981")
    public static let emeraldLight  = Color(hex: "34D399")
    public static let gold          = Color(hex: "F59E0B")
    public static let goldLight     = Color(hex: "FCD34D")
    public static let amber         = Color(hex: "D97706")
    public static let red           = Color(hex: "EF4444")

    // ── Text ──────────────────────────────────────────────────────────────────
    public static let textPrimary   = Color.white
    public static let textSecondary = Color(hex: "9CA3AF")
    public static let textMuted     = Color(hex: "6B7280")
    public static let textDisabled  = Color(hex: "374151")

    // ── Borders ───────────────────────────────────────────────────────────────
    public static let border        = Color.white.opacity(0.07)
    public static let borderActive  = Color(hex: "10B981").opacity(0.45)
    public static let borderGold    = Color(hex: "F59E0B").opacity(0.35)

    // ── Gradients ─────────────────────────────────────────────────────────────
    public static let gradientEmerald = LinearGradient(
        colors: [Color(hex: "10B981"), Color(hex: "059669")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    public static let gradientGold = LinearGradient(
        colors: [Color(hex: "F59E0B"), Color(hex: "D97706")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    public static let gradientDark = LinearGradient(
        colors: [Color(hex: "141D17"), Color(hex: "0E1410")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    public static let gradientHero = LinearGradient(
        colors: [Color(hex: "0A1A12"), Color(hex: "070A09")],
        startPoint: .top, endPoint: .bottom
    )
}

// MARK: - Color hex init
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r)/255, green: Double(g)/255,
                  blue: Double(b)/255, opacity: Double(a)/255)
    }
}

// MARK: - Reusable UI components

/// Glassmorphism card container
struct DCard<Content: View>: View {
    let content: Content
    var borderColor: Color = DTheme.border
    var padding: CGFloat = 18

    init(borderColor: Color = DTheme.border, padding: CGFloat = 18, @ViewBuilder content: () -> Content) {
        self.content = content()
        self.borderColor = borderColor
        self.padding = padding
    }

    var body: some View {
        content
            .padding(padding)
            .background(DTheme.surface)
            .cornerRadius(20)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(borderColor, lineWidth: 1))
    }
}

/// Section header with icon + monospaced title
struct DSectionHeader: View {
    let icon: String
    let title: String
    var color: Color = DTheme.emeraldLight

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 13))
                .foregroundColor(color)
            Text(title.uppercased())
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(color)
                .tracking(1.5)
            Spacer()
        }
        .padding(.top, 6)
    }
}

/// Primary action button
struct DPrimaryButton: View {
    let label: String
    let icon: String
    let isLoading: Bool
    let action: () -> Void
    var gradient: LinearGradient = DTheme.gradientEmerald

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .black))
                        .scaleEffect(0.85)
                } else {
                    Image(systemName: icon).font(.system(size: 16, weight: .semibold))
                }
                Text(isLoading ? "Please wait…" : label)
                    .font(.system(size: 16, weight: .bold))
            }
            .foregroundColor(.black)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 15)
            .background(isLoading ? AnyView(Color.gray.opacity(0.5)) : AnyView(gradient))
            .cornerRadius(15)
            .shadow(color: DTheme.emerald.opacity(0.3), radius: 10, y: 4)
        }
        .disabled(isLoading)
        .animation(.easeInOut(duration: 0.2), value: isLoading)
    }
}

/// Labeled text input field
struct DInputField: View {
    let label: String
    let icon: String
    let placeholder: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var isSecure: Bool = false
    @State private var revealed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(label, systemImage: icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(DTheme.textSecondary)

            HStack {
                Group {
                    if isSecure && !revealed {
                        SecureField(placeholder, text: $text)
                    } else {
                        TextField(placeholder, text: $text)
                    }
                }
                .keyboardType(keyboard)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .foregroundColor(DTheme.textPrimary)
                .font(.system(size: 15))

                if isSecure {
                    Button(action: { revealed.toggle() }) {
                        Image(systemName: revealed ? "eye.slash" : "eye")
                            .foregroundColor(DTheme.textMuted)
                            .font(.system(size: 14))
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .background(DTheme.surfaceRaised)
            .cornerRadius(13)
            .overlay(RoundedRectangle(cornerRadius: 13).stroke(DTheme.borderActive, lineWidth: 1))
        }
    }
}

/// Inline error/warning banner
struct DErrorBanner: View {
    let message: String

    var body: some View {
        if !message.isEmpty {
            HStack(spacing: 10) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.orange)
                    .font(.system(size: 14))
                Text(message)
                    .font(.system(size: 13))
                    .foregroundColor(.orange)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer()
            }
            .padding(14)
            .background(Color.orange.opacity(0.09))
            .cornerRadius(13)
            .overlay(RoundedRectangle(cornerRadius: 13).stroke(Color.orange.opacity(0.2), lineWidth: 1))
        }
    }
}

/// Stat tile for dashboard header row
struct DStatTile: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 22))
                .foregroundColor(color)
            Text(value)
                .font(.system(size: 17, weight: .bold))
                .foregroundColor(DTheme.textPrimary)
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(DTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 15)
        .background(DTheme.surface)
        .cornerRadius(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(color.opacity(0.18), lineWidth: 1))
    }
}
