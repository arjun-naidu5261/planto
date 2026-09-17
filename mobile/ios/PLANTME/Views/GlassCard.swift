import SwiftUI

public struct GlassCard<Content: View>: View {
let content: Content

public init(@ViewBuilder content: () -> Content) {
self.content = content()
}

public var body: some View {
VStack(alignment: .leading, spacing: 12) {
content
}
.padding(20)
.background(
RoundedRectangle(cornerRadius: 24)
.fill(Color(red: 9/255, green: 23/255, blue: 17/255).opacity(0.85))
.overlay(
RoundedRectangle(cornerRadius: 24)
.stroke(
LinearGradient(
colors: [
Color(red: 52/255, green: 211/255, blue: 153/255).opacity(0.4),
Color(red: 251/255, green: 191/255, blue: 36/255).opacity(0.2)
],
startPoint: .topLeading,
endPoint: .bottomTrailing
),
lineWidth: 1
)
)
.shadow(color: Color.black.opacity(0.3), radius: 15, x: 0, y: 10)
)
}
}
