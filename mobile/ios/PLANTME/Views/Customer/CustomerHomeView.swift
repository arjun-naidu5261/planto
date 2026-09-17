import SwiftUI

public struct CustomerHomeView: View {
    @ObservedObject var viewModel: CustomerAppViewModel
    
    public init(viewModel: CustomerAppViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        HomeMarketplaceView(viewModel: viewModel)
    }
}
