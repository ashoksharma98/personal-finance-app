'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/FinanceContext';
import { CATEGORIES } from '@/lib/types';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

export default function AddTransactionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { accounts, addTransaction } = useFinance();
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('debit');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        accountId,
        type,
        amount: parseFloat(amount),
        category,
        date,
        note,
      });

      onClose();
      reset();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setAccountId('');
    setType('debit');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-zinc-800"
      >
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <button
              type="button"
              onClick={() => setType('debit')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === 'debit' ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('credit')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === 'credit' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Account</label>
            <select 
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.accountName} (****{acc.lastFourDigits})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Amount</label>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Date</label>
              <input 
                type="date"
                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none dark:[color-scheme:dark]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Category</label>
            <select 
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Note (Optional)</label>
            <textarea 
              placeholder="What was this for?"
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none h-20 resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded-lg font-medium text-white transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? 'Adding...' : `Add ${type === 'credit' ? 'Income' : 'Expense'}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
