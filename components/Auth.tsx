import React, { useState } from 'react';
import { ChartPieIcon, ArrowLeftIcon, RefreshIcon } from './icons';
import { signInWithEmail, signUpWithEmail } from '../services/firestoreService';

interface AuthProps {
    onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        
        setIsLoading(true);

        try {
            if (isLogin) {
                await signInWithEmail(email, password);
                // onLoginSuccess is no longer needed, onAuthStateChanged will trigger the app view
            } else { // Sign Up
                await signUpWithEmail(email, password);
                // onAuthStateChanged will handle the login
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col justify-center items-center p-4">
             <div className="absolute top-4 left-4">
                <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors">
                    <ArrowLeftIcon className="h-5 w-5"/>
                    <span>Back to Home</span>
                </button>
            </div>
            <div className="w-full max-w-sm">
                <div className="flex justify-center items-center mb-6">
                    <ChartPieIcon className="h-10 w-10 text-primary dark:text-primary-dark" />
                    <h1 className="ml-3 text-3xl font-bold text-text-primary dark:text-white">
                        FinSight AI
                    </h1>
                </div>
                <div className="bg-card dark:bg-gray-800 shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-center text-text-primary dark:text-white mb-2">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="text-center text-text-secondary dark:text-gray-400 mb-6 text-sm">{isLogin ? 'Sign in to continue' : 'Get started with your free account'}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/20 p-2 rounded-md">{error}</p>}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required
                                disabled={isLoading}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required
                                disabled={isLoading}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700" 
                            />
                        </div>
                        <div className="pt-2">
                             <button type="submit" disabled={isLoading} className="w-full h-10 flex justify-center items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-500 disabled:cursor-not-allowed">
                                {isLoading ? <RefreshIcon className="animate-spin h-5 w-5" /> : (isLogin ? 'Login' : 'Sign Up')}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} disabled={isLoading} className="text-sm text-primary hover:underline disabled:text-gray-400">
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;