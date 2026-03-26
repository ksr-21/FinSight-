import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { SunIcon, MoonIcon, ChartPieIcon, PlusIcon } from './icons';
import { Currency } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onAddTransaction: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, currency, onCurrencyChange, onAddTransaction }) => {
  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Budgets', path: '/budgets' },
    { label: 'Insights', path: '/insights' },
    { label: 'Wealth Horizon', path: '/horizon' },
    { label: 'News', path: '/news' },
  ];

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <NavLink to="/" className="flex items-center group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <ChartPieIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-text-primary dark:text-white tracking-tight hidden sm:block">
                FinSight<span className="text-indigo-600">.</span>
              </h1>
            </NavLink>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'text-text-secondary dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Currency Selector - Hardware Style (Recipe 3) */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-1 border border-gray-200 dark:border-gray-700 shadow-inner">
              <button 
                onClick={() => onCurrencyChange('USD')}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  currency === 'USD' 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                USD
                {currency === 'USD' && (
                  <motion.div layoutId="active-currency" className="absolute inset-0 bg-indigo-500/5 rounded-xl border border-indigo-500/20" />
                )}
              </button>
              <button 
                onClick={() => onCurrencyChange('INR')}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  currency === 'INR' 
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                INR
                {currency === 'INR' && (
                  <motion.div layoutId="active-currency" className="absolute inset-0 bg-indigo-500/5 rounded-xl border border-indigo-500/20" />
                )}
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />

            {/* User Profile - Recipe 8/12 */}
            <button className="flex items-center gap-3 pl-1 pr-3 py-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                JD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-text-primary dark:text-white leading-none mb-1">John Doe</p>
                <p className="text-[8px] font-mono text-text-secondary dark:text-gray-500 uppercase tracking-widest leading-none">Pro Member</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
