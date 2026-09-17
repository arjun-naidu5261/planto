// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PLANTME",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .executable(
            name: "PlantMe",
            targets: ["PLANTME"])
    ],
    targets: [
        .executableTarget(
            name: "PLANTME",
            path: ".",
            exclude: ["Package.swift"]
        )
    ]
)
