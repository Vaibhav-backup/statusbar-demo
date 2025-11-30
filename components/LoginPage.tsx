import React, { useState } from 'react';
import { Button } from './Button';
import { Zap, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string, email: string) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginMode && !name)) return;

    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
        const finalName = name || email.split('@')[0];
        onLogin(finalName, email);
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white mb-6 shadow-lg shadow-white/20">
                <Zap className="text-black w-5 h-5 fill-current" />
            </div>
            <h2 className="text-2xl font-light text-white mb-2 tracking-tight">
                {isLoginMode ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-zinc-500 text-sm">
                {isLoginMode ? 'Enter your credentials to access.' : 'Start your productivity journey.'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
                <div className="space-y-1">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm"
                        placeholder="Username"
                        required
                    />
                </div>
            )}
            <div className="space-y-1">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm"
                    placeholder="Email address"
                    required
                />
            </div>
            <div className="space-y-1">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-zinc-800 py-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors text-sm"
                    placeholder="Password"
                    required
                />
            </div>

            <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                {isLoginMode ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
        </form>

        <div className="mt-8 text-center space-y-4">
            <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="block w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                {isLoginMode ? "No account? Create one." : "Have an account? Sign in."}
            </button>
            
            <button onClick={onBack} className="block w-full text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
                Return to home
            </button>
        </div>
      </div>
    </div>
  );
};