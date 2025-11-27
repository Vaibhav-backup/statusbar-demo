import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';

type ViewState = 'landing' | 'login' | 'app';

interface UserState {
  name: string;
  email: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [user, setUser] = useState<UserState | null>(null);
  const [apiKeyError, setApiKeyError] = useState(false);

  useEffect(() => {
     if(!process.env.API_KEY) {
        setApiKeyError(true);
     }
     
     // Check for persisted session
     const savedUser = localStorage.getItem('statusbar_user');
     if (savedUser) {
         setUser(JSON.parse(savedUser));
         setCurrentView('app');
     }
  }, []);

  const handleLogin = (name: string, email: string) => {
      const newUser = { name, email };
      setUser(newUser);
      localStorage.setItem('statusbar_user', JSON.stringify(newUser));
      setCurrentView('app');
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('statusbar_user');
      setCurrentView('landing');
  };

  if (apiKeyError) {
      return (
          <div className="h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">API Key Missing</h1>
              <p className="text-slate-400 max-w-md">
                  Statusbar requires a Google Gemini API Key to function. 
                  Please restart the environment with a valid API key.
              </p>
          </div>
      )
  }

  // Router logic
  switch (currentView) {
      case 'landing':
          return <LandingPage onGetStarted={() => setCurrentView('login')} />;
      
      case 'login':
          return <LoginPage onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
      
      case 'app':
          if (!user) {
              setCurrentView('login');
              return null;
          }
          return <Dashboard user={user} onLogout={handleLogout} />;
          
      default:
          return <LandingPage onGetStarted={() => setCurrentView('login')} />;
  }
}