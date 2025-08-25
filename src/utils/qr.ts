import { Group } from '../types';

export const encodeGroupToQR = (group: Group): string => {
  try {
    // Create a simplified version for QR code
    const qrData = {
      id: group.id,
      name: group.name,
      members: group.members,
      expenses: group.expenses,
      createdAt: group.createdAt.toISOString(),
    };
    
    const jsonString = JSON.stringify(qrData);
    // Base64 encode for better QR code compatibility
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    // Error handled by throwing
    throw error;
  }
};

export const decodeGroupFromQR = (qrData: string): Group => {
  try {
    // Base64 decode
    const jsonString = decodeURIComponent(escape(atob(qrData)));
    const parsed = JSON.parse(jsonString);
    
    // Convert back to proper Group format
    return {
      id: parsed.id,
      name: parsed.name,
      members: parsed.members,
      expenses: parsed.expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
      })),
      createdAt: new Date(parsed.createdAt),
    };
  } catch (error) {
    // Error handled by throwing custom error
    throw new Error('無効なQRコードです');
  }
};

export const isValidQRData = (data: string): boolean => {
  try {
    const group = decodeGroupFromQR(data);
    return !!(group.id && group.name && Array.isArray(group.members));
  } catch {
    return false;
  }
}; 