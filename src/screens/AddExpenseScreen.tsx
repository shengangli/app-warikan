import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';

import { RootStackParamList, Group, Member, Expense } from '../types';
import { loadGroups, updateGroup } from '../utils/storage';

type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;
type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

interface Props {
  navigation: AddExpenseScreenNavigationProp;
  route: AddExpenseScreenRouteProp;
}

const AddExpenseScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPayer, setSelectedPayer] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGroup = useCallback(async () => {
    try {
      const groups = await loadGroups();
      const foundGroup = groups.find(g => g.id === groupId);
      if (foundGroup) {
        setGroup(foundGroup);
        // Default to all members selected for split
        setSelectedMembers(foundGroup.members.map(m => m.id));
        // Default to first member as payer
        if (foundGroup.members.length > 0) {
          setSelectedPayer(foundGroup.members[0].id);
        }
      }
    } catch (error) {
      Alert.alert('エラー', 'グループの読み込みに失敗しました');
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadGroup();
    }, [loadGroup])
  );

  const handleAmountChange = (text: string) => {
    // Remove non-numeric characters except for the first decimal point
    const cleanText = text.replace(/[^\d]/g, '');
    setAmount(cleanText);
  };

  const formatAmount = (value: string): string => {
    if (!value) return '';
    const num = parseInt(value, 10);
    return num.toLocaleString('ja-JP');
  };

  const toggleMemberSelection = (memberId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectPayer = (memberId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPayer(memberId);
  };

  const saveExpense = async () => {
    if (!group) return;

    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('エラー', '有効な金額を入力してください');
      return;
    }

    if (!description.trim()) {
      Alert.alert('エラー', '内容を入力してください');
      return;
    }

    if (!selectedPayer) {
      Alert.alert('エラー', '支払者を選択してください');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('エラー', '少なくとも1人のメンバーを選択してください');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const newExpense: Expense = {
        id: Crypto.randomUUID(),
        paidBy: selectedPayer,
        amount: numAmount,
        description: description.trim(),
        splitBetween: selectedMembers,
        date: new Date(),
      };

      const updatedGroup: Group = {
        ...group,
        expenses: [...group.expenses, newExpense],
      };

      await updateGroup(updatedGroup);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Alert.alert('エラー', '支出の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const isValid = amount && description.trim() && selectedPayer && selectedMembers.length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>金額</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.yenSymbol}>¥</Text>
            <TextInput
              style={styles.amountInput}
              value={formatAmount(amount)}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>内容</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="何に使いましたか？"
            placeholderTextColor="#999"
            returnKeyType="done"
            maxLength={50}
          />
        </View>

        {/* Payer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>支払者</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {group.members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.payerOption,
                  selectedPayer === member.id && styles.selectedPayerOption,
                ]}
                onPress={() => selectPayer(member.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.payerAvatar,
                  selectedPayer === member.id && styles.selectedPayerAvatar,
                ]}>
                  <Text style={[
                    styles.payerInitial,
                    selectedPayer === member.id && styles.selectedPayerInitial,
                  ]}>
                    {getInitials(member.name)}
                  </Text>
                </View>
                <Text style={[
                  styles.payerName,
                  selectedPayer === member.id && styles.selectedPayerName,
                ]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Split Members Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>分割メンバー</Text>
          <View style={styles.memberGrid}>
            {group.members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberOption,
                  selectedMembers.includes(member.id) && styles.selectedMemberOption,
                ]}
                onPress={() => toggleMemberSelection(member.id)}
                activeOpacity={0.7}
              >
                <View style={styles.memberCheckbox}>
                  {selectedMembers.includes(member.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {getInitials(member.name)}
                  </Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isValid || loading) && styles.disabledButton
          ]}
          onPress={saveExpense}
          disabled={!isValid || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {loading ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  yenSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  payerOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
  },
  selectedPayerOption: {
    backgroundColor: '#E3F2FD',
  },
  payerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedPayerAvatar: {
    backgroundColor: '#007AFF',
  },
  payerInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  selectedPayerInitial: {
    color: '#fff',
  },
  payerName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedPayerName: {
    color: '#007AFF',
    fontWeight: '600',
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  memberOption: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  selectedMemberOption: {
    // Additional styling for selected state if needed
  },
  memberCheckbox: {
    position: 'absolute',
    top: -4,
    right: 4,
    zIndex: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  memberInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 34,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddExpenseScreen; 