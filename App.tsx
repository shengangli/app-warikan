import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import mobileAds from 'react-native-google-mobile-ads';

import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import JoinGroupScreen from './src/screens/JoinGroupScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import SettlementScreen from './src/screens/SettlementScreen';
import { Colors } from './src/constants/colors';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Google Mobile Ads initialization - will be enabled in production builds
    // mobileAds().initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'Warikan',
              headerStyle: {
                backgroundColor: Colors.primary,
              },
            }} 
          />
          <Stack.Screen 
            name="CreateGroup" 
            component={CreateGroupScreen} 
            options={{ title: '新しいグループ' }} 
          />
          <Stack.Screen 
            name="JoinGroup" 
            component={JoinGroupScreen} 
            options={{ title: 'グループに参加' }} 
          />
          <Stack.Screen 
            name="GroupDetail" 
            component={GroupDetailScreen} 
            options={{ title: 'グループ詳細' }} 
          />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen} 
            options={{ title: '支出を追加' }} 
          />
          <Stack.Screen 
            name="Settlement" 
            component={SettlementScreen} 
            options={{ title: '精算' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
