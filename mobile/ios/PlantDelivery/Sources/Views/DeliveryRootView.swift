import SwiftUI

/// Root navigator: shows Login or Dashboard depending on auth state.
struct DeliveryRootView: View {
    @StateObject private var vm = DeliveryViewModel()

    var body: some View {
        ZStack {
            DTheme.bg.ignoresSafeArea()
            if vm.isLoggedIn {
                DashboardView(vm: vm)
                    .transition(.asymmetric(
                        insertion:  .move(edge: .trailing).combined(with: .opacity),
                        removal:    .move(edge: .leading).combined(with: .opacity)
                    ))
            } else {
                LoginView(vm: vm)
                    .transition(.opacity)
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.82), value: vm.isLoggedIn)
    }
}
