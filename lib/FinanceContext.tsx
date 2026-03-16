'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bank, Account, Transaction } from './types';

interface FinanceContextType {
  banks: Bank[];
  accounts: Account[];
  transactions: Transaction[];
  addBank: (name: string, id?: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'currentBalance'>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/finance');
        const data = await response.json();
        if (data.banks) setBanks(data.banks);
        if (data.accounts) setAccounts(data.accounts);
        if (data.transactions) setTransactions(data.transactions);
      } catch (error) {
        console.error('Failed to fetch finance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addBank = async (name: string, id?: string) => {
    const newBank: Bank = { id: id || crypto.randomUUID(), name };
    try {
      await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBank),
      });
      setBanks(prev => [...prev, newBank]);
    } catch (error) {
      console.error('Failed to add bank:', error);
    }
  };

  const addAccount = async (accountData: Omit<Account, 'id' | 'currentBalance'>) => {
    const newAccount: Account = {
      ...accountData,
      id: crypto.randomUUID(),
      currentBalance: accountData.openingBalance,
    };
    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      });
      setAccounts(prev => [...prev, newAccount]);
    } catch (error) {
      console.error('Failed to add account:', error);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };

    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });
      
      setTransactions(prev => [newTransaction, ...prev]);

      // Update account balance locally
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => {
          if (acc.id === transactionData.accountId) {
            const amount = transactionData.type === 'credit' ? transactionData.amount : -transactionData.amount;
            return { ...acc, currentBalance: acc.currentBalance + amount };
          }
          return acc;
        })
      );
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const updateTransaction = async (id: string, transactionData: Omit<Transaction, 'id'>) => {
    const oldTransaction = transactions.find(t => t.id === id);
    if (!oldTransaction) return;

    try {
      await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      setTransactions(prev => prev.map(t => t.id === id ? { ...transactionData, id } : t));

      // Update account balances locally
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => {
          let balance = acc.currentBalance;
          
          if (acc.id === oldTransaction.accountId) {
            const oldAmount = oldTransaction.type === 'credit' ? -oldTransaction.amount : oldTransaction.amount;
            balance += oldAmount;
          }
          
          if (acc.id === transactionData.accountId) {
            const newAmount = transactionData.type === 'credit' ? transactionData.amount : -transactionData.amount;
            balance += newAmount;
          }
          
          return { ...acc, currentBalance: balance };
        })
      );
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    try {
      await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      setTransactions(transactions.filter(t => t.id !== id));

      // Revert account balance locally
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => {
          if (acc.id === transactionToDelete.accountId) {
            const amount = transactionToDelete.type === 'credit' ? -transactionToDelete.amount : transactionToDelete.amount;
            return { ...acc, currentBalance: acc.currentBalance + amount };
          }
          return acc;
        })
      );
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  return (
    <FinanceContext.Provider value={{ 
      banks, 
      accounts, 
      transactions, 
      addBank, 
      addAccount, 
      addTransaction,
      updateTransaction,
      deleteTransaction,
      isLoading 
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
