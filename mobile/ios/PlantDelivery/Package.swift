// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PlantDelivery",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .executable(
            name: "PlantDelivery",
            targets: ["PlantDelivery"]
        )
    ],
    targets: [
        .executableTarget(
            name: "PlantDelivery",
            path: "Sources"
        )
    ]
)
