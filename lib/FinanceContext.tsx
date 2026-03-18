'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useAuth } from './AuthContext';

export interface Bank {
  id: string;
  userId: string;
  name: string;
}

export interface Account {
  id: string;
  userId: string;
  bankId: string;
  accountName: string;
  accountNumber: string;
  lastFourDigits: string;
  accountType: 'savings' | 'checking' | 'credit' | 'investment';
  openingBalance: number;
  currentBalance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface FinanceContextType {
  banks: Bank[];
  accounts: Account[];
  transactions: Transaction[];
  isLoading: boolean;
  addBank: (name: string, id?: string) => Promise<string | void>;
  addAccount: (account: Omit<Account, 'id' | 'userId'>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Validate connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const resetState = () => {
      setBanks([]);
      setAccounts([]);
      setTransactions([]);
      setIsLoading(false);
    };

    if (!user) {
      resetState();
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    // Listen for banks
    const banksQuery = query(collection(db, 'banks'), where('userId', '==', user.id));
    const unsubscribeBanks = onSnapshot(banksQuery, (snapshot) => {
      const banksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bank));
      setBanks(banksData);
    }, (error) => {
      console.error('Firestore Error (banks): ', error);
    });

    // Listen for accounts
    const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', user.id));
    const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
      setAccounts(accountsData);
    }, (error) => {
      console.error('Firestore Error (accounts): ', error);
    });

    // Listen for transactions
    const transactionsQuery = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.id),
      orderBy('date', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(transactionsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Firestore Error (transactions): ', error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeBanks();
      unsubscribeAccounts();
      unsubscribeTransactions();
    };
  }, [user]);

  const addBank = async (name: string, customId?: string) => {
    if (!user) return;
    const id = customId || crypto.randomUUID();
    await setDoc(doc(db, 'banks', id), {
      id,
      userId: user.id,
      name
    });
    return id;
  };

  const addAccount = async (account: Omit<Account, 'id' | 'userId'>) => {
    if (!user) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'accounts', id), {
      ...account,
      id,
      userId: user.id
    });
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    const id = crypto.randomUUID();
    
    // Update account balance
    const accountRef = doc(db, 'accounts', transaction.accountId);
    const accountDoc = await getDocFromServer(accountRef);
    if (accountDoc.exists()) {
      const currentBalance = accountDoc.data().currentBalance;
      const amountChange = transaction.type === 'credit' ? transaction.amount : -transaction.amount;
      await updateDoc(accountRef, {
        currentBalance: currentBalance + amountChange
      });
    }

    await setDoc(doc(db, 'transactions', id), {
      ...transaction,
      id,
      userId: user.id
    });
  };

  const updateTransaction = async (id: string, newData: Partial<Transaction>) => {
    if (!user) return;
    
    const transactionRef = doc(db, 'transactions', id);
    const transactionDoc = await getDocFromServer(transactionRef);
    if (!transactionDoc.exists()) return;
    
    const oldTransaction = transactionDoc.data() as Transaction;
    
    // Revert old balance
    const oldAccountRef = doc(db, 'accounts', oldTransaction.accountId);
    const oldAccountDoc = await getDocFromServer(oldAccountRef);
    if (oldAccountDoc.exists()) {
      const oldBalance = oldAccountDoc.data().currentBalance;
      const oldAmountChange = oldTransaction.type === 'credit' ? -oldTransaction.amount : oldTransaction.amount;
      await updateDoc(oldAccountRef, {
        currentBalance: oldBalance + oldAmountChange
      });
    }

    // Apply new balance
    const updatedTransaction = { ...oldTransaction, ...newData };
    const newAccountRef = doc(db, 'accounts', updatedTransaction.accountId);
    const newAccountDoc = await getDocFromServer(newAccountRef);
    if (newAccountDoc.exists()) {
      const newBalance = newAccountDoc.data().currentBalance;
      const newAmountChange = updatedTransaction.type === 'credit' ? updatedTransaction.amount : -updatedTransaction.amount;
      await updateDoc(newAccountRef, {
        currentBalance: newBalance + newAmountChange
      });
    }

    await updateDoc(transactionRef, newData);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    
    const transactionRef = doc(db, 'transactions', id);
    const transactionDoc = await getDocFromServer(transactionRef);
    if (!transactionDoc.exists()) return;
    
    const transaction = transactionDoc.data() as Transaction;
    
    // Revert balance
    const accountRef = doc(db, 'accounts', transaction.accountId);
    const accountDoc = await getDocFromServer(accountRef);
    if (accountDoc.exists()) {
      const currentBalance = accountDoc.data().currentBalance;
      const amountChange = transaction.type === 'credit' ? -transaction.amount : transaction.amount;
      await updateDoc(accountRef, {
        currentBalance: currentBalance + amountChange
      });
    }

    await deleteDoc(transactionRef);
  };

  return (
    <FinanceContext.Provider value={{ 
      banks, 
      accounts, 
      transactions, 
      isLoading, 
      addBank, 
      addAccount, 
      addTransaction,
      updateTransaction,
      deleteTransaction
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
