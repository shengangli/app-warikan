import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import { RootStackParamList, Group, Balance, Expense } from '../types';
import { loadGroups } from '../utils/storage';
import { calculateBalances, formatYen, getTotalSpending, getMemberName } from '../utils/calculations';
import { encodeGroupToQR } from '../utils/qr';
import { Colors } from '../constants/colors';
import AdBanner from '../components/AdBanner';

type GroupDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

interface Props {
  navigation: GroupDetailScreenNavigationProp;
  route: GroupDetailScreenRouteProp;
}

const GroupDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'expenses'>('members');
  const [loading, setLoading] = useState(true);

  const loadGroup = useCallback(async () => {
    try {
      const groups = await loadGroups();
      const foundGroup = groups.find(g => g.id === groupId);
      setGroup(foundGroup || null);
    } catch (error) {
      Alert.alert('エラー', 'グループの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadGroup();
    }, [loadGroup])
  );

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AddExpense', { groupId });
  };

  const handleSettlement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Settlement', { groupId });
  };

  const handleShareGroup = async () => {
    if (!group) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const qrData = encodeGroupToQR(group);
      await Clipboard.setStringAsync(qrData);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '📋 コピー完了',
        'グループデータをクリップボードにコピーしました！\n\n他のメンバーはこのデータを「グループに参加」画面で貼り付けることができます。'
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('エラー', 'コピーに失敗しました');
    }
  };

  const renderMemberItem = ({ item: balance }: { item: Balance }) => {
    const isPositive = balance.balance > 0;
    const isNegative = balance.balance < 0;
    
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>
            {balance.memberName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{balance.memberName}</Text>
          <Text style={[
            styles.balanceText,
            isPositive && styles.positiveBalance,
            isNegative && styles.negativeBalance,
          ]}>
            {Math.abs(balance.balance) < 1 ? 
              '精算済み' : 
              `${isPositive ? '+' : ''}${formatYen(balance.balance)}`
            }
          </Text>
        </View>
      </View>
    );
  };

  const renderExpenseItem = ({ item: expense }: { item: Expense }) => {
    const payer = group?.members.find(m => m.id === expense.paidBy);
    const splitCount = expense.splitBetween.length;
    
    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseDescription}>{expense.description}</Text>
          <Text style={styles.expenseAmount}>{formatYen(expense.amount)}</Text>
        </View>
        <View style={styles.expenseFooter}>
          <Text style={styles.expensePayer}>
            {payer?.name || 'Unknown'}が支払い
          </Text>
          <Text style={styles.expenseDate}>
            {expense.date.toLocaleDateString('ja-JP')} • {splitCount}人で分割
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
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

  const balances = calculateBalances(group);
  const totalSpending = getTotalSpending(group);
  const hasExpenses = group.expenses.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.totalSpending}>
          合計支出 {formatYen(totalSpending)}
        </Text>
        
        <View style={styles.headerButtons}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareGroup}
              activeOpacity={0.8}
            >
              <Text style={styles.shareButtonText}>📱 共有</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addExpenseButton}
              onPress={handleAddExpense}
              activeOpacity={0.8}
            >
              <Text style={styles.addExpenseButtonText}>+ 支出追加</Text>
            </TouchableOpacity>
          </View>
          
          {hasExpenses && (
            <TouchableOpacity
              style={styles.settlementButton}
              onPress={handleSettlement}
              activeOpacity={0.8}
            >
              <Text style={styles.settlementButtonText}>💰 精算する</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'members' && styles.activeTab,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('members');
          }}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'members' && styles.activeTabText,
          ]}>
            メンバー
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'expenses' && styles.activeTab,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('expenses');
          }}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'expenses' && styles.activeTabText,
          ]}>
            支出
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'members' ? (
          <FlatList
            data={balances}
            keyExtractor={(item) => item.memberId}
            renderItem={renderMemberItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>メンバーがいません</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={group.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            keyExtractor={(item) => item.id}
            renderItem={renderExpenseItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>支出がありません</Text>
                <Text style={styles.emptyStateSubtext}>
                  上の「+ 支出追加」ボタンから支出を追加してみましょう
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* AdMob Banner */}
      <AdBanner />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  totalSpending: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  settlementButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  settlementButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  positiveBalance: {
    color: '#34C759',
    fontWeight: '600',
  },
  negativeBalance: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expensePayer: {
    fontSize: 14,
    color: '#666',
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  headerButtons: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addExpenseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addExpenseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupDetailScreen; 