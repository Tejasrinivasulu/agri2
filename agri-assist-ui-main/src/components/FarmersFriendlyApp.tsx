import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FarmingNewsProvider } from '@/contexts/FarmingNewsContext';
import DashboardScreen from '@/components/DashboardScreen';

const FarmersFriendlyApp: React.FC = () => {
  return (
    <LanguageProvider>
      <FarmingNewsProvider>
        <div className="mobile-container bg-background min-h-screen">
          <DashboardScreen />
        </div>
      </FarmingNewsProvider>
    </LanguageProvider>
  );
};

export default FarmersFriendlyApp;
