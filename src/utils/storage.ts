import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group } from '../types';

const STORAGE_KEY = 'warikan_groups';

export const loadGroups = async (): Promise<Group[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const groups = JSON.parse(data);
    // Convert date strings back to Date objects
    return groups.map((group: any) => ({
      ...group,
      createdAt: new Date(group.createdAt),
      expenses: group.expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
      })),
    }));
  } catch (error) {
    // Return empty array on error
    return [];
  }
};

export const saveGroups = async (groups: Group[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    // Re-throw error for handling upstream
    throw error;
  }
};

export const addGroup = async (group: Group): Promise<void> => {
  const groups = await loadGroups();
  groups.push(group);
  await saveGroups(groups);
};

export const updateGroup = async (updatedGroup: Group): Promise<void> => {
  const groups = await loadGroups();
  const index = groups.findIndex(g => g.id === updatedGroup.id);
  if (index !== -1) {
    groups[index] = updatedGroup;
    await saveGroups(groups);
  }
};

export const mergeGroup = async (newGroup: Group): Promise<void> => {
  const groups = await loadGroups();
  const existingIndex = groups.findIndex(g => g.id === newGroup.id);
  
  if (existingIndex !== -1) {
    // Merge groups by combining expenses and members
    const existing = groups[existingIndex];
    const mergedMembers = [...existing.members];
    const mergedExpenses = [...existing.expenses];
    
    // Add new members if they don't exist
    newGroup.members.forEach(newMember => {
      if (!mergedMembers.find(m => m.id === newMember.id)) {
        mergedMembers.push(newMember);
      }
    });
    
    // Add new expenses if they don't exist (check by ID and timestamp)
    newGroup.expenses.forEach(newExpense => {
      if (!mergedExpenses.find(e => e.id === newExpense.id)) {
        mergedExpenses.push(newExpense);
      }
    });
    
    groups[existingIndex] = {
      ...existing,
      members: mergedMembers,
      expenses: mergedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  } else {
    groups.push(newGroup);
  }
  
  await saveGroups(groups);
}; 