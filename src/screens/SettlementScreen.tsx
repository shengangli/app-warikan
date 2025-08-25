import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';

import { RootStackParamList, Group, Settlement } from '../types';
import { loadGroups } from '../utils/storage';
import { calculateBalances, calculateOptimalSettlements, formatYen, getMemberName } from '../utils/calculations';

type SettlementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settlement'>;
type SettlementScreenRouteProp = RouteProp<RootStackParamList, 'Settlement'>;

interface Props {
  navigation: SettlementScreenNavigationProp;
  route: SettlementScreenRouteProp;
}

const SettlementScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadGroupAndCalculate = useCallback(async () => {
    try {
      const groups = await loadGroups();
      const foundGroup = groups.find(g => g.id === groupId);
      
      if (foundGroup) {
        setGroup(foundGroup);
        const balances = calculateBalances(foundGroup);
        const optimalSettlements = calculateOptimalSettlements(balances);
        setSettlements(optimalSettlements);
        
        // Animate in the settlements
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      Alert.alert('エラー', 'グループの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [groupId, fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      loadGroupAndCalculate();
    }, [loadGroupAndCalculate])
  );

  const handleShowQR = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowQR(true);
  };

  const generateSettlementText = (): string => {
    if (!group || settlements.length === 0) return '';
    
    let text = `${group.name} - 精算結果\n\n`;
    text += `${settlements.length}回の送金で精算完了\n\n`;
    
    settlements.forEach((settlement, index) => {
      const fromName = getMemberName(group.members, settlement.from);
      const toName = getMemberName(group.members, settlement.to);
      text += `${index + 1}. ${fromName} → ${toName}: ${formatYen(settlement.amount)}\n`;
    });
    
    text += `\nWarikanアプリで生成`;
    return text;
  };

  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>計算中...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>グループが見つかりません</Text>
      </View>
    );
  }

  if (settlements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>精算不要</Text>
        <Text style={styles.emptySubtitle}>
          すべてのメンバーの収支がバランスしています
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>精算完了まで</Text>
          <Text style={styles.summaryCount}>
            {settlements.length}回の送金
          </Text>
        </View>

        {/* Settlement List */}
        <View style={styles.settlementsContainer}>
          {settlements.map((settlement, index) => {
            const fromMember = group.members.find(m => m.id === settlement.from);
            const toMember = group.members.find(m => m.id === settlement.to);
            
            return (
              <View key={index} style={styles.settlementItem}>
                <View style={styles.settlementHeader}>
                  <Text style={styles.settlementNumber}>{index + 1}</Text>
                </View>
                
                <View style={styles.settlementFlow}>
                  {/* From Member */}
                  <View style={styles.memberContainer}>
                    <View style={[styles.memberAvatar, styles.payerAvatar]}>
                      <Text style={styles.payerInitial}>
                        {fromMember ? getInitials(fromMember.name) : '?'}
                      </Text>
                    </View>
                    <Text style={[styles.memberName, styles.payerName]}>
                      {fromMember?.name || 'Unknown'}
                    </Text>
                  </View>
                  
                  {/* Arrow and Amount */}
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                    <View style={styles.amountBadge}>
                      <Text style={styles.amountText}>
                        {formatYen(settlement.amount)}
                      </Text>
                    </View>
                  </View>
                  
                  {/* To Member */}
                  <View style={styles.memberContainer}>
                    <View style={[styles.memberAvatar, styles.receiverAvatar]}>
                      <Text style={styles.receiverInitial}>
                        {toMember ? getInitials(toMember.name) : '?'}
                      </Text>
                    </View>
                    <Text style={[styles.memberName, styles.receiverName]}>
                      {toMember?.name || 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleShowQR}
            activeOpacity={0.8}
          >
            <Text style={styles.qrButtonText}>QRコードで共有</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Modal */}
        {showQR && (
          <View style={styles.qrModal}>
            <View style={styles.qrModalContent}>
              <Text style={styles.qrModalTitle}>精算結果</Text>
              <Text style={styles.qrModalSubtitle}>
                このQRコードを保存・共有してください
              </Text>
              
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={generateSettlementText()}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowQR(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  settlementsContainer: {
    marginBottom: 24,
  },
  settlementItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settlementHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  settlementNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#F2F2F7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  settlementFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberContainer: {
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  payerAvatar: {
    backgroundColor: '#FF3B30',
  },
  receiverAvatar: {
    backgroundColor: '#34C759',
  },
  payerInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  receiverInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 14,
    textAlign: 'center',
  },
  payerName: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  receiverName: {
    color: '#34C759',
    fontWeight: '600',
  },
  arrowContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  arrow: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountBadge: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  amountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 20,
  },
  qrButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  qrModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  qrModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrCodeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettlementScreen; 