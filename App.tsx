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
  const [currentTheme, setCurrentTheme] = useState<string>('cyber');

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

     // Load saved theme
     const savedProfile = localStorage.getItem('statusbar_profile');
     if (savedProfile) {
       const profile = JSON.parse(savedProfile);
       if (profile.theme) {
         setCurrentTheme(profile.theme);
       }
     }
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

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

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
  };

  if (apiKeyError) {
      return (
          <div className="h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">API Key Missing</h1>
              <p className="text-muted max-w-md">
                  NEXUS requires a Google Gemini API Key to function. 
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
          return <Dashboard user={user} onLogout={handleLogout} onThemeChange={handleThemeChange} />;
          
      default:
          return <LandingPage onGetStarted={() => setCurrentView('login')} />;
  }
}