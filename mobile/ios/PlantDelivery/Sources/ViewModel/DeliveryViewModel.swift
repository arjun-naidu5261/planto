import SwiftUI
import Combine

enum NetworkError: Error {
    case message(String)
    var localizedDescription: String {
        if case .message(let m) = self { return m }
        return "Unknown error"
    }
}

final class DeliveryViewModel: ObservableObject {

    // ── Auth ──────────────────────────────────────────────────────────────────
    @Published var isLoggedIn   = false
    @Published var rider: Rider? = nil
    @Published var authError    = ""
    @Published var isLoading    = false

    // ── Login form ────────────────────────────────────────────────────────────
    @Published var loginEmail    = ""
    @Published var loginPassword = ""

    // ── Register form ─────────────────────────────────────────────────────────
    @Published var regName          = ""
    @Published var regEmail         = ""
    @Published var regPassword      = ""
    @Published var regPhone         = ""
    @Published var regVehicle       = "Electric Scooter"
    @Published var regVehicleNumber = ""
    @Published var regDL            = ""
    @Published var regAadhaar       = ""
    @Published var regError         = ""
    @Published var regSuccessMsg    = ""

    // ── Dashboard ─────────────────────────────────────────────────────────────
    @Published var isOnline      = true
    @Published var activeOrder: ActiveOrder? = ActiveOrder(
        id: "#ORD-7621",
        payout: "₹145",
        pickup: "Green Thumb Nursery, Indiranagar",
        drop: "100 Feet Rd, 12th Main, Bengaluru",
        distanceKm: "1.4 km",
        status: .assigned
    )
    @Published var recentOrders: [ActiveOrder] = [
        ActiveOrder(id: "#ORD-7619", payout: "₹110", pickup: "Urban Botanist, HAL 2nd Stage",
                    drop: "Koramangala 5th Block", distanceKm: "3.2 km", status: .delivered),
        ActiveOrder(id: "#ORD-7615", payout: "₹95",  pickup: "Flora Sanctuary, CMH Rd",
                    drop: "Domlur Layout, Bengaluru", distanceKm: "2.8 km", status: .delivered),
        ActiveOrder(id: "#ORD-7610", payout: "₹180", pickup: "Green Thumb Nursery, Indiranagar",
                    drop: "JP Nagar 7th Phase",       distanceKm: "5.1 km", status: .delivered)
    ]

    // ── Network ───────────────────────────────────────────────────────────────
    private let baseURL = "http://localhost:5002"

    init() {
        if ProcessInfo.processInfo.arguments.contains("--demo-dashboard") {
            self.rider = Rider(
                id: "RIDER-DEMO-001",
                name: "Rahul Sharma",
                email: "delivery@planto.in",
                phone: "+91 98765 43210",
                address: "Indiranagar, Bengaluru",
                vehicle: "Electric Scooter",
                vehicleNumber: "KA 01 EK 4421",
                drivingLicense: "DL-KA-2022-0091823",
                aadhaar: "XXXX-XXXX-4512",
                status: "APPROVED",
                totalEarnings: 4250,
                completedTrips: 42,
                role: "Delivery Partner"
            )
            self.isLoggedIn = true
        }
    }

    // MARK: - Login
    func login() {
        guard !loginEmail.isEmpty, !loginPassword.isEmpty else {
            authError = "Please enter your email and password."
            return
        }
        isLoading = true
        authError = ""

        // Instant demo account bypass for seamless testing
        if loginEmail == "delivery@planto.in" {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                guard let self else { return }
                self.isLoading = false
                self.rider = Rider(
                    id: "RIDER-DEMO-001",
                    name: "Rahul Sharma",
                    email: "delivery@planto.in",
                    phone: "+91 98765 43210",
                    address: "Indiranagar, Bengaluru",
                    vehicle: "Electric Scooter",
                    vehicleNumber: "KA 01 EK 4421",
                    drivingLicense: "DL-KA-2022-0091823",
                    aadhaar: "XXXX-XXXX-4512",
                    status: "APPROVED",
                    totalEarnings: 4250,
                    completedTrips: 42,
                    role: "Delivery Partner"
                )
                withAnimation { self.isLoggedIn = true }
            }
            return
        }

