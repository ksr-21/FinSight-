import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Transaction, Currency, User } from './types';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import { api } from './services/api';
import { RefreshIcon, PlusIcon } from './components/icons';
import { motion, AnimatePresence } from 'motion/react';

// Import Pages
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import WealthHorizonPage from './pages/WealthHorizonPage';
import BudgetsGoalsPage from './pages/BudgetsGoalsPage';
import NewsPage from './pages/NewsPage';
import InsightsPage from './pages/InsightsPage';
import AiChatbot from './components/AiChatbot';

interface AppProps {
  user: User;
}

const App: React.FC<AppProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>('USD');
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const balance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  const fetchTransactions = useCallback(async () => {
    try {
      const trans = await api.getTransactions();
      setTransactions(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error("Failed to fetch transactions", e);
      setError("Could not load your transactions. Please try refreshing.");
    }
  }, []);

  // Effect to load all user data on initial mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        
        const trans = await api.getTransactions();
        
        // Load preferences from local storage directly for now
        const prefsJSON = localStorage.getItem(`finsight_preferences_${user.uid}`);
        if (prefsJSON) {
          const prefs = JSON.parse(prefsJSON);
          setIsDarkMode(prefs.isDarkMode);
          setCurrency(prefs.currency);
        }

        setTransactions(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

      } catch (e) {
        console.error("Failed to load user data", e);
        setError("Could not load your data. Please try refreshing the page.");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [user]);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (!isLoadingData && user) {
        localStorage.setItem(`finsight_preferences_${user.uid}`, JSON.stringify({ isDarkMode, currency }));
    }
  }, [isDarkMode, currency, user, isLoadingData]);


  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await api.addTransaction(transaction);
    await fetchTransactions();
    setIsFormModalOpen(false);
  };

  const handleEditTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, transactionData);
      await fetchTransactions();
      setEditingTransaction(null);
      setIsFormModalOpen(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    await fetchTransactions();
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormModalOpen(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <RefreshIcon className="animate-spin h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-text-primary dark:text-white">Loading your data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background dark:bg-gray-900">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h2>
          <p className="text-text-secondary dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 font-sans">
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        currency={currency}
        onCurrencyChange={setCurrency}
        onAddTransaction={openAddModal}
      />

      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<DashboardPage transactions={transactions} currency={currency} />} />
          <Route path="/transactions" element={<TransactionsPage currency={currency} />} />
          <Route path="/budgets" element={<BudgetsGoalsPage currency={currency} transactions={transactions} />} />
          <Route path="/horizon" element={<WealthHorizonPage transactions={transactions} currency={currency} />} />
          <Route path="/insights" element={<InsightsPage transactions={transactions} currency={currency} />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AiChatbot transactions={transactions} currency={currency} balance={balance} />

      {/* Global Transaction Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-text-primary dark:text-white">
                  {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <PlusIcon className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>
              <TransactionForm
                onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                currency={currency}
                initialData={editingTransaction}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
