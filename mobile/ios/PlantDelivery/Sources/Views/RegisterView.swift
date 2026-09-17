import SwiftUI

struct RegisterView: View {
    @ObservedObject var vm: DeliveryViewModel
    @Environment(\.dismiss) var dismiss
    @State private var submitted = false

    let vehicles = ["Electric Scooter", "Electric Bicycle", "Petrol Bike",
                    "Cycle", "Auto Rickshaw", "Electric Car"]

    var body: some View {
        ZStack {
            DTheme.bg.ignoresSafeArea()

            if submitted {
                SuccessView(message: vm.regSuccessMsg, onDismiss: { dismiss() })
            } else {
                formBody
            }
        }
    }

    // MARK: - Form
    var formBody: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 0) {

                // Close button row
                HStack {
                    Button(action: { dismiss() }) {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.left")
                            Text("Back")
                        }
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(DTheme.textMuted)
                    }
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)

                // Header
                VStack(spacing: 8) {
                    Text("JOIN THE FLEET")
                        .font(.system(size: 11, weight: .heavy, design: .monospaced))
                        .foregroundColor(DTheme.gold)
                        .tracking(4)
                    Text("Delivery Partner Application")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(DTheme.textPrimary)
                    Text("Earn ₹400–₹1200/day · Flexible hours · Weekly payouts")
                        .font(.system(size: 13))
                        .foregroundColor(DTheme.textSecondary)

                    // Perks row
                    HStack(spacing: 14) {
                        perkBadge(icon: "indianrupeesign.circle", text: "₹145 avg/trip")
                        perkBadge(icon: "clock",                  text: "Flexible hours")
                        perkBadge(icon: "bolt.fill",              text: "Instant payout")
                    }
                    .padding(.top, 6)
                }
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
                .padding(.vertical, 24)

                // Form sections
                VStack(spacing: 22) {

                    // Personal Info
                    DSectionHeader(icon: "person.fill", title: "Personal Information")
                    DInputField(label: "Full Name *", icon: "person", placeholder: "Ramesh Kumar", text: $vm.regName)
                    DInputField(label: "Email Address *", icon: "envelope", placeholder: "rider@example.com",
                                text: $vm.regEmail, keyboard: .emailAddress)
                    DInputField(label: "Password *", icon: "lock", placeholder: "Min. 8 characters",
                                text: $vm.regPassword, isSecure: true)
                    DInputField(label: "Mobile Number *", icon: "phone", placeholder: "+91 98450 XXXXX",
                                text: $vm.regPhone, keyboard: .phonePad)

                    // Vehicle
                    DSectionHeader(icon: "bicycle", title: "Vehicle Details")

                    // Vehicle type menu
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Vehicle Type", systemImage: "car.side")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(DTheme.textSecondary)
                        Menu {
                            ForEach(vehicles, id: \.self) { v in
                                Button(v) { vm.regVehicle = v }
                            }
                        } label: {
                            HStack {
                                Text(vm.regVehicle)
                                    .foregroundColor(DTheme.textPrimary)
                                    .font(.system(size: 15))
                                Spacer()
                                Image(systemName: "chevron.up.chevron.down")
                                    .foregroundColor(DTheme.textMuted)
                                    .font(.system(size: 13))
                            }
                            .padding(.horizontal, 14).padding(.vertical, 13)
                            .background(DTheme.surfaceRaised)
                            .cornerRadius(13)
                            .overlay(RoundedRectangle(cornerRadius: 13).stroke(DTheme.borderActive, lineWidth: 1))
                        }
                    }

                    DInputField(label: "Vehicle Registration Number", icon: "number",
                                placeholder: "KA-05-EQ-8821", text: $vm.regVehicleNumber)

                    // KYC
                    DSectionHeader(icon: "doc.badge.checkmark", title: "KYC Documents")
                    DInputField(label: "Driving License Number", icon: "creditcard",
                                placeholder: "KA-01-2023-XXXXXXX", text: $vm.regDL)
                    DInputField(label: "Aadhaar Card Number", icon: "person.text.rectangle",
                                placeholder: "XXXX-XXXX-XXXX", text: $vm.regAadhaar)

                    DErrorBanner(message: vm.regError)

                    // Terms notice
                    HStack(spacing: 8) {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(DTheme.emerald)
                            .font(.system(size: 13))
                        Text("Your application will be reviewed by Admin. You can log in once approved.")
                            .font(.system(size: 12))
                            .foregroundColor(DTheme.textMuted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12)
                    .background(DTheme.emerald.opacity(0.07))
                    .cornerRadius(12)

                    DPrimaryButton(
                        label: "Submit Application",
                        icon: "paperplane.fill",
                        isLoading: vm.isLoading,
                        action: {
                            vm.register { success in
                                if success { submitted = true }
                            }
                        },
                        gradient: DTheme.gradientGold
                    )
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 60)
            }
        }
    }

    // MARK: - Helpers
    func perkBadge(icon: String, text: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon).font(.system(size: 11)).foregroundColor(DTheme.gold)
            Text(text).font(.system(size: 11, weight: .semibold)).foregroundColor(DTheme.textSecondary)
        }
        .padding(.horizontal, 10).padding(.vertical, 6)
        .background(DTheme.surfaceRaised)
        .cornerRadius(20)
        .overlay(RoundedRectangle(cornerRadius: 20).stroke(DTheme.border, lineWidth: 1))
    }
}

// MARK: - Success screen
struct SuccessView: View {
    let message: String
    let onDismiss: () -> Void

    var body: some View {
        VStack(spacing: 28) {
            Spacer()
            ZStack {
                Circle().fill(DTheme.gradientEmerald.opacity(0.18)).frame(width: 130, height: 130)
                Image(systemName: "checkmark.circle.fill")
                    .resizable().scaledToFit().frame(width: 68, height: 68)
                    .foregroundStyle(DTheme.gradientEmerald)
            }
            VStack(spacing: 12) {
                Text("Application Submitted! 🎉")
                    .font(.system(size: 24, weight: .bold)).foregroundColor(DTheme.textPrimary)
                Text(message)
                    .font(.system(size: 15)).foregroundColor(DTheme.textSecondary)
                    .multilineTextAlignment(.center).padding(.horizontal, 32)
            }
            DPrimaryButton(label: "Back to Login", icon: "arrow.left.circle.fill",
                           isLoading: false, action: onDismiss)
            .padding(.horizontal, 40)
            Spacer()
        }
    }
}
