import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import SplashScreen from '@/components/SplashScreen';
import LoginScreen from '@/components/LoginScreen';
import SignUpScreen from '@/components/SignUpScreen';
import DashboardScreen from '@/components/DashboardScreen';
import { Loader2 } from 'lucide-react';

type Screen = 'splash' | 'login' | 'signup' | 'dashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (!loading && user) {
      setCurrentScreen('dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('splash');
  };

  const renderScreen = () => {
    // If user is logged in, always show dashboard
    if (user) {
      return <DashboardScreen onLogout={handleLogout} />;
    }

    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onLogin={() => setCurrentScreen('login')}
            onSignUp={() => setCurrentScreen('signup')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={() => setCurrentScreen('splash')}
            onSwitchToSignUp={() => setCurrentScreen('signup')}
            onSuccess={handleAuthSuccess}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onBack={() => setCurrentScreen('splash')}
            onSwitchToLogin={() => setCurrentScreen('login')}
            onSuccess={handleAuthSuccess}
          />
        );
      case 'dashboard':
        return <DashboardScreen onLogout={handleLogout} />;
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {renderScreen()}
    </div>
  );
};

const FarmersFriendlyApp: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default FarmersFriendlyApp;
