import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';

type ViewState = 'landing' | 'login' | 'app';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [user, setUser] = useState<any | null>(null);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('cyber');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     // Check for Gemini API Key
     if (!process.env.API_KEY) {
        setApiKeyError(true);
     }
     
     // Check Local Storage for User
     const storedUser = localStorage.getItem('lockin_user');
     if (storedUser) {
       setUser(JSON.parse(storedUser));
       setCurrentView('app');
     }
     setIsLoading(false);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  const handleLogin = (userData: any) => {
      localStorage.setItem('lockin_user', JSON.stringify(userData));
      setUser(userData);
      setCurrentView('app');
  };

  const handleLogout = () => {
      localStorage.removeItem('lockin_user');
      setUser(null);
      setCurrentView('landing');
  };

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
  };

  if (apiKeyError) {
      return (
          <div className="h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">API Key Missing</h1>
              <p className="text-muted max-w-md">
                  LOCK IN requires a Google Gemini API Key to function. 
                  Please check your environment variables.
              </p>
          </div>
      )
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
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
          return <Dashboard user={user} onLogout={handleLogout} onThemeChange={handleThemeChange} />;
          
      default:
          return <LandingPage onGetStarted={() => setCurrentView('login')} />;
  }
}