import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Transaction, Currency, User } from './types';
import Header from './components/Header';
import TransactionForm from './components/TransactionForm';
import { 
  getTransactionsForUser, 
  addTransactionForUser, 
  updateTransactionForUser, 
  deleteTransactionForUser, 
  getUserPreferences, 
  saveUserPreferences 
} from './services/mockApiService';
import { RefreshIcon } from './components/icons';

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
    if (!user) return;
    try {
      const trans = await getTransactionsForUser(user.uid);
      setTransactions(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error("Failed to fetch transactions", e);
      setError("Could not load your transactions. Please try refreshing.");
    }
  }, [user]);

  // Effect to load all user data on initial mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoadingData(true);
        setError(null);
        
        // Fetch preferences and transactions in parallel
        const [prefs, trans] = await Promise.all([
          getUserPreferences(user.uid),
          getTransactionsForUser(user.uid)
        ]);
        
        setIsDarkMode(prefs.isDarkMode);
        setCurrency(prefs.currency);
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
        saveUserPreferences(user.uid, { isDarkMode, currency });
    }
  }, [isDarkMode, currency, user, isLoadingData]);


  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    await addTransactionForUser(user.uid, transaction);
    await fetchTransactions(); // Refetch to get the new transaction with its ID
    setIsFormModalOpen(false);
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    if (!user) return;
    await updateTransactionForUser(user.uid, transaction);
    await fetchTransactions(); // Refetch
    setEditingTransaction(null);
    setIsFormModalOpen(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteTransactionForUser(user.uid, id);
    await fetchTransactions(); // Refetch
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
    </div>
  );
};

export default App;
