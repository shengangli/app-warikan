# Warikan App Store Submission Guide

## 🚀 Complete App Store Submission Checklist

### Phase 1: Pre-Submission Requirements

#### ✅ Apple Developer Account Setup
- [ ] **Apple Developer Program membership** ($99/year)
- [ ] **Certificates & Provisioning Profiles** set up
- [ ] **App ID created** with bundle identifier: `com.kitamurastudio.warikan`

#### ✅ App Store Connect Setup
1. **Create New App**
   - App Name: "シェア勘"
   - Bundle ID: `com.kitamurastudio.warikan`
   - Primary Language: Japanese
   - Platform: iOS

2. **App Information**
   - **Category**: Finance > Personal Finance
   - **Content Rating**: 4+ (No objectionable content)
   - **Copyright**: Your name/company

#### ✅ Required App Assets

**App Icons (Required Sizes for iOS):**
- [ ] 1024x1024 (App Store)
- [ ] 180x180 (iPhone)
- [ ] 120x120 (iPhone smaller)
- [ ] 167x167 (iPad Pro)
- [ ] 152x152 (iPad)
- [ ] 76x76 (iPad smaller)

**Screenshots (Required):**
- [ ] iPhone 6.7" (iPhone 14 Pro Max): 1290x2796
- [ ] iPhone 6.5" (iPhone 11 Pro Max): 1242x2688
- [ ] iPhone 5.5" (iPhone 8 Plus): 1242x2208
- [ ] iPad Pro 12.9" (3rd gen): 2048x2732

### Phase 2: App Store Metadata

#### ✅ App Description (Japanese)
```
シェア勘 - グループの支出を簡単に分割

友人との旅行、食事、グループ活動での支出を簡単に追跡・分割できるアプリです。

主な機能：
• グループ支出の追跡
• 個人支払いの記録
• 自動精算計算
• オフライン対応
• QRコード共有
• 日本円表示（¥1,000形式）

完全オフラインで動作し、バックエンド不要。QRコードでグループデータを簡単に共有できます。
```

#### ✅ Keywords (Japanese)
```
割り勘,支出,精算,グループ,旅行,食事,支払い,計算,シェア,友達
```

#### ✅ Support Information
- **Support URL**: (You need to create this)
- **Marketing URL**: (Optional)
- **Support Email**: (Your email)

### Phase 3: Privacy & Legal Requirements

#### ✅ Privacy Policy (REQUIRED)
Create a privacy policy covering:
- Camera permission usage (QR scanning)
- Local data storage (AsyncStorage)
- No data collection/sharing
- Japanese language version required

**Sample Privacy Policy Content:**
```
プライバシーポリシー

本アプリ「シェア勘」は以下の情報を使用します：

1. カメラアクセス
   - QRコードスキャン機能のみに使用
   - 画像の保存や送信は行いません

2. ローカルデータストレージ
   - グループ情報と支出データをデバイス内に保存
   - サーバーへの送信は行いません

3. データ収集
   - 個人情報の収集は行いません
   - 使用状況の追跡は行いません

お問い合わせ: [your-email@example.com]
```

#### ✅ App Privacy Information
In App Store Connect, declare:
- **Data Not Collected**: Select this option
- **Camera Access**: Required for QR code scanning
- **No tracking across apps/websites**

### Phase 4: Build & Submit

#### ✅ Production Build
Your build is currently being created via EAS Build.

Once complete:
1. **Download the .ipa file** from EAS Build
2. **Upload to App Store Connect** via Xcode or Transporter app
3. **Process the build** (takes 5-10 minutes)
4. **Select the build** for your app version

#### ✅ Test Information
- **Demo Account**: Not required (no login)
- **Review Notes**: 
```
このアプリは完全にオフラインで動作します。
QRコードスキャン機能をテストするには、別のデバイスでグループを作成し、
生成されたQRコードをスキャンしてください。
```

### Phase 5: Final Submission

#### ✅ Age Rating Questionnaire
- Simulated Gambling: None
- Medical/Treatment Information: None
- Violence: None
- **Result**: 4+ rating

#### ✅ Export Compliance
- **Does your app use encryption?**: No
- **Is your app designed to use cryptography?**: No

#### ✅ Content Rights
- Does your app contain third-party content?: No

#### ✅ Advertising Identifier
- Does this app use the Advertising Identifier?: No

### Phase 6: Review Process

#### ✅ Timeline
- **Review Time**: 1-7 days typically
- **Processing**: 24-48 hours after approval
- **Available on App Store**: Immediately after processing

#### ✅ Common Rejection Reasons to Avoid
- Missing privacy policy
- Crashes on launch
- Missing required device support
- Unclear app functionality
- Missing metadata translations

### Phase 7: Post-Submission

#### ✅ After Approval
- [ ] Monitor app performance
- [ ] Respond to user reviews
- [ ] Plan updates if needed

## 🛠 Tools You'll Need

1. **Xcode** (for final upload) or **Transporter** app
2. **App Store Connect** account
3. **Screenshot generation** tools
4. **Icon generation** tools (like appicon.co)

## 📞 Next Steps

1. **Wait for current EAS build to complete**
2. **Create Apple Developer account** if not done
3. **Set up App Store Connect** listing
4. **Create required screenshots**
5. **Write privacy policy**
6. **Upload build and submit**

## ⚠️ Important Notes

- Keep your bundle identifier as `com.kitamurastudio.warikan`
- Ensure all text is in Japanese for Japanese market
- Test thoroughly on physical iOS devices
- Have screenshots from real devices, not simulators

---

Good luck with your App Store submission! 🍀 