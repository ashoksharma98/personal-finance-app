'use client';

import React, { useState } from 'react';
import { Transaction, Account } from '@/lib/types';
import { X, Calendar, Tag, CreditCard, FileText, ArrowUpRight, ArrowDownLeft, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import EditTransactionModal from './EditTransactionModal';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  account: Account | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function TransactionDetailModal({ transaction, account, onClose, onDelete }: TransactionDetailModalProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-zinc-800"
      >
        {/* Header with Amount */}
        <div className={`p-8 text-center relative ${isCredit ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 dark:text-zinc-500 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isCredit ? 'bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400'
          }`}>
            {isCredit ? <ArrowDownLeft size={32} /> : <ArrowUpRight size={32} />}
          </div>
          
          <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
            {isCredit ? 'Income' : 'Expense'} Amount
          </h3>
          <div className={`text-4xl font-bold ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {isCredit ? '+' : '-'}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <DetailItem 
              icon={<Calendar size={18} />} 
              label="Date" 
              value={format(new Date(transaction.date), 'MMMM dd, yyyy')} 
            />
            <DetailItem 
              icon={<Tag size={18} />} 
              label="Category" 
              value={transaction.category} 
            />
            <DetailItem 
              icon={<CreditCard size={18} />} 
              label="Account" 
              value={account ? `${account.accountName} (****${account.lastFourDigits})` : 'Unknown Account'} 
            />
            {transaction.note && (
              <DetailItem 
                icon={<FileText size={18} />} 
                label="Note" 
                value={transaction.note} 
              />
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 size={18} />
              Edit
            </button>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete this transaction?')) {
                  onDelete(transaction.id);
                  onClose();
                }
              }}
              className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              title="Delete Transaction"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      <EditTransactionModal 
        key={transaction.id}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          onClose(); // Close detail modal too after edit
        }}
        transaction={transaction}
      />
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg text-gray-400 dark:text-zinc-500">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
