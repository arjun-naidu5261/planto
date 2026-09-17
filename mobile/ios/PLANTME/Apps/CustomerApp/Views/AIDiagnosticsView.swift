import SwiftUI

struct AIDiagnosticsView: View {
    @ObservedObject var viewModel: CustomerAppViewModel
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 20) {
                VStack(spacing: 4) {
                    Text("AI Plant Doctor")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(CustomerTheme.textPrimary)
                    Text("Instant Leaf Scan & Diagnosis")
                        .font(.system(size: 13))
                        .foregroundColor(CustomerTheme.textSecondary)
                }
                .padding(.top, 20)
                
                // Clean Scanner Box
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(CustomerTheme.cardBgElevated)
                        .frame(height: 220)
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(CustomerTheme.glassBorderActive, lineWidth: 1))
                    
                    VStack(spacing: 14) {
                        if viewModel.isDiagnosing {
                            ProgressView()
                                .accentColor(CustomerTheme.accentEmerald)
                            Text("Analyzing Leaf Patterns...")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(CustomerTheme.accentMint)
                        } else {
                            Text("Scan Leaf Photo")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(CustomerTheme.textPrimary)
                            
                            Button(action: { viewModel.diagnosePlant() }) {
                                Text("Run Scan")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(.black)
                                    .padding(.horizontal, 24)
                                    .padding(.vertical, 10)
                                    .background(CustomerTheme.emeraldGradient)
                                    .cornerRadius(12)
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                
                if let result = viewModel.aiDiagnosisResult {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("DIAGNOSIS RESULT")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(CustomerTheme.textMuted)
                                Text(result.diseaseName)
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(CustomerTheme.textPrimary)
                            }
                            Spacer()
                            Text("\(Int(result.confidenceScore * 100))% Match")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(CustomerTheme.accentMint)
                        }
                        
                        Text(result.description)
                            .font(.system(size: 13))
                            .foregroundColor(CustomerTheme.textSecondary)
                            .lineSpacing(3)
                        
                        Divider().background(CustomerTheme.glassBorder)
                        
                        Text("Action Steps")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(CustomerTheme.textPrimary)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            ForEach(result.treatmentSteps, id: \.self) { step in
                                Text("• \(step)")
                                    .font(.system(size: 13))
                                    .foregroundColor(CustomerTheme.textSecondary)
                            }
                        }
                    }
                    .padding(16)
                    .background(CustomerTheme.cardBg)
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(CustomerTheme.glassBorder, lineWidth: 1))
                    .padding(.horizontal, 20)
                }
            }
            .padding(.bottom, 100)
        }
    }
}
