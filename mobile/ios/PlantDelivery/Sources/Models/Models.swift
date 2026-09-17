import Foundation

// MARK: - Data Models

struct Rider: Identifiable, Codable {
    var id: String
    var name: String
    var email: String
    var phone: String?
    var address: String?
    var vehicle: String?
    var vehicleNumber: String?
    var drivingLicense: String?
    var aadhaar: String?
    var status: String?
    var totalEarnings: Double?
    var completedTrips: Int?
    var role: String?

    var approvalStatus: RiderStatus {
        switch status?.uppercased() {
        case "APPROVED":         return .approved
        case "PENDING_APPROVAL": return .pendingApproval
        case "REJECTED":         return .rejected
        case "DISABLED", "BLOCKED": return .blocked
        default:                 return .approved
        }
    }
}

enum RiderStatus {
    case approved, pendingApproval, rejected, blocked

    var label: String {
        switch self {
        case .approved:        return "Active"
        case .pendingApproval: return "Pending Verification"
        case .rejected:        return "Rejected"
        case .blocked:         return "Blocked"
        }
    }
    var isActive: Bool { self == .approved }
}

struct ActiveOrder: Identifiable {
    var id: String
    var payout: String
    var pickup: String
    var drop: String
    var distanceKm: String
    var status: OrderStatus
}

enum OrderStatus: String {
    case assigned = "ASSIGNED"
    case pickedUp = "PICKED_UP"
    case delivered = "DELIVERED"

    var label: String {
        switch self {
        case .assigned:  return "Assigned"
        case .pickedUp:  return "Picked Up"
        case .delivered: return "Delivered"
        }
    }
    var icon: String {
        switch self {
        case .assigned:  return "shippingbox.fill"
        case .pickedUp:  return "bicycle"
        case .delivered: return "checkmark.seal.fill"
        }
    }
}
