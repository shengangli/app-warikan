export interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: Date;
}

export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  paidBy: string;
  amount: number;
  description: string;
  splitBetween: string[];
  date: Date;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Balance {
  memberId: string;
  memberName: string;
  balance: number; // positive = owed money, negative = owes money
}

export type RootStackParamList = {
  Home: undefined;
  CreateGroup: undefined;
  JoinGroup: undefined;
  GroupDetail: { groupId: string };
  AddExpense: { groupId: string };
  Settlement: { groupId: string };
};

export type GroupDetailTabParamList = {
  Members: { groupId: string };
  Expenses: { groupId: string };
}; 