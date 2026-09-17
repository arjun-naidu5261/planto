import SwiftUI

/// Root container for the Delivery Partner flow.
/// Handles login/register → dashboard navigation.
struct DeliveryPartnerRootView: View {
    @StateObject private var viewModel = DeliveryAppViewModel()

    var body: some View {
        Group {
            if viewModel.isLoggedIn {
                DeliveryDashboardView(viewModel: viewModel)
                    .transition(.move(edge: .trailing).combined(with: .opacity))
            } else {
                DeliveryPartnerLoginView(viewModel: viewModel)
                    .transition(.opacity)
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.8), value: viewModel.isLoggedIn)
    }
}
