import { GoogleGenAI } from "@google/genai";
import { Transaction, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiService = {
  // Auto-categorize a transaction description
  categorizeTransaction: async (description: string): Promise<Category> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Categorize this financial transaction description into one of these categories: ${Object.values(Category).join(", ")}. 
    Description: "${description}"
    Return only the category name.`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const category = response.text.trim() as Category;
      return Object.values(Category).includes(category) ? category : Category.OTHER;
    } catch (error) {
      console.error("AI Categorization failed:", error);
      return Category.OTHER;
    }
  },

  // Generate spending insights and suggestions
  getFinancialInsights: async (transactions: Transaction[], budgets: any[]): Promise<string[]> => {
    const model = "gemini-3-flash-preview";
    const summary = transactions.slice(0, 20).map(t => `${t.date}: ${t.description} - ${t.amount} (${t.category})`).join("\n");
    const prompt = `Analyze these recent transactions and provide 3 actionable financial tips or observations. 
    Keep them short, professional, and encouraging.
    Transactions:
    ${summary}
    Return as a JSON array of strings.`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Insights failed:", error);
      return ["Keep tracking your expenses to get personalized insights.", "Consider setting up a budget for better control.", "You're doing great! Keep it up."];
    }
  },

  // Chatbot response
  getChatResponse: async (message: string, context: { transactions: Transaction[], balance: number }): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const prompt = `You are FinSight AI, a professional financial assistant. 
    User Question: "${message}"
    User Context: Current Balance: ${context.balance}, Recent Transactions: ${context.transactions.slice(0, 5).map(t => t.description).join(", ")}
    Provide a helpful, concise response.`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("AI Chat failed:", error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
    }
  },

  // Predict future expenses
  getExpenseForecast: async (transactions: Transaction[]): Promise<{ nextWeek: number, nextMonth: number, reasoning: string }> => {
    const model = "gemini-3-flash-preview";
    const expenses = transactions.filter(t => t.type === 'Expense');
    const summary = expenses.slice(0, 50).map(t => `${t.date}: ${t.amount} (${t.category})`).join("\n");
    
    const prompt = `Based on the following historical expense data, predict the total expenses for the next 7 days (next week) and the next 30 days (next month).
    Provide a brief reasoning for your prediction based on spending patterns, recurring costs, or anomalies.
    
    Historical Expenses:
    ${summary}
    
    Return the response in JSON format with these keys: "nextWeek" (number), "nextMonth" (number), "reasoning" (string).`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Forecast failed:", error);
      // Fallback calculation
      const avgDaily = expenses.length > 0 
        ? expenses.reduce((sum, t) => sum + t.amount, 0) / (expenses.length * 30) // Very rough estimate
        : 0;
      return {
        nextWeek: avgDaily * 7,
        nextMonth: avgDaily * 30,
        reasoning: "Based on your average daily spending patterns."
      };
    }
  }
};
