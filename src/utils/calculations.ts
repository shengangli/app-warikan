import { Group, Balance, Settlement, Member, Expense } from '../types';

export const calculateBalances = (group: Group): Balance[] => {
  const balances: { [memberId: string]: Balance } = {};
  
  // Initialize balances for all members
  group.members.forEach(member => {
    balances[member.id] = {
      memberId: member.id,
      memberName: member.name,
      balance: 0,
    };
  });
  
  // Calculate what each person paid and owes
  group.expenses.forEach(expense => {
    const sharePerPerson = expense.amount / expense.splitBetween.length;
    
    // Add amount paid by payer
    if (balances[expense.paidBy]) {
      balances[expense.paidBy].balance += expense.amount;
    }
    
    // Subtract share from each person who should pay
    expense.splitBetween.forEach(memberId => {
      if (balances[memberId]) {
        balances[memberId].balance -= sharePerPerson;
      }
    });
  });
  
  return Object.values(balances);
};

export const calculateOptimalSettlements = (balances: Balance[]): Settlement[] => {
  const settlements: Settlement[] = [];
  
  // Create copies to avoid modifying original data
  const creditors = balances
    .filter(b => b.balance > 0.01) // Those owed money
    .map(b => ({ ...b }))
    .sort((a, b) => b.balance - a.balance); // Largest creditor first
    
  const debtors = balances
    .filter(b => b.balance < -0.01) // Those who owe money
    .map(b => ({ ...b, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance); // Largest debtor first
  
  // Greedy algorithm to minimize transactions
  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];
    
    const transferAmount = Math.min(creditor.balance, debtor.balance);
    
    settlements.push({
      from: debtor.memberId,
      to: creditor.memberId,
      amount: Math.round(transferAmount),
    });
    
    creditor.balance -= transferAmount;
    debtor.balance -= transferAmount;
    
    // Remove settled parties
    if (creditor.balance <= 0.01) {
      creditors.shift();
    }
    if (debtor.balance <= 0.01) {
      debtors.shift();
    }
  }
  
  return settlements;
};

export const formatYen = (amount: number): string => {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
};

export const getTotalSpending = (group: Group): number => {
  return group.expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const getMemberName = (members: Member[], memberId: string): string => {
  const member = members.find(m => m.id === memberId);
  return member ? member.name : 'Unknown';
}; 