'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/FinanceContext';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AddAccountModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { banks, addBank, addAccount } = useFinance();
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [isAddingNewBank, setIsAddingNewBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let bankId = selectedBankId;
      const effectivelyAddingNewBank = isAddingNewBank || banks.length === 0;
      
      if (effectivelyAddingNewBank && bankName) {
        const newBankId = crypto.randomUUID();
        await addBank(bankName, newBankId);
        bankId = newBankId;
      }

      if (!bankId && banks.length > 0 && !effectivelyAddingNewBank) {
        bankId = banks[0].id;
      }

      if (bankId || (effectivelyAddingNewBank && bankName)) {
        await addAccount({
          bankId: bankId || 'default',
          accountName,
          lastFourDigits: lastFour,
          openingBalance: parseFloat(openingBalance) || 0,
          accountType: 'savings', // Default
          accountNumber: '****' + lastFour, // Placeholder
        });
        
        onClose();
        reset();
      }
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setBankName('');
    setAccountName('');
    setLastFour('');
    setOpeningBalance('');
    setSelectedBankId('');
    setIsAddingNewBank(false);
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Account</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Bank</label>
            {banks.length > 0 && !isAddingNewBank ? (
              <div className="flex gap-2">
                <select 
                  className="flex-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  required
                >
                  <option value="">Select a bank</option>
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setIsAddingNewBank(true)}
                  className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Bank Name (e.g. Chase, HDFC)"
                  className="flex-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
                {banks.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setIsAddingNewBank(false)}
                    className="p-2 text-gray-400 dark:text-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Account Name</label>
            <input 
              type="text"
              placeholder="e.g. Savings, Salary Account"
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Last 4 Digits</label>
              <input 
                type="text"
                placeholder="1234"
                maxLength={4}
                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Opening Balance</label>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white outline-none"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
