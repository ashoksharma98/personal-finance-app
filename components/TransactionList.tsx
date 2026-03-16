'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/lib/FinanceContext';
import { CATEGORIES } from '@/lib/types';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, X, Calendar, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import TransactionDetailModal from './TransactionDetailModal';
import EditTransactionModal from './EditTransactionModal';
import { Transaction } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

export default function TransactionList() {
  const { transactions, accounts, deleteTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.note?.toLowerCase().includes(search.toLowerCase()) || 
                           t.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesType = typeFilter === 'All' || t.type === typeFilter.toLowerCase();
      
      const transactionDate = new Date(t.date);
      const matchesStartDate = !startDate || transactionDate >= new Date(startDate);
      const matchesEndDate = !endDate || transactionDate <= new Date(endDate);
      
      return matchesSearch && matchesCategory && matchesType && matchesStartDate && matchesEndDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, categoryFilter, typeFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? `${acc.accountName} (****${acc.lastFourDigits})` : 'Unknown Account';
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all">
      <div className="p-4 md:p-6 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-t-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transactions</h2>
            <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-md">
              {filteredTransactions.length} results
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={16} />
              <input 
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white outline-none transition-all"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-3 py-2 rounded-xl">
              <Calendar size={14} className="text-gray-400 dark:text-zinc-500 shrink-0" />
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <input 
                  type="date"
                  className="bg-transparent border-none text-[10px] md:text-xs focus:ring-0 outline-none w-full p-0 text-gray-900 dark:text-white dark:[color-scheme:dark]"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                />
                <span className="text-gray-300 dark:text-zinc-600">-</span>
                <input 
                  type="date"
                  className="bg-transparent border-none text-[10px] md:text-xs focus:ring-0 outline-none w-full p-0 text-gray-900 dark:text-white dark:[color-scheme:dark]"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                />
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <select 
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl text-sm px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white outline-none transition-all appearance-none pr-8"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" size={14} />
            </div>

            {/* Type */}
            <div className="relative">
              <select 
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl text-sm px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-white outline-none transition-all appearance-none pr-8"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All Types</option>
                <option value="Credit">Income</option>
                <option value="Debit">Expense</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Account</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Note</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
              <th className="px-6 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((t) => (
                <tr 
                  key={t.id} 
                  onClick={() => setSelectedTransaction(t)}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-zinc-400">
                    {format(new Date(t.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                    {getAccountName(t.accountId)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-zinc-400 max-w-xs truncate">
                    {t.note || '-'}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${
                    t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <div className="flex items-center justify-end gap-1">
                      {t.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingTransaction(t)}
                        className="text-gray-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {deletingId === t.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-bold"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setDeletingId(null)}
                            className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingId(t.id)}
                          className="text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet List View */}
      <div className="lg:hidden divide-y divide-gray-100 dark:divide-zinc-800">
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((t) => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTransaction(t)}
              className="p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(new Date(t.date), 'MMM dd, yyyy')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                      {getAccountName(t.accountId).split('(')[0]}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold flex items-center justify-end gap-1 ${
                    t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {t.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  {t.note && (
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 max-w-[150px] truncate ml-auto">
                      {t.note}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setEditingTransaction(t)}
                  className="text-gray-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 p-1"
                >
                  <Edit2 size={14} />
                </button>
                {deletingId === t.id ? (
                  <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-medium text-red-600 dark:text-red-400">Delete?</span>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 text-[10px] font-bold underline"
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => setDeletingId(null)}
                      className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 text-[10px] font-medium"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDeletingId(t.id)}
                    className="text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-zinc-400 text-sm">
            No transactions found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between rounded-b-2xl bg-white dark:bg-zinc-900 transition-all">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-zinc-300"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-zinc-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <TransactionDetailModal 
        transaction={selectedTransaction}
        account={selectedTransaction ? accounts.find(a => a.id === selectedTransaction.accountId) || null : null}
        onClose={() => setSelectedTransaction(null)}
        onDelete={handleDelete}
      />

      <EditTransactionModal 
        key={editingTransaction?.id || 'new'}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </div>
  );
}