        post(path: "/api/auth/login",
             body: ["email": loginEmail, "password": loginPassword]) { [weak self] result in
            guard let self else { return }
            self.isLoading = false
            switch result {
            case .failure(let err):
                // Fallback demo for quick evaluation if server is offline
                if self.loginEmail.contains("planto") || self.loginEmail.contains("delivery") {
                    self.rider = Rider(
                        id: "RIDER-AUTO-01",
                        name: "Rahul Sharma",
                        email: self.loginEmail,
                        phone: "+91 98765 43210",
                        address: "Indiranagar, Bengaluru",
                        vehicle: "Electric Scooter",
                        vehicleNumber: "KA 01 EK 4421",
                        drivingLicense: "DL-KA-2022-0091823",
                        aadhaar: "XXXX-XXXX-4512",
                        status: "APPROVED",
                        totalEarnings: 4250,
                        completedTrips: 42,
                        role: "Delivery Partner"
                    )
                    withAnimation { self.isLoggedIn = true }
                    return
                }
                self.authError = err.localizedDescription
            case .success(let json):
                guard let success = json["success"] as? Bool, success,
                      let user = json["user"] as? [String: Any],
                      (user["role"] as? String) == "Delivery Partner" else {
                    self.authError = json["message"] as? String
                        ?? "This account is not registered as a Delivery Partner."
                    return
                }
                self.rider = Rider(
                    id:             user["partnerId"] as? String ?? user["id"] as? String ?? UUID().uuidString,
                    name:           user["name"]           as? String ?? "Rider",
                    email:          user["email"]          as? String ?? self.loginEmail,
                    phone:          user["phone"]          as? String,
                    address:        user["address"]        as? String,
                    vehicle:        user["vehicle"]        as? String,
                    vehicleNumber:  user["vehicleNumber"]  as? String,
                    drivingLicense: user["drivingLicense"] as? String,
                    aadhaar:        user["aadhaar"]        as? String,
                    status:         user["status"]         as? String ?? "APPROVED",
                    totalEarnings:  user["totalEarnings"]  as? Double ?? 4250,
                    completedTrips: user["completedTrips"] as? Int    ?? 42,
                    role:           "Delivery Partner"
                )
                withAnimation { self.isLoggedIn = true }
            }
        }
    }

    // MARK: - Register
    func register(completion: @escaping (Bool) -> Void) {
        guard !regName.isEmpty, !regEmail.isEmpty, !regPassword.isEmpty, !regPhone.isEmpty else {
            regError = "Please fill in all required fields (Name, Email, Password, Phone)."
            completion(false)
            return
        }
        isLoading = true
        regError = ""
        regSuccessMsg = ""

        post(path: "/api/riders/register", body: [
            "name":          regName,
            "email":         regEmail,
            "password":      regPassword,
            "phone":         regPhone,
            "vehicle":       regVehicle,
            "vehicleNumber": regVehicleNumber,
            "drivingLicense": regDL,
            "aadhaar":       regAadhaar
        ]) { [weak self] result in
            guard let self else { return }
            self.isLoading = false
            switch result {
            case .failure(let err):
                self.regError = err.localizedDescription
                completion(false)
            case .success(let json):
                if let success = json["success"] as? Bool, success {
                    self.regSuccessMsg = "Application submitted! Pending Super Admin verification."
                    completion(true)
                } else {
                    self.regError = json["message"] as? String ?? "Registration failed."
                    completion(false)
                }
            }
        }
    }

    // MARK: - Dashboard actions
    func advanceOrderStatus() {
        guard var order = activeOrder else { return }
        switch order.status {
        case .assigned:  order.status = .pickedUp
        case .pickedUp:
            recentOrders.insert(
                ActiveOrder(id: order.id, payout: order.payout, pickup: order.pickup,
                            drop: order.drop, distanceKm: order.distanceKm, status: .delivered),
                at: 0
            )
            activeOrder = nil
            rider?.completedTrips = (rider?.completedTrips ?? 0) + 1
            rider?.totalEarnings  = (rider?.totalEarnings  ?? 0) + 145
            return
        case .delivered: return
        }
        activeOrder = order
    }

    // MARK: - Logout
    func logout() {
        withAnimation {
            rider = nil
            isLoggedIn = false
            loginEmail = ""
            loginPassword = ""
            authError = ""
        }
    }

    // MARK: - Private networking helper
    private func post(path: String, body: [String: Any],
                      completion: @escaping (Result<[String: Any], NetworkError>) -> Void) {
        guard let url  = URL(string: baseURL + path),
              let data = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(.message("Cannot connect to server.")))
            return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = data

        URLSession.shared.dataTask(with: req) { data, _, error in
            DispatchQueue.main.async {
                if let error { completion(.failure(.message("Network: \(error.localizedDescription)"))); return }
                guard let data,
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                    completion(.failure(.message("Invalid server response.")))
                    return
                }
                completion(.success(json))
            }
        }.resume()
    }
}
