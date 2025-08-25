import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { RootStackParamList, Group } from '../types';
import { loadGroups } from '../utils/storage';
import { formatYen, getTotalSpending } from '../utils/calculations';
import { Colors } from '../constants/colors';
import AdBanner from '../components/AdBanner';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadGroupsData = useCallback(async () => {
    try {
      const loadedGroups = await loadGroups();
      setGroups(loadedGroups);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert('エラー', 'グループの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroupsData();
    }, [loadGroupsData])
  );

  const handleCreateGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CreateGroup');
  };

  const handleJoinGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('JoinGroup');
  };

  const handleGroupPress = (groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('GroupDetail', { groupId });
  };

  const renderGroupItem = ({ item: group, index }: { item: Group; index: number }) => {
    const totalSpending = getTotalSpending(group);
    const memberCount = group.members.length;
    const hasExpenses = group.expenses.length > 0;

    const animatedValue = new Animated.Value(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View 
        style={[
          styles.groupCard,
          {
            opacity: animatedValue,
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleGroupPress(group.id)}
          activeOpacity={0.7}
          style={styles.groupCardContent}
        >
          <View style={styles.groupHeader}>
            <View style={styles.groupIconContainer}>
              <Text style={styles.groupIcon}>👥</Text>
            </View>
            <View style={styles.groupTitleContainer}>
              <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
              <View style={styles.groupMetadata}>
                <View style={styles.memberCountBadge}>
                  <Text style={styles.memberCountIcon}>👤</Text>
                  <Text style={styles.memberCountText}>{memberCount}</Text>
                </View>
                <Text style={styles.groupDate}>
                  {group.createdAt.toLocaleDateString('ja-JP', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.groupFooter}>
            {hasExpenses ? (
              <View style={styles.spendingContainer}>
                <Text style={styles.spendingLabel}>合計支出</Text>
                <Text style={styles.totalSpending}>{formatYen(totalSpending)}</Text>
              </View>
            ) : (
              <View style={styles.noExpensesContainer}>
                <Text style={styles.noExpensesText}>まだ支出がありません</Text>
                <Text style={styles.noExpensesSubtext}>+ ボタンで追加</Text>
              </View>
            )}
            
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <Text style={styles.emptyStateIcon}>📊</Text>
      <Text style={styles.emptyStateTitle}>グループを作成しましょう</Text>
      <Text style={styles.emptyStateSubtitle}>
        友達と支出を管理して{'\n'}自動で精算計算ができます
      </Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingIcon}>📊</Text>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>おかえりなさい</Text>
          <Text style={styles.headerTitle}>割り勘グループ</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCreateGroup}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>✨</Text>
            <Text style={styles.primaryButtonText}>新しいグループ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleJoinGroup}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.secondaryButtonText}>グループに参加</Text>
          </TouchableOpacity>
        </View>

        {/* Groups List */}
        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>
            {groups.length > 0 ? `アクティブなグループ (${groups.length})` : 'グループ'}
          </Text>
          
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={groups.length === 0 ? styles.emptyListContainer : undefined}
          />
        </View>
      </Animated.View>
      
      {/* AdMob Banner */}
      <AdBanner />
    </View>
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
  loadingCard: {
    backgroundColor: Colors.cardBackground,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  groupsSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  groupCard: {
    marginBottom: 16,
  },
  groupCardContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight + '20', // Light version with opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupIcon: {
    fontSize: 20,
  },
  groupTitleContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  groupMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  memberCountIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  memberCountText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  groupDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spendingContainer: {
    flex: 1,
  },
  spendingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  totalSpending: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  noExpensesContainer: {
    flex: 1,
  },
  noExpensesText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: 2,
  },
  noExpensesSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen; 