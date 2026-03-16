export type TransactionType = 'credit' | 'debit';

export interface Bank {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  bankId: string;
  accountName: string;
  accountNumber: string;
  lastFourDigits: string;
  accountType: string;
  openingBalance: number;
  currentBalance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Health & Fitness',
  'Salary',
  'Investment',
  'Transfer',
  'Other'
];
