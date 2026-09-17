import Foundation

public struct NurseryStall: Identifiable, Codable {
    public let id: String
    public let name: String
    public let rating: Double
    public let distance: String
    public let address: String
    
    public init(id: String, name: String, rating: Double, distance: String, address: String) {
        self.id = id
        self.name = name
        self.rating = rating
        self.distance = distance
        self.address = address
    }
}

public struct PlantCareSpecs: Codable {
    public let light: String
    public let water: String
    public let petFriendly: Bool
    public let difficulty: String
    
    public init(light: String, water: String, petFriendly: Bool, difficulty: String) {
        self.light = light
        self.water = water
        self.petFriendly = petFriendly
        self.difficulty = difficulty
    }
}

public struct PlantProduct: Identifiable, Codable {
    public let id: String
    public let name: String
    public let category: String
    public let price: Double
    public let rating: Double
    public let stallName: String
    public let description: String
    public let careInstructions: PlantCareSpecs
    
    public init(id: String, name: String, category: String, price: Double, rating: Double, stallName: String, description: String, careInstructions: PlantCareSpecs) {
        self.id = id
        self.name = name
        self.category = category
        self.price = price
        self.rating = rating
        self.stallName = stallName
        self.description = description
        self.careInstructions = careInstructions
    }
}

public struct CartItem: Identifiable, Codable {
    public let id: String
    public let product: PlantProduct
    public var quantity: Int
    
    public init(id: String, product: PlantProduct, quantity: Int) {
        self.id = id
        self.product = product
        self.quantity = quantity
    }
}

public enum OrderStatus: String, Codable {
    case preparing = "Preparing Order"
    case pickedUp = "Picked Up from Nursery"
    case outForDelivery = "Out for Delivery"
    case delivered = "Delivered"
}

public struct DeliveryOrder: Identifiable, Codable {
    public let id: String
    public var status: OrderStatus
    public let estimatedDeliveryMinutes: Int
    public let itemsCount: Int
    public let deliveryPartnerName: String
    public let deliveryPartnerPhone: String
    
    public init(id: String, status: OrderStatus, estimatedDeliveryMinutes: Int, itemsCount: Int, deliveryPartnerName: String, deliveryPartnerPhone: String) {
        self.id = id
        self.status = status
        self.estimatedDeliveryMinutes = estimatedDeliveryMinutes
        self.itemsCount = itemsCount
        self.deliveryPartnerName = deliveryPartnerName
        self.deliveryPartnerPhone = deliveryPartnerPhone
    }
}

public struct AIDiagnosisResult: Codable {
    public let diseaseName: String
    public let confidenceScore: Double
    public let description: String
    public let treatmentSteps: [String]
    
    public init(diseaseName: String, confidenceScore: Double, description: String, treatmentSteps: [String]) {
        self.diseaseName = diseaseName
        self.confidenceScore = confidenceScore
        self.description = description
        self.treatmentSteps = treatmentSteps
    }
}
