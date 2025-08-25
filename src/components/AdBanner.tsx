import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';

interface AdBannerProps {
  style?: any;
}

const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
  // For Expo Go, show placeholder. Real ads will work in production build.
  const isExpoGo = __DEV__ && Platform.OS === 'ios';

  if (isExpoGo) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>📱 広告スペース</Text>
        <Text style={styles.placeholderSubtext}>本番ビルドで広告が表示されます</Text>
      </View>
    );
  }

  // This will be replaced with actual Google Mobile Ads in production build
  try {
    // Only load mobile ads on native platforms
    if (Platform.OS === 'web') {
      throw new Error('Web platform - use placeholder');
    }
    const { BannerAd, BannerAdSize } = require('react-native-google-mobile-ads');
    
    return (
      <View style={[styles.container, style]}>
        <BannerAd
          unitId="ca-app-pub-3945883757034309~5911558760"
          size={BannerAdSize.ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdFailedToLoad={(error: Error) => {}}
          onAdLoaded={() => {}}
        />
      </View>
    );
  } catch (error) {
    // Fallback for Expo Go
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>📱 広告スペース</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F8F7F5',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E6E3',
  },
  placeholder: {
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default AdBanner; 