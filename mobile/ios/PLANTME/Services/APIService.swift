import Foundation

public class APIService {
    public static let shared = APIService()
    private let baseURL = "http://localhost:5002/api"
    
    private init() {}
    
    public func fetchLiveOrder(orderId: String, completion: @escaping (Result<DeliveryOrder, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/orders/track/\(orderId)") else { return }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else { return }
            
            do {
                let order = try JSONDecoder().decode(DeliveryOrder.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(order))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}
