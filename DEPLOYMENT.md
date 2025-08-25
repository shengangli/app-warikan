# 🚀 Warikan App - iOS Deployment Guide

## 📱 Pre-requisites

### 1. **Apple Developer Account**
- [ ] Sign up for Apple Developer Program ($99/year)
- [ ] Verify your developer account is active

### 2. **EAS CLI Setup**
```bash
npm install -g @expo/eas-cli
eas login
```

### 3. **Project Configuration**
```bash
# Initialize EAS project
eas build:configure
```

## 🔧 Build Configuration

### 1. **Update Bundle Identifier**
Edit `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.warikan"
    }
  }
}
```
**⚠️ Replace `yourcompany` with your actual company/developer name**

### 2. **App Store Assets** 
Create required assets in `/assets`:
- `icon.png` (1024x1024)
- `splash-icon.png` (recommended 1242x2688)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)

## 🏗️ Build Process

### 1. **Development Build** (For Testing Camera Features)
```bash
# Build for iOS
eas build --platform ios --profile development

# Install on device
eas build:run -p ios
```

### 2. **Production Build** (For App Store)
```bash
# Build for App Store
eas build --platform ios --profile production
```

### 3. **Submit to App Store**
```bash
# Automatic submission
eas submit --platform ios

# Manual submission (if you prefer)
# Download the .ipa file and upload via Xcode or App Store Connect
```

## 📝 App Store Information

### App Details:
- **Name**: Warikan - 割り勘計算機
- **Subtitle**: グループの支出を簡単に分割・精算
- **Keywords**: 割り勘, 支出管理, グループ会計, 精算, 計算機
- **Category**: Finance
- **Age Rating**: 4+ (All Ages)

### Description (Japanese):
```
【Warikan - 簡単グループ支出管理】

友達や同僚との飲み会、旅行、ランチ代の割り勘を簡単に管理できるアプリです。

✨ 主な機能
• グループ作成とメンバー追加
• 支出の記録と自動計算
• 最適な精算方法の提案
• QRコードでのグループ共有
• オフライン対応

🎯 こんな場面で活躍
• 飲み会や食事会の会計
• 旅行での費用分担
• シェアハウスの共同費用
• イベントの参加費管理

💡 特徴
• 直感的な操作で誰でも簡単
• 美しいデザインとスムーズな動作
• プライベート情報の安全な管理
• 日本語に完全対応

複雑な計算もWarikanにお任せ！
公平で透明な精算を実現します。
```

### Privacy Policy Points:
- データはデバイス内に安全に保存
- 個人情報の外部送信なし
- カメラはQRコードスキャンのみに使用

## 🔄 Version Management

### Updating the App:
1. **Increment version** in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1",
       "ios": {
         "buildNumber": "2"
       }
     }
   }
   ```

2. **Build and submit**:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

## 🧪 Testing

### Internal Testing:
```bash
# Build for TestFlight
eas build --platform ios --profile preview
```

### Features to Test:
- [ ] Group creation and member management
- [ ] Expense adding and calculation
- [ ] QR code generation and scanning
- [ ] Settlement calculations
- [ ] Offline functionality
- [ ] Data persistence

## 📋 Checklist for App Store Submission

### Technical:
- [ ] App builds successfully
- [ ] All features work on physical device
- [ ] Camera permissions work correctly
- [ ] Proper error handling
- [ ] App follows iOS Human Interface Guidelines

### App Store Requirements:
- [ ] App metadata filled out
- [ ] Screenshots uploaded (6.5", 5.5", iPad)
- [ ] App review information provided
- [ ] Privacy policy URL (if collecting data)
- [ ] Age rating completed

### Legal/Business:
- [ ] Terms of Service (if needed)
- [ ] Privacy Policy
- [ ] App Store Review Guidelines compliance

## 🚨 Common Issues & Solutions

### Build Errors:
```bash
# Clear cache and rebuild
eas build --platform ios --clear-cache

# Check for dependency issues
npm install
```

### Camera Not Working:
- Ensure `expo-barcode-scanner` is properly configured
- Check camera permissions in `app.json`
- Test on physical device (not simulator)

### App Store Rejection:
- Review Apple's App Review Guidelines
- Ensure all features work as described
- Add proper error handling for edge cases

## 📞 Support Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)

---

🎉 **Congratulations!** Your Warikan app is ready for the iOS App Store! 