import SwiftUI

public struct DeliveryPartnerRegisterView: View {
    @ObservedObject var viewModel: DeliveryAppViewModel
    @Environment(\.dismiss) var dismiss
    @State private var registrationSuccess = false
    @State private var showPassword = false

    let vehicleOptions = ["Electric Scooter", "Petrol Bike", "Cycle", "Electric Bicycle", "Auto Rickshaw"]

    public init(viewModel: DeliveryAppViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        ZStack {
            CustomerTheme.bgDark.ignoresSafeArea()

            if registrationSuccess {
                successView
            } else {
                formView
            }
        }
    }

    // MARK: - Success View
    var successView: some View {
        VStack(spacing: 28) {
            Spacer()
            ZStack {
                Circle()
                    .fill(CustomerTheme.emeraldGradient.opacity(0.2))
                    .frame(width: 120, height: 120)
                Image(systemName: "checkmark.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 64, height: 64)
                    .foregroundColor(CustomerTheme.accentEmerald)
            }
            VStack(spacing: 12) {
                Text("Application Submitted!")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(CustomerTheme.textPrimary)
                    .multilineTextAlignment(.center)

                Text(viewModel.regSuccess)
                    .font(.system(size: 15))
                    .foregroundColor(CustomerTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            Button(action: { dismiss() }) {
                Text("Back to Login")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(CustomerTheme.emeraldGradient)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 40)
            Spacer()
        }
    }

    // MARK: - Form View
    var formView: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 0) {

                // Header
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 22))
                            .foregroundColor(CustomerTheme.textMuted)
                    }
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)

                VStack(spacing: 8) {
                    Text("JOIN THE FLEET")
                        .font(.system(size: 12, weight: .heavy, design: .monospaced))
                        .foregroundColor(CustomerTheme.accentGold)
                        .tracking(4)
                    Text("Delivery Partner Registration")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                    Text("Earn ₹400–₹1200/day on your schedule")
                        .font(.system(size: 13))
                        .foregroundColor(CustomerTheme.textSecondary)
                }
                .multilineTextAlignment(.center)
                .padding(.vertical, 20)

                VStack(spacing: 20) {

                    // Section: Personal Info
                    sectionHeader("Personal Information", icon: "person.fill")
                    inputField("Full Name *", icon: "person", text: $viewModel.regName)
                    inputField("Email Address *", icon: "envelope", text: $viewModel.regEmail, keyboard: .emailAddress)
                    passwordField("Password *", text: $viewModel.regPassword, show: $showPassword)
                    inputField("Phone Number *", icon: "phone", text: $viewModel.regPhone, keyboard: .phonePad)

                    // Section: Vehicle
                    sectionHeader("Vehicle Details", icon: "bicycle")

                    // Vehicle type picker
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Vehicle Type", systemImage: "car.side")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(CustomerTheme.textSecondary)
                        Menu {
                            ForEach(vehicleOptions, id: \.self) { option in
                                Button(option) { viewModel.regVehicle = option }
                            }
                        } label: {
                            HStack {
                                Text(viewModel.regVehicle)
                                    .foregroundColor(CustomerTheme.textPrimary)
                                    .font(.system(size: 15))
                                Spacer()
                                Image(systemName: "chevron.down")
                                    .foregroundColor(CustomerTheme.textMuted)
                                    .font(.system(size: 13))
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 13)
                            .background(CustomerTheme.cardBgElevated)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(CustomerTheme.glassBorderActive, lineWidth: 1)
                            )
                        }
                    }

                    inputField("Vehicle Number", icon: "number", text: $viewModel.regVehicleNumber, placeholder: "e.g. KA-05-EQ-8821")

                    // Section: Documents
                    sectionHeader("KYC Documents", icon: "doc.badge.checkmark")
                    inputField("Driving License Number", icon: "creditcard", text: $viewModel.regDL, placeholder: "e.g. KA-01-2023-0012345")
                    inputField("Aadhaar Number", icon: "person.text.rectangle", text: $viewModel.regAadhaar, placeholder: "e.g. 1234-5678-9012")

                    // Error
                    if !viewModel.regError.isEmpty {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                                .font(.system(size: 13))
                            Text(viewModel.regError)
                                .font(.system(size: 13))
                                .foregroundColor(.orange)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(12)
                        .background(Color.orange.opacity(0.08))
                        .cornerRadius(10)
                    }

                    // Terms notice
                    Text("By registering, your application will be reviewed by a Super Admin. You can log in once approved.")
                        .font(.system(size: 12))
                        .foregroundColor(CustomerTheme.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)

                    // Submit
                    Button(action: {
                        viewModel.register { success in
                            if success { registrationSuccess = true }
                        }
                    }) {
                        HStack(spacing: 10) {
                            if viewModel.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                    .scaleEffect(0.85)
                            } else {
                                Image(systemName: "paperplane.fill")
                                    .font(.system(size: 15))
                            }
                            Text(viewModel.isLoading ? "Submitting…" : "Submit Application")
                                .font(.system(size: 16, weight: .bold))
                        }
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(
                            viewModel.isLoading
                                ? AnyView(Color.gray.opacity(0.6))
                                : AnyView(CustomerTheme.emeraldGradient)
                        )
                        .cornerRadius(14)
                        .shadow(color: CustomerTheme.accentEmerald.opacity(0.35), radius: 10, y: 4)
                    }
                    .disabled(viewModel.isLoading)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 50)
            }
        }
    }

    // MARK: - Helpers
    func sectionHeader(_ title: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 13))
                .foregroundColor(CustomerTheme.accentMint)
            Text(title.uppercased())
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(CustomerTheme.accentMint)
                .tracking(1.5)
            Spacer()
        }
        .padding(.top, 8)
    }

    func inputField(_ label: String, icon: String, text: Binding<String>, placeholder: String = "", keyboard: UIKeyboardType = .default) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(label, systemImage: icon)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(CustomerTheme.textSecondary)
            TextField(placeholder.isEmpty ? label.replacingOccurrences(of: " *", with: "") : placeholder, text: text)
                .keyboardType(keyboard)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .padding(.horizontal, 14)
                .padding(.vertical, 13)
                .background(CustomerTheme.cardBgElevated)
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CustomerTheme.glassBorderActive, lineWidth: 1)
                )
                .foregroundColor(CustomerTheme.textPrimary)
        }
    }

    func passwordField(_ label: String, text: Binding<String>, show: Binding<Bool>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(label, systemImage: "lock")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(CustomerTheme.textSecondary)
            HStack {
                Group {
                    if show.wrappedValue {
                        TextField("••••••••", text: text)
                    } else {
                        SecureField("••••••••", text: text)
                    }
                }
                .autocapitalization(.none)
                .foregroundColor(CustomerTheme.textPrimary)
                Button(action: { show.wrappedValue.toggle() }) {
                    Image(systemName: show.wrappedValue ? "eye.slash" : "eye")
                        .foregroundColor(CustomerTheme.textMuted)
                        .font(.system(size: 14))
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .background(CustomerTheme.cardBgElevated)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(CustomerTheme.glassBorderActive, lineWidth: 1)
            )
        }
    }
}
