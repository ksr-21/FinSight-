import { Transaction, Budget, Goal, Bill, PortfolioAsset, FinancialHealthScore } from '../types';

const API_BASE = '/api';

const STORAGE_KEY = 'finsight_data';

const getStoredData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {
    transactions: [],
    budgets: [],
    goals: [],
    bills: [
      { id: '1', name: 'Electricity Bill', amount: 1200, dueDate: '2026-04-05', isPaid: false, category: 'Utilities' },
      { id: '2', name: 'Internet', amount: 800, dueDate: '2026-04-10', isPaid: true, category: 'Utilities' },
    ],
    portfolio: [
      { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 10, averagePrice: 2400, currentPrice: 2850, type: 'stock' },
      { id: '2', symbol: 'BTC', name: 'Bitcoin', quantity: 0.05, averagePrice: 45000, currentPrice: 65000, type: 'crypto' },
    ]
  };
};

const setStoredData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const api = {
  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const data = getStoredData();
    return data.transactions;
  },
  addTransaction: async (t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const data = getStoredData();
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) } as Transaction;
    data.transactions.unshift(newTransaction);
    setStoredData(data);
    return newTransaction;
  },
  updateTransaction: async (id: string, t: Partial<Transaction>): Promise<Transaction> => {
    const data = getStoredData();
    const index = data.transactions.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data.transactions[index] = { ...data.transactions[index], ...t };
      setStoredData(data);
      return data.transactions[index];
    }
    throw new Error('Transaction not found');
  },
  deleteTransaction: async (id: string): Promise<void> => {
    const data = getStoredData();
    data.transactions = data.transactions.filter((item: any) => item.id !== id);
    setStoredData(data);
  },

  // AI Features
  getForecast: async (history: Transaction[]): Promise<any> => {
    const res = await fetch(`${API_BASE}/ai/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
    });
    return res.json();
  },
  getHealthScore: async (): Promise<FinancialHealthScore> => {
    const res = await fetch(`${API_BASE}/ai/health-score`);
    return res.json();
  },

  // Budgets
  getBudgets: async (): Promise<Budget[]> => {
    const data = getStoredData();
    return data.budgets;
  },
  addBudget: async (b: Omit<Budget, 'id'>): Promise<Budget> => {
    const data = getStoredData();
    const newBudget = { ...b, id: Math.random().toString(36).substr(2, 9) } as Budget;
    data.budgets.push(newBudget);
    setStoredData(data);
    return newBudget;
  },
  updateBudget: async (id: string, b: Partial<Budget>): Promise<Budget> => {
    const data = getStoredData();
    const index = data.budgets.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data.budgets[index] = { ...data.budgets[index], ...b };
      setStoredData(data);
      return data.budgets[index];
    }
    throw new Error('Budget not found');
  },
  deleteBudget: async (id: string): Promise<void> => {
    const data = getStoredData();
    data.budgets = data.budgets.filter((item: any) => item.id !== id);
    setStoredData(data);
  },

  // Goals
  getGoals: async (): Promise<Goal[]> => {
    const data = getStoredData();
    return data.goals;
  },
  addGoal: async (g: Omit<Goal, 'id'>): Promise<Goal> => {
    const data = getStoredData();
    const newGoal = { ...g, id: Math.random().toString(36).substr(2, 9) } as Goal;
    data.goals.push(newGoal);
    setStoredData(data);
    return newGoal;
  },
  updateGoal: async (id: string, g: Partial<Goal>): Promise<Goal> => {
    const data = getStoredData();
    const index = data.goals.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      data.goals[index] = { ...data.goals[index], ...g };
      setStoredData(data);
      return data.goals[index];
    }
    throw new Error('Goal not found');
  },
  deleteGoal: async (id: string): Promise<void> => {
    const data = getStoredData();
    data.goals = data.goals.filter((item: any) => item.id !== id);
    setStoredData(data);
  },

  // Bills
  getBills: async (): Promise<Bill[]> => {
    const data = getStoredData();
    return data.bills;
  },

  // Portfolio
  getPortfolio: async (): Promise<PortfolioAsset[]> => {
    const data = getStoredData();
    return data.portfolio;
  }
};
