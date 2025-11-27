import React, { useState } from 'react';
import { Button } from './Button';
import { Zap, ArrowRight, Lock } from 'lucide-react';

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
        // Use part of email as name if logging in, or the provided name if signing up
        const finalName = name || email.split('@')[0];
        onLogin(finalName, email);
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 mb-4 shadow-xl">
                <Zap className="text-emerald-500 w-6 h-6 fill-current" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
                {isLoginMode ? 'Identify Yourself' : 'Join the Movement'}
            </h2>
            <p className="text-slate-400">
                {isLoginMode ? 'Welcome back, legend.' : 'Your productivity arc starts here.'}
            </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Username</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. AcademicWeapon99"
                            required
                        />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Email Protocol</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Access Key</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <Button type="submit" className="w-full py-3 text-base mt-2" isLoading={isLoading}>
                    {isLoginMode ? 'Access Mainframe' : 'Initialize Account'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <button 
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                >
                    {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </div>

        <div className="mt-8 text-center">
            <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-300">
                &larr; Back to home
            </button>
        </div>
      </div>
    </div>
  );
};