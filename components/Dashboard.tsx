'use client';

import React, { useMemo } from 'react';
import { useFinance } from '@/lib/FinanceContext';
import { Wallet, CreditCard, Landmark, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { accounts, transactions } = useFinance();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  
  const incomeThisMonth = transactions
    .filter(t => t.type === 'credit' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseThisMonth = transactions
    .filter(t => t.type === 'debit' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'debit')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 dark:bg-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Total Balance</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-emerald-100 text-sm opacity-80">Across {accounts.length} accounts</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Monthly Income</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ${incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">This month</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Monthly Expense</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ${expenseThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">This month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Accounts</h2>
            <Landmark className="text-gray-400 dark:text-zinc-500" size={20} />
          </div>
          <div className="space-y-4">
            {accounts.length > 0 ? (
              accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm shrink-0">
                      <CreditCard className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">{acc.accountName}</h4>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-400">****{acc.lastFourDigits}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                      ${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                No accounts added yet.
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm transition-all">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Expenses by Category</h2>
          <div className="h-[250px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'var(--tooltip-bg, #fff)',
                      color: 'var(--tooltip-text, #000)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-zinc-400">
                No expense data to display.
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-gray-600 dark:text-zinc-400 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
