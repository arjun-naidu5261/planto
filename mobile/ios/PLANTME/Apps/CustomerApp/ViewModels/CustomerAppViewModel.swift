import SwiftUI
import Combine

public enum AppTab {
    case home
    case stalls
    case aiDoctor
    case wallet
    case track
}

public class CustomerAppViewModel: ObservableObject {
    @Published public var hasCompletedOnboarding: Bool = false
    @Published public var activeTab: AppTab = .home
    @Published public var selectedCategory: String = "All"
    @Published public var searchQuery: String = ""
    
    @Published public var stalls: [NurseryStall] = []
    @Published public var products: [PlantProduct] = []
    @Published public var selectedStall: NurseryStall? = nil
    @Published public var selectedProduct: PlantProduct? = nil
    
    @Published public var cartItems: [CartItem] = []
    @Published public var walletBalance: Double = 1250.00
    @Published public var plantCoins: Int = 150
    
    @Published public var isDiagnosing: Bool = false
    @Published public var aiDiagnosisResult: AIDiagnosisResult? = nil
    @Published public var liveTrackingOrder: DeliveryOrder? = nil
    
    public init() {
        loadMockData()
    }
    
    public var filteredProducts: [PlantProduct] {
        products.filter { prod in
            let categoryMatches = (selectedCategory == "All" || prod.category.lowercased() == selectedCategory.lowercased())
            let searchMatches = searchQuery.isEmpty || prod.name.lowercased().contains(searchQuery.lowercased())
            return categoryMatches && searchMatches
        }
    }
    
    public var cartTotal: Double {
        cartItems.reduce(0) { $0 + ($1.product.price * Double($1.quantity)) }
    }
    
    public func addToCart(product: PlantProduct) {
        if let idx = cartItems.firstIndex(where: { $0.product.id == product.id }) {
            cartItems[idx].quantity += 1
        } else {
            cartItems.append(CartItem(id: UUID().uuidString, product: product, quantity: 1))
        }
    }
    
    public func removeFromCart(productId: String) {
        if let idx = cartItems.firstIndex(where: { $0.product.id == productId }) {
            if cartItems[idx].quantity > 1 {
                cartItems[idx].quantity -= 1
            } else {
                cartItems.remove(at: idx)
            }
        }
    }
    
    public func placeOrder() {
        let newOrder = DeliveryOrder(
            id: "#ORD-\(Int.random(in: 1000...9999))",
            status: .preparing,
            estimatedDeliveryMinutes: 28,
            itemsCount: cartItems.reduce(0) { $0 + $1.quantity },
            deliveryPartnerName: "Ramesh Kumar",
            deliveryPartnerPhone: "+91 88856 00899"
        )
        self.liveTrackingOrder = newOrder
        self.cartItems.removeAll()
    }
    
    public func diagnosePlant() {
        isDiagnosing = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.isDiagnosing = false
            self.aiDiagnosisResult = AIDiagnosisResult(
                diseaseName: "Nitrogen Deficiency",
                confidenceScore: 0.92,
                description: "Pale green/yellowing leaves observed near base. Needs high-nitrogen organic compost.",
                treatmentSteps: [
                    "Isolate plant from direct afternoon sun for 2 days",
                    "Apply 200g Neem Cake + Organic Compost",
                    "Water thoroughly until soil drains"
                ]
            )
        }
    }
    
    public func topUpWallet(amount: Double) {
        walletBalance += amount
        plantCoins += Int(amount * 0.1)
    }
    
    private func loadMockData() {
        stalls = [
            NurseryStall(id: "s1", name: "Green Thumb Nursery", rating: 4.9, distance: "1.2 km", address: "100 Feet Rd, Indiranagar"),
            NurseryStall(id: "s2", name: "Urban Botanist Stall", rating: 4.8, distance: "2.4 km", address: "12th Main, HAL 2nd Stage"),
            NurseryStall(id: "s3", name: "Flora Sanctuary", rating: 4.7, distance: "3.1 km", address: "CMH Road, Indiranagar")
        ]
        
        products = [
            PlantProduct(
                id: "p1",
                name: "Golden Pothos",
                category: "Indoor",
                price: 349.0,
                rating: 4.9,
                stallName: "Green Thumb Nursery",
                description: "Vibrant trailing vine plant known for air-purifying properties and low maintenance care.",
                careInstructions: PlantCareSpecs(light: "Bright Indirect", water: "Weekly", petFriendly: false, difficulty: "Easy")
            ),
            PlantProduct(
                id: "p2",
                name: "Areca Palm (Medium)",
                category: "Indoor",
                price: 799.0,
                rating: 4.8,
                stallName: "Urban Botanist Stall",
                description: "Feathery green fronds that act as a natural indoor humidifier and air cleaner.",
                careInstructions: PlantCareSpecs(light: "Filtered Sun", water: "2x / Week", petFriendly: true, difficulty: "Moderate")
            ),
            PlantProduct(
                id: "p3",
                name: "Snake Plant Sansevieria",
                category: "Succulents",
                price: 449.0,
                rating: 4.9,
                stallName: "Green Thumb Nursery",
                description: "Hardy architectural plant that releases oxygen at night. Ideal for bedrooms.",
                careInstructions: PlantCareSpecs(light: "Low to Bright", water: "Every 2 Weeks", petFriendly: false, difficulty: "Super Easy")
            ),
            PlantProduct(
                id: "p4",
                name: "Organic Neem Cake Compost",
                category: "Fertilizers",
                price: 199.0,
                rating: 5.0,
                stallName: "Flora Sanctuary",
                description: "Pure bio-fertilizer rich in nitrogen and pest protection for all home garden pots.",
                careInstructions: PlantCareSpecs(light: "N/A", water: "N/A", petFriendly: true, difficulty: "Easy")
            )
        ]
    }
}
