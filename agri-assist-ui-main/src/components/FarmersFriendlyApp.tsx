import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmingNewsProvider } from '@/contexts/FarmingNewsContext';
import LandingPage from '@/components/LandingPage';
import DashboardScreen from '@/components/DashboardScreen';

const ENTERED_KEY = 'app_entered';

/** Uses app-level LanguageProvider. Persists "entered" so "open dashboard" / back goes to home (dashboard), not landing. */
const FarmersFriendlyApp: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(() => {
    try {
      return sessionStorage.getItem(ENTERED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();

  const setEntered = (value: boolean) => {
    setHasEntered(value);
    try {
      if (value) sessionStorage.setItem(ENTERED_KEY, 'true');
      else sessionStorage.removeItem(ENTERED_KEY);
    } catch {
      // ignore
    }
  };

  const handleLandingNavigate = (path: string) => {
    if (path !== '/') setEntered(true);
    navigate(path);
  };

  return (
    <FarmingNewsProvider>
      <div className="mobile-container bg-background min-h-screen">
        {hasEntered ? (
          <DashboardScreen />
        ) : (
          <LandingPage
            onEnter={() => setEntered(true)}
            onNavigate={handleLandingNavigate}
          />
        )}
      </div>
    </FarmingNewsProvider>
  );
};

export default FarmersFriendlyApp;
