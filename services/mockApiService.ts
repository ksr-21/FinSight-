import { Transaction, Currency, UserPreferences } from '../types';
import { generateInitialTransactions } from '../constants';

const getTransactionsKey = (userId: string) => `finsight_transactions_${userId}`;
const getPreferencesKey = (userId: string) => `finsight_preferences_${userId}`;

// Preferences
export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
    try {
        const prefsJSON = localStorage.getItem(getPreferencesKey(userId));
        if (prefsJSON) {
            return JSON.parse(prefsJSON);
        }
    } catch (e) {
        console.error("Failed to parse preferences from localStorage", e);
    }
    // Return default if not found or on error
    return { isDarkMode: false, currency: Currency.USD };
};

export const saveUserPreferences = async (userId: string, preferences: UserPreferences): Promise<void> => {
    try {
        localStorage.setItem(getPreferencesKey(userId), JSON.stringify(preferences));
    } catch (e) {
        console.error("Failed to save preferences to localStorage", e);
    }
};

// Transactions
export const getTransactionsForUser = async (userId: string): Promise<Transaction[]> => {
    try {
        const transJSON = localStorage.getItem(getTransactionsKey(userId));
        if (transJSON) {
            return JSON.parse(transJSON);
        }
    } catch (e) {
        console.error("Failed to parse transactions from localStorage", e);
    }
    // If no transactions, use initial ones and save them
    const initialTransactions = generateInitialTransactions();
    try {
        localStorage.setItem(getTransactionsKey(userId), JSON.stringify(initialTransactions));
    } catch (e) {
        console.error("Failed to save initial transactions to localStorage", e);
    }
    return initialTransactions;
};

const saveTransactions = (userId: string, transactions: Transaction[]) => {
    try {
        localStorage.setItem(getTransactionsKey(userId), JSON.stringify(transactions));
    } catch (e) {
        console.error("Failed to save transactions to localStorage", e);
    }
}

export const addTransactionForUser = async (userId: string, transaction: Omit<Transaction, 'id'>): Promise<void> => {
    const transactions = await getTransactionsForUser(userId);
    const newTransaction: Transaction = {
        ...transaction,
        id: new Date().getTime().toString() + Math.random().toString(36).substring(2),
    };
    // Prepend new transaction to show it at the top
    const updatedTransactions = [newTransaction, ...transactions];
    saveTransactions(userId, updatedTransactions);
};

export const updateTransactionForUser = async (userId: string, transaction: Transaction): Promise<void> => {
    if (!transaction.id) {
        throw new Error("Transaction ID is required for updates.");
    }
    let transactions = await getTransactionsForUser(userId);
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index > -1) {
        transactions[index] = transaction;
        saveTransactions(userId, transactions);
    } else {
        console.warn("Transaction not found for update, could not update.");
    }
};

export const deleteTransactionForUser = async (userId: string, transactionId: string): Promise<void> => {
    const transactions = await getTransactionsForUser(userId);
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    saveTransactions(userId, updatedTransactions);
};
