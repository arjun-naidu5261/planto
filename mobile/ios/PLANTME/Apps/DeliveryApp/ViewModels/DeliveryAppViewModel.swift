import SwiftUI
import Combine

public struct DeliveryRider: Identifiable, Codable {
    public var id: String
    public var name: String
    public var email: String
    public var phone: String?
    public var address: String?
    public var vehicle: String?
    public var vehicleNumber: String?
    public var drivingLicense: String?
    public var aadhaar: String?
    public var status: String?
    public var totalEarnings: Double?
    public var completedTrips: Int?
    public var role: String?

    enum CodingKeys: String, CodingKey {
        case id, name, email, phone, address, vehicle, vehicleNumber,
             drivingLicense, aadhaar, status, totalEarnings, completedTrips, role
    }
}

public class DeliveryAppViewModel: ObservableObject {
    // Auth state
    @Published public var isLoggedIn: Bool = false
    @Published public var rider: DeliveryRider? = nil

    // Login form
    @Published public var loginEmail: String = ""
    @Published public var loginPassword: String = ""
    @Published public var loginError: String = ""
    @Published public var isLoading: Bool = false

    // Register form
    @Published public var regName: String = ""
    @Published public var regEmail: String = ""
    @Published public var regPassword: String = ""
    @Published public var regPhone: String = ""
    @Published public var regVehicle: String = "Electric Scooter"
    @Published public var regVehicleNumber: String = ""
    @Published public var regDL: String = ""
    @Published public var regAadhaar: String = ""
    @Published public var regError: String = ""
    @Published public var regSuccess: String = ""

    // Dashboard
    @Published public var isOnline: Bool = true
    @Published public var activeOrderId: String = "#ORD-9482"
    @Published public var orderPayout: String = "₹120"
    @Published public var pickupLocation: String = "Green Thumb Nursery, Indiranagar"
    @Published public var dropLocation: String = "100 Feet Rd, 12th Main, Bengaluru"
    @Published public var distanceKm: String = "1.2 km"

    private let baseURL = "http://localhost:5002"

    public init() {}

    // MARK: - Login
    public func login() {
        guard !loginEmail.isEmpty, !loginPassword.isEmpty else {
            loginError = "Please enter your email and password."
            return
        }
        isLoading = true
        loginError = ""

        let body: [String: Any] = [
            "email": loginEmail,
            "password": loginPassword
        ]

        guard let url = URL(string: "\(baseURL)/api/auth/login"),
              let data = try? JSONSerialization.data(withJSONObject: body) else {
            isLoading = false
            loginError = "Cannot connect to server."
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = data

        URLSession.shared.dataTask(with: request) { [weak self] responseData, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let error = error {
                    self?.loginError = "Network error: \(error.localizedDescription)"
                    return
                }
                guard let responseData = responseData,
                      let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any] else {
                    self?.loginError = "Invalid server response."
                    return
                }

                if let success = json["success"] as? Bool, success,
                   let userDict = json["user"] as? [String: Any] {
                    let role = userDict["role"] as? String ?? ""
                    guard role == "Delivery Partner" else {
                        self?.loginError = "This account is not registered as a Delivery Partner."
                        return
                    }
                    let rider = DeliveryRider(
                        id: userDict["partnerId"] as? String ?? userDict["id"] as? String ?? UUID().uuidString,
                        name: userDict["name"] as? String ?? "Rider",
                        email: userDict["email"] as? String ?? self?.loginEmail ?? "",
                        phone: userDict["phone"] as? String,
                        address: userDict["address"] as? String,
                        vehicle: userDict["vehicle"] as? String,
                        vehicleNumber: userDict["vehicleNumber"] as? String,
                        drivingLicense: userDict["drivingLicense"] as? String,
                        aadhaar: userDict["aadhaar"] as? String,
                        status: userDict["status"] as? String ?? "APPROVED",
                        totalEarnings: userDict["totalEarnings"] as? Double ?? 4250,
                        completedTrips: userDict["completedTrips"] as? Int ?? 42,
                        role: role
                    )
                    self?.rider = rider
                    self?.isLoggedIn = true
                } else {
                    let message = json["message"] as? String ?? "Login failed. Please try again."
                    self?.loginError = message
                }
            }
        }.resume()
    }

    // MARK: - Register
    public func register(completion: @escaping (Bool) -> Void) {
        guard !regName.isEmpty, !regEmail.isEmpty, !regPassword.isEmpty, !regPhone.isEmpty else {
            regError = "Please fill in all required fields."
            completion(false)
            return
        }
        isLoading = true
        regError = ""
        regSuccess = ""

        let body: [String: Any] = [
            "name": regName,
            "email": regEmail,
            "password": regPassword,
            "phone": regPhone,
            "vehicle": regVehicle,
            "vehicleNumber": regVehicleNumber,
            "drivingLicense": regDL,
            "aadhaar": regAadhaar
        ]

        guard let url = URL(string: "\(baseURL)/api/riders/register"),
              let data = try? JSONSerialization.data(withJSONObject: body) else {
            isLoading = false
            regError = "Cannot connect to server."
            completion(false)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = data

        URLSession.shared.dataTask(with: request) { [weak self] responseData, _, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let error = error {
                    self?.regError = "Network error: \(error.localizedDescription)"
                    completion(false)
                    return
                }
                guard let responseData = responseData,
                      let json = try? JSONSerialization.jsonObject(with: responseData) as? [String: Any] else {
                    self?.regError = "Invalid server response."
                    completion(false)
                    return
                }
                if let success = json["success"] as? Bool, success {
                    self?.regSuccess = "Application submitted! Your account is pending Super Admin verification."
                    completion(true)
                } else {
                    let msg = json["message"] as? String ?? "Registration failed."
                    self?.regError = msg
                    completion(false)
                }
            }
        }.resume()
    }

    // MARK: - Logout
    public func logout() {
        rider = nil
        isLoggedIn = false
        loginEmail = ""
        loginPassword = ""
        loginError = ""
    }
}
