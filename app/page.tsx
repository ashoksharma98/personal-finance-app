'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/FinanceContext';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import Dashboard from '@/components/Dashboard';
import TransactionList from '@/components/TransactionList';
import AddAccountModal from '@/components/AddAccountModal';
import AddTransactionModal from '@/components/AddTransactionModal';
import { Plus, LayoutDashboard, ListOrdered, Landmark, Wallet, Sun, Moon, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const { isLoading: isFinanceLoading, accounts } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  if (isAuthLoading || isFinanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FinTrack</h1>
            <p className="text-gray-500 dark:text-zinc-400">Hi {user.name || 'there'}! Here&apos;s your financial overview.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm md:hidden"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleTheme}
            className="hidden md:flex items-center justify-center p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            onClick={() => setIsAddAccountOpen(true)}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl text-sm md:text-base font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Landmark size={18} className="shrink-0" />
            <span className="truncate">Add Account</span>
          </button>
          <button 
            onClick={() => setIsAddTransactionOpen(true)}
            disabled={accounts.length === 0}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm md:text-base font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} className="shrink-0" />
            <span className="truncate">New Transaction</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center justify-center p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all shadow-sm"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'dashboard' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'transactions' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
          }`}
        >
          <ListOrdered size={18} />
          <span>Transactions</span>
        </button>
      </div>

      {/* Main Content */}
      <main>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' ? <Dashboard /> : <TransactionList />}
        </motion.div>
      </main>

      {/* Empty State for new users */}
      {accounts.length === 0 && activeTab === 'dashboard' && (
        <div className="mt-12 p-12 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 text-center">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start your journey</h3>
          <p className="text-gray-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
            Add your first bank account to start tracking your finances across all your accounts in one place.
          </p>
          <button 
            onClick={() => setIsAddAccountOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
          >
            <Plus size={20} />
            <span>Add Your First Account</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <AddAccountModal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} />
      <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} />
    </div>
  );
}
