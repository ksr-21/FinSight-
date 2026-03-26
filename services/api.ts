import { Transaction, Budget, Goal, Bill, PortfolioAsset, FinancialHealthScore } from '../types';

const API_BASE = '/api';

export const api = {
  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/transactions`);
    return res.json();
  },
  addTransaction: async (t: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    });
    return res.json();
  },
  updateTransaction: async (id: string, t: Partial<Transaction>): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    });
    return res.json();
  },
  deleteTransaction: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
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
    const res = await fetch(`${API_BASE}/budgets`);
    return res.json();
  },
  addBudget: async (b: Omit<Budget, 'id'>): Promise<Budget> => {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    return res.json();
  },
  updateBudget: async (id: string, b: Partial<Budget>): Promise<Budget> => {
    const res = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    return res.json();
  },
  deleteBudget: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/budgets/${id}`, { method: 'DELETE' });
  },

  // Goals
  getGoals: async (): Promise<Goal[]> => {
    const res = await fetch(`${API_BASE}/goals`);
    return res.json();
  },
  addGoal: async (g: Omit<Goal, 'id'>): Promise<Goal> => {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(g),
    });
    return res.json();
  },
  updateGoal: async (id: string, g: Partial<Goal>): Promise<Goal> => {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(g),
    });
    return res.json();
  },
  deleteGoal: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/goals/${id}`, { method: 'DELETE' });
  },

  // Bills
  getBills: async (): Promise<Bill[]> => {
    const res = await fetch(`${API_BASE}/bills`);
    return res.json();
  },

  // Portfolio
  getPortfolio: async (): Promise<PortfolioAsset[]> => {
    const res = await fetch(`${API_BASE}/portfolio`);
    return res.json();
  }
};
