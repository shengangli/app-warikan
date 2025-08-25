# シェア勘 - Japanese Payment Splitting App

A React Native/Expo mobile app for splitting expenses among friends during trips, dinners, and group activities. Built with TypeScript and designed for Japanese users.

## Features

### 🏠 **Core Functionality**
- **Group Expense Tracking**: Track expenses during trips, dinners, or any group activity
- **Individual Payments**: Each person can add expenses they personally paid for
- **Automatic Settlement Calculation**: Optimized algorithm to minimize the number of transactions needed
- **Offline-First**: Works completely offline using AsyncStorage, no backend required
- **QR Code Sharing**: Share group data between phones using QR codes
- **Japanese-First UI**: All text in Japanese with proper yen currency formatting (¥1,000)

### 📱 **Screens**
1. **Home Screen** - View all groups, create new groups, or join existing ones
2. **Create Group Screen** - Create new groups with member management and QR code generation
3. **Join Group Screen** - Full-screen QR scanner to join existing groups
4. **Group Detail Screen** - Tab navigation between members and expenses with balance display
5. **Add Expense Screen** - Add new expenses with amount, description, payer, and split selection
6. **Settlement Screen** - Visual payment flows with optimized settlement calculations

### 🔧 **Technical Features**
- **Expo SDK 49+** with TypeScript
- **React Navigation 6** for navigation
- **AsyncStorage** for local data persistence
- **expo-barcode-scanner** for QR code scanning
- **react-native-qrcode-svg** for QR code generation
- **expo-haptics** for tactile feedback
- **expo-crypto** for UUID generation

### 🎨 **UI/UX**
- iOS-style design with React Native elements
- Large touch targets (44pt minimum) for accessibility
- Japanese number formatting with commas (¥1,000)
- Haptic feedback on all interactions
- Color scheme: Blue primary (#007AFF), red for debt, green for credit
- Smooth animations and transitions

## Installation & Setup

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   cd warikan
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Emulator**
   - **iOS**: Press `i` in terminal or run `npm run ios`
   - **Android**: Press `a` in terminal or run `npm run android`
   - **Web**: Press `w` in terminal or run `npm run web`

## App Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   ├── CreateGroupScreen.tsx
│   ├── JoinGroupScreen.tsx
│   ├── GroupDetailScreen.tsx
│   ├── AddExpenseScreen.tsx
│   └── SettlementScreen.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    ├── storage.ts      # AsyncStorage operations
    ├── calculations.ts # Balance and settlement calculations
    └── qr.ts           # QR code encoding/decoding
```

## Data Models

### Group
```typescript
interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: Date;
}
```

### Member
```typescript
interface Member {
  id: string;
  name: string;
}
```

### Expense
```typescript
interface Expense {
  id: string;
  paidBy: string;
  amount: number;
  description: string;
  splitBetween: string[];
  date: Date;
}
```

### Settlement
```typescript
interface Settlement {
  from: string;
  to: string;
  amount: number;
}
```

## Key Algorithms

### Balance Calculation
- Tracks what each person paid vs. their share of expenses
- Calculates net balance (positive = owed money, negative = owes money)

### Optimal Settlement
- Uses greedy algorithm to minimize number of transactions
- Matches largest creditor with largest debtor repeatedly
- Continues until all balances are zero

### QR Data Format
- Base64 encoded JSON of complete group data
- Includes compression for large groups
- Merge logic prevents duplicate expenses by timestamp

## Usage Guide

### Creating a Group
1. Tap "新しいグループ" (New Group)
2. Enter group name (e.g., "飲み会", "旅行")
3. Add members using the + button
4. Tap "グループを作成" (Create Group)
5. Share the generated QR code with other members

### Joining a Group
1. Tap "グループに参加" (Join Group)
2. Grant camera permission if prompted
3. Scan the QR code from group creator
4. Group data will be merged automatically

### Adding Expenses
1. Open a group and tap the + floating button
2. Enter amount in yen (¥)
3. Add description (e.g., "dinner", "taxi")
4. Select who paid from the horizontal scroll
5. Check/uncheck who should split the cost
6. Tap "保存" (Save)

### Settlement
1. In group detail, tap "精算する" (Settle Up)
2. View optimized payment flows
3. See visual breakdown of who pays whom
4. Share settlement results via QR code

## Offline Functionality

- All data stored locally in AsyncStorage
- No network connection required
- QR codes contain complete group state
- Automatic conflict resolution by timestamp
- Full import/export capability via QR codes

## Accessibility

- Full VoiceOver/TalkBack support
- Semantic labels in Japanese
- High contrast color ratios (WCAG compliant)
- Large text support
- Haptic feedback for all interactions

## Japanese Text Reference

- 新しいグループ (New Group)
- グループに参加 (Join Group)
- グループ名 (Group Name)
- メンバー (Members)
- 支出 (Expenses)
- 支出を追加 (Add Expense)
- 金額 (Amount)
- 内容 (Description)
- 支払者 (Payer)
- 精算 (Settlement)
- 合計支出 (Total Spending)
- 保存 (Save)
- キャンセル (Cancel)

## Development

### Project Structure
The app follows a clean architecture with separation of concerns:
- **Screens**: UI components for each screen
- **Utils**: Business logic and data operations  
- **Types**: TypeScript interfaces for type safety
- **Storage**: AsyncStorage wrapper functions

### Testing
```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit
```

### Building for Production
```bash
# Build for iOS
eas build --platform ios

# Build for Android  
eas build --platform android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the GitHub Issues page
2. Create a new issue with detailed description
3. Include device/OS information for bugs

---

**シェア勘** - Making group expense splitting simple and fair! 🇯🇵 