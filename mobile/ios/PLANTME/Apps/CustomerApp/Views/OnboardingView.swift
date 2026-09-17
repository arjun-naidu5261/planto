import SwiftUI

struct OnboardingView: View {
    @ObservedObject var viewModel: CustomerAppViewModel
    @State private var currentPage = 0
    
    let slides = [
        OnboardingSlide(title: "Fresh Greenery Delivered", subtitle: "Hyper-local nursery plants delivered to your doorstep in 30 minutes.", icon: "leaf.fill"),
        OnboardingSlide(title: "AI Plant Doctor", subtitle: "Instant AI diagnostics for sick plants with customized care guides.", icon: "cross.case.fill"),
        OnboardingSlide(title: "Live GPS Tracking", subtitle: "Watch your eco-friendly delivery partner navigate directly to you.", icon: "location.fill")
    ]
    
    var body: some View {
        ZStack {
            CustomerTheme.bgDark
                .ignoresSafeArea()
            
            VStack {
                HStack {
                    Spacer()
                    Button("Skip") {
                        viewModel.hasCompletedOnboarding = true
                    }
                    .foregroundColor(CustomerTheme.textMuted)
                    .font(.system(size: 15, weight: .medium))
                    .padding()
                }
                
                TabView(selection: $currentPage) {
                    ForEach(0..<slides.count, id: \.self) { index in
                        VStack(spacing: 24) {
                            ZStack {
                                Circle()
                                    .fill(CustomerTheme.emeraldGradient.opacity(0.2))
                                    .frame(width: 200, height: 200)
                                
                                Image(systemName: slides[index].icon)
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 80, height: 80)
                                    .foregroundColor(CustomerTheme.accentEmerald)
                            }
                            .padding(.top, 40)
                            
                            VStack(spacing: 12) {
                                Text(slides[index].title)
                                    .font(.system(size: 28, weight: .bold))
                                    .foregroundColor(CustomerTheme.textPrimary)
                                    .multilineTextAlignment(.center)
                                
                                Text(slides[index].subtitle)
                                    .font(.system(size: 16))
                                    .foregroundColor(CustomerTheme.textSecondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 32)
                            }
                        }
                        .tag(index)
                    }
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .always))
                
                Button(action: {
                    if currentPage < slides.count - 1 {
                        withAnimation { currentPage += 1 }
                    } else {
                        viewModel.hasCompletedOnboarding = true
                    }
                }) {
                    Text(currentPage == slides.count - 1 ? "Explore Marketplace" : "Continue")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(CustomerTheme.emeraldGradient)
                        .cornerRadius(16)
                        .shadow(color: CustomerTheme.accentEmerald.opacity(0.4), radius: 10, y: 4)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
    }
}

struct OnboardingSlide {
    let title: String
    let subtitle: String
    let icon: String
}
