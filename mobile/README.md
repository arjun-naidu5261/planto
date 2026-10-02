# PlantMe Mobile App

React Native (Expo) app for Android & iOS.

## Screens
| Screen | Description |
|---|---|
| **Home** | Hero banner, featured plants grid, Care Pass CTA, express delivery promise |
| **Shop** | Full catalog with filters (Indoor/Outdoor/Pet-Safe/Low-Light), sort by price/popularity |
| **Product Detail** | Hero image, care specs, reviews, Add to Cart with quantity stepper |
| **Cart** | Cart items, delivery mode selector, coupon (PLANTME50/FIRSTPLANT), Care Pass toggle, order confirmation |
| **AI Plant Doctor** | Real-time symptom chat, typing animation, live botanist call CTA |
| **Profile** | Login, Care Pass management, order history, quick actions, settings |

## Run Locally

```bash
cd mobile
npm start         # Opens Expo DevTools
npm run ios       # Run on iOS Simulator
npm run android   # Run on Android Emulator
npm run web       # Run in browser
```

## EAS Build (App Store / Play Store)

```bash
npm install -g eas-cli
eas login
eas build --platform ios     # Build for iOS App Store
eas build --platform android # Build for Google Play Store
eas submit --platform ios    # Submit to App Store
eas submit --platform android # Submit to Play Store
```

## Demo Credentials

- Email: `customer@plantme.in`
- Password: `plantme123`

## Tech Stack

- **Framework**: React Native with Expo SDK 57
- **Navigation**: React Navigation 7 (Bottom Tabs + Stack)
- **UI**: Custom design system with `expo-linear-gradient`, `@expo/vector-icons`
- **State**: React Context API
- **API**: Connects to PlantMe backend at `http://localhost:3001/api`
