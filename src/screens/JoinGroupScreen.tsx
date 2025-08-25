import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { RootStackParamList } from '../types';
import { mergeGroup } from '../utils/storage';
import { decodeGroupFromQR, isValidQRData } from '../utils/qr';

// Conditional import for barcode scanner to avoid native module errors in Expo Go
let BarCodeScanner: any = null;
try {
  BarCodeScanner = require('expo-barcode-scanner').BarCodeScanner;
} catch (error) {
  // BarCodeScanner not available, camera scanning disabled
}

type JoinGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JoinGroup'>;

interface Props {
  navigation: JoinGroupScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const JoinGroupScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      try {
        // Check if barcode scanner is available
        if (!BarCodeScanner || !BarCodeScanner.requestPermissionsAsync) {
          setHasPermission(false);
          return;
        }
        
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        // Barcode scanner not available
        setHasPermission(false);
      }
    };

    getBarCodeScannerPermissions();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    await processQRData(data);
  };

  const processQRData = async (data: string) => {
    setScanned(true);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!isValidQRData(data)) {
        Alert.alert(
          '無効なQRコード',
          'Warikanのグループ用QRコードを使用してください',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      const group = decodeGroupFromQR(data);
      await mergeGroup(group);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '🎉 参加成功',
        `グループ「${group.name}」に参加しました！`,
        [
          {
            text: 'グループを見る',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'エラー',
        'グループの参加に失敗しました',
        [{ text: 'もう一度', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>📷</Text>
          <Text style={styles.loadingTitle}>カメラを準備中...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false || !BarCodeScanner) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>カメラアクセスが必要です</Text>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>📷</Text>
            <Text style={styles.errorTitle}>カメラの許可が必要です</Text>
            <Text style={styles.errorText}>
              QRコードをスキャンしてグループに参加するには、{'\n'}
              カメラへのアクセスを許可してください。
            </Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                Alert.alert(
                  '設定を開く',
                  'iOSの設定アプリでWarikanにカメラアクセスを許可してください',
                  [
                    { text: 'キャンセル', style: 'cancel' },
                    { text: '設定を開く', onPress: () => {} }
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsButtonText}>⚙️ 設定を開く</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>グループに参加</Text>
        <Text style={styles.subtitle}>QRコードをスキャンして参加</Text>
      </View>

      {/* Camera Content */}
      <View style={styles.content}>
        <View style={styles.cameraContainer}>
          <View style={styles.cameraCard}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.camera}
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            />
            
            {/* Scanner Overlay */}
            <View style={styles.scannerOverlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  {loading ? '⏳ 処理中...' : '📱 QRコードを枠内に合わせてください'}
                </Text>
              </View>
            </View>
          </View>

          {scanned && !loading && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setScanned(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>🔄 もう一度スキャン</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>💡 使い方</Text>
          <Text style={styles.instructionsText}>
            1. グループ作成者にQRコードを表示してもらう{'\n'}
            2. カメラで QRコードをスキャン{'\n'}
            3. 自動的にグループに参加完了！
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingText: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
    marginBottom: 20,
  },
  cameraCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    overflow: 'hidden',
    aspectRatio: 4/3,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 16,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
    maxWidth: 350,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  settingsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JoinGroupScreen; 