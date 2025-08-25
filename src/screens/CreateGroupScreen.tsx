import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import QRCode from 'react-native-qrcode-svg';

import { RootStackParamList, Group, Member } from '../types';
import { addGroup } from '../utils/storage';
import { encodeGroupToQR } from '../utils/qr';
import { Colors } from '../constants/colors';

type CreateGroupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateGroup'>;

interface Props {
  navigation: CreateGroupScreenNavigationProp;
}

const CreateGroupScreen: React.FC<Props> = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);

  const addMember = () => {
    if (memberName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newMember: Member = {
        id: Crypto.randomUUID(),
        name: memberName.trim(),
      };
      setMembers([...members, newMember]);
      setMemberName('');
    }
  };

  const removeMember = (memberId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMembers(members.filter(member => member.id !== memberId));
  };

  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('エラー', 'グループ名を入力してください');
      return;
    }

    if (members.length === 0) {
      Alert.alert('エラー', '少なくとも1人のメンバーを追加してください');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const newGroup: Group = {
        id: Crypto.randomUUID(),
        name: groupName.trim(),
        members,
        expenses: [],
        createdAt: new Date(),
      };

      await addGroup(newGroup);
      
      // Generate QR code
      const qrString = encodeGroupToQR(newGroup);
      setQrData(qrString);
      setShowQR(true);
    } catch (error) {
      Alert.alert('エラー', 'グループの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Home');
  };

  const renderMemberItem = ({ item: member }: { item: Member }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberInitial}>{getInitials(member.name)}</Text>
      </View>
      <Text style={styles.memberName}>{member.name}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeMember(member.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (showQR) {
    return (
      <View style={styles.qrContainer}>
        <Text style={styles.qrTitle}>グループが作成されました！</Text>
        <Text style={styles.qrSubtitle}>
          このQRコードを他のメンバーにスキャンしてもらって、グループに参加してもらいましょう
        </Text>
        
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={qrData}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>
        
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>完了</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>グループ名</Text>
          <TextInput
            style={styles.textInput}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="飲み会、旅行など"
            placeholderTextColor="#999"
            returnKeyType="done"
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>メンバー</Text>
          <View style={styles.addMemberContainer}>
            <TextInput
              style={styles.memberInput}
              value={memberName}
              onChangeText={setMemberName}
              placeholder="メンバー名を入力"
              placeholderTextColor="#999"
              returnKeyType="done"
              onSubmitEditing={addMember}
              maxLength={20}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addMember}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={renderMemberItem}
            style={styles.memberList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (loading || !groupName.trim() || members.length === 0) && styles.disabledButton
          ]}
          onPress={createGroup}
          disabled={loading || !groupName.trim() || members.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>
            {loading ? '作成中...' : 'グループを作成'}
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
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addMemberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 12,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  memberList: {
    maxHeight: 200,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 34,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  qrContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  qrCodeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateGroupScreen; 