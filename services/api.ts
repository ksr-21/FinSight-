import { Transaction, Budget, Goal, Bill, PortfolioAsset, FinancialHealthScore } from '../types';

const API_BASE = '/api';

const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  GOALS: 'goals',
  BILLS: 'bills',
  PORTFOLIO: 'portfolio',
};

// Helper for user-scoped keys
const getScopedKey = (userId: string, key: string) => `finsight_${userId}_${key}`;

const getLocal = <T>(userId: string, key: string): T[] => {
  try {
    const fullKey = getScopedKey(userId, key);
    const data = localStorage.getItem(fullKey);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocal = (userId: string, key: string, data: any) => {
  try {
    const fullKey = getScopedKey(userId, key);
    localStorage.setItem(fullKey, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

export const api = {
  // Transactions
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      if (res.ok) {
        const serverData = await res.json();
        const serverTransactions = Array.isArray(serverData) ? serverData : [];

        // Merge strategy: Keep local 'pending' items that haven't been synced yet
        const localTransactions = getLocal<Transaction & { _syncStatus?: 'pending' }>(userId, STORAGE_KEYS.TRANSACTIONS);
        const pendingItems = localTransactions.filter(t => t._syncStatus === 'pending');

        // Filter out any server items that might be duplicates of pending items (by description/amount/date as fallback)
        // For now, just prepend pending items to the server list
        const merged = [...pendingItems, ...serverTransactions];

        setLocal(userId, STORAGE_KEYS.TRANSACTIONS, merged);
        return merged;
      }
    } catch (e) {
      console.error("Failed to fetch transactions", e);
    }
    return getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
  },

  addTransaction: async (userId: string, t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const localId = `local_${Math.random().toString(36).substr(2, 9)}`;
    const newTransaction = { ...t, id: localId, _syncStatus: 'pending' } as Transaction & { _syncStatus: string };

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
        // Replace local pending with server version
        setLocal(userId, STORAGE_KEYS.TRANSACTIONS, [...current.filter(item => item.id !== localId), saved]);
        return saved;
      }
    } catch (e) {
      console.error("Failed to add transaction to server, saving locally", e);
    }

    const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
    setLocal(userId, STORAGE_KEYS.TRANSACTIONS, [...current, newTransaction]);
    return newTransaction;
  },

  updateTransaction: async (userId: string, id: string, t: Partial<Transaction>): Promise<Transaction> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
        setLocal(userId, STORAGE_KEYS.TRANSACTIONS, current.map(item => item.id === id ? updated : item));
        return updated;
      }
    } catch (e) {
      console.error("Failed to update transaction on server, updating locally", e);
    }

    const current = getLocal<Transaction & { _syncStatus?: string }>(userId, STORAGE_KEYS.TRANSACTIONS);
    const updatedLocal = current.map(item => {
      if (item.id === id) {
        return { ...item, ...t, _syncStatus: item._syncStatus || 'pending' };
      }
      return item;
    });
    setLocal(userId, STORAGE_KEYS.TRANSACTIONS, updatedLocal);
    return updatedLocal.find(item => item.id === id) as Transaction;
  },

  deleteTransaction: async (userId: string, id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
        setLocal(userId, STORAGE_KEYS.TRANSACTIONS, current.filter(item => item.id !== id));
        return;
      }
    } catch (e) {
      console.error("Failed to delete transaction on server, deleting locally", e);
    }
    const current = getLocal<Transaction>(userId, STORAGE_KEYS.TRANSACTIONS);
    setLocal(userId, STORAGE_KEYS.TRANSACTIONS, current.filter(item => item.id !== id));
  },

  // AI Features
  getForecast: async (history: Transaction[]): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/ai/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
      });
      if (res.ok) return res.json();
    } catch (e) {
      console.error("AI Forecast failed", e);
    }
    return { forecast: [] };
  },

  getHealthScore: async (): Promise<FinancialHealthScore> => {
    try {
      const res = await fetch(`${API_BASE}/ai/health-score`);
      if (res.ok) return res.json();
    } catch (e) {
      console.error("AI Health Score failed", e);
    }
    return {
      score: 0,
      breakdown: { savings: 0, spending: 0, investments: 0, debt: 0 },
      suggestions: ["Backend unreachable. Connect to see your health score."]
    };
  },

  // Budgets
  getBudgets: async (userId: string): Promise<Budget[]> => {
    try {
      const res = await fetch(`${API_BASE}/budgets`);
      if (res.ok) {
        const data = await res.json();
        const serverBudgets = Array.isArray(data) ? data : [];
        const localBudgets = getLocal<Budget & { _syncStatus?: string }>(userId, STORAGE_KEYS.BUDGETS);
        const pending = localBudgets.filter(b => b._syncStatus === 'pending');
        const merged = [...pending, ...serverBudgets];
        setLocal(userId, STORAGE_KEYS.BUDGETS, merged);
        return merged;
      }
    } catch (e) {
      console.error("Failed to fetch budgets", e);
    }
    return getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
  },

  addBudget: async (userId: string, b: Omit<Budget, 'id'>): Promise<Budget> => {
    const localId = `local_${Math.random().toString(36).substr(2, 9)}`;
    const newBudget = { ...b, id: localId, _syncStatus: 'pending' } as Budget & { _syncStatus: string };
    try {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
        setLocal(userId, STORAGE_KEYS.BUDGETS, [...current.filter(item => item.id !== localId), saved]);
        return saved;
      }
    } catch (e) {
      console.error("Failed to add budget to server", e);
    }
    const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
    setLocal(userId, STORAGE_KEYS.BUDGETS, [...current, newBudget]);
    return newBudget;
  },

  updateBudget: async (userId: string, id: string, b: Partial<Budget>): Promise<Budget> => {
    try {
      const res = await fetch(`${API_BASE}/budgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
        setLocal(userId, STORAGE_KEYS.BUDGETS, current.map(item => item.id === id ? updated : item));
        return updated;
      }
    } catch (e) {
      console.error("Failed to update budget on server", e);
    }
    const current = getLocal<Budget & { _syncStatus?: string }>(userId, STORAGE_KEYS.BUDGETS);
    const updatedLocal = current.map(item => item.id === id ? { ...item, ...b, _syncStatus: item._syncStatus || 'pending' } : item);
    setLocal(userId, STORAGE_KEYS.BUDGETS, updatedLocal);
    return updatedLocal.find(item => item.id === id) as Budget;
  },

  deleteBudget: async (userId: string, id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/budgets/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
        setLocal(userId, STORAGE_KEYS.BUDGETS, current.filter(item => item.id !== id));
        return;
      }
    } catch (e) {
      console.error("Failed to delete budget on server", e);
    }
    const current = getLocal<Budget>(userId, STORAGE_KEYS.BUDGETS);
    setLocal(userId, STORAGE_KEYS.BUDGETS, current.filter(item => item.id !== id));
  },

  // Goals
  getGoals: async (userId: string): Promise<Goal[]> => {
    try {
      const res = await fetch(`${API_BASE}/goals`);
      if (res.ok) {
        const data = await res.json();
        const serverGoals = Array.isArray(data) ? data : [];
        const localGoals = getLocal<Goal & { _syncStatus?: string }>(userId, STORAGE_KEYS.GOALS);
        const pending = localGoals.filter(g => g._syncStatus === 'pending');
        const merged = [...pending, ...serverGoals];
        setLocal(userId, STORAGE_KEYS.GOALS, merged);
        return merged;
      }
    } catch (e) {
      console.error("Failed to fetch goals", e);
    }
    return getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
  },

  addGoal: async (userId: string, g: Omit<Goal, 'id'>): Promise<Goal> => {
    const localId = `local_${Math.random().toString(36).substr(2, 9)}`;
    const newGoal = { ...g, id: localId, _syncStatus: 'pending' } as Goal & { _syncStatus: string };
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(g),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
        setLocal(userId, STORAGE_KEYS.GOALS, [...current.filter(item => item.id !== localId), saved]);
        return saved;
      }
    } catch (e) {
      console.error("Failed to add goal to server", e);
    }
    const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
    setLocal(userId, STORAGE_KEYS.GOALS, [...current, newGoal]);
    return newGoal;
  },

  updateGoal: async (userId: string, id: string, g: Partial<Goal>): Promise<Goal> => {
    try {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(g),
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
        setLocal(userId, STORAGE_KEYS.GOALS, current.map(item => item.id === id ? updated : item));
        return updated;
      }
    } catch (e) {
      console.error("Failed to update goal on server", e);
    }
    const current = getLocal<Goal & { _syncStatus?: string }>(userId, STORAGE_KEYS.GOALS);
    const updatedLocal = current.map(item => item.id === id ? { ...item, ...g, _syncStatus: item._syncStatus || 'pending' } : item);
    setLocal(userId, STORAGE_KEYS.GOALS, updatedLocal);
    return updatedLocal.find(item => item.id === id) as Goal;
  },

  deleteGoal: async (userId: string, id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
        setLocal(userId, STORAGE_KEYS.GOALS, current.filter(item => item.id !== id));
        return;
      }
    } catch (e) {
      console.error("Failed to delete goal on server", e);
    }
    const current = getLocal<Goal>(userId, STORAGE_KEYS.GOALS);
    setLocal(userId, STORAGE_KEYS.GOALS, current.filter(item => item.id !== id));
  },

  // Bills
  getBills: async (userId: string): Promise<Bill[]> => {
    try {
      const res = await fetch(`${API_BASE}/bills`);
      if (res.ok) {
        const data = await res.json();
        const bills = Array.isArray(data) ? data : [];
        setLocal(userId, STORAGE_KEYS.BILLS, bills);
        return bills;
      }
    } catch (e) {
      console.error("Failed to fetch bills", e);
    }
    return getLocal<Bill>(userId, STORAGE_KEYS.BILLS);
  },

  // Portfolio
  getPortfolio: async (userId: string): Promise<PortfolioAsset[]> => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`);
      if (res.ok) {
        const data = await res.json();
        const portfolio = Array.isArray(data) ? data : [];
        setLocal(userId, STORAGE_KEYS.PORTFOLIO, portfolio);
        return portfolio;
      }
    } catch (e) {
      console.error("Failed to fetch portfolio", e);
    }
    return getLocal<PortfolioAsset>(userId, STORAGE_KEYS.PORTFOLIO);
  }
};
