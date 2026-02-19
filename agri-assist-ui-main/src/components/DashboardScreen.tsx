import React, { useState } from 'react';
import { LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import LanguageSelector from './LanguageSelector';
import VoiceAssistantButton from './VoiceAssistantButton';
import LocationSelector from './dashboard/LocationSelector';
import WeatherWidget from './dashboard/WeatherWidget';
import NewsSlider from './dashboard/NewsSlider';
import FeatureGrid from './dashboard/FeatureGrid';
import BottomNavigation, { NavTab } from './dashboard/BottomNavigation';


import farmerLogo from '@/assets/farmer-logo.png';
import Chatbot from './chatbot/chatbot'; // ✅ CORRECT IMPORT

interface DashboardScreenProps {
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [location, setLocation] = useState('Chennai, Tamil Nadu');

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const userName = user?.user_metadata?.full_name || 'Farmer';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
              <div className="flex items-center justify-between mb-4">
                <LocationSelector location={location} onLocationChange={setLocation} />
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <img src={farmerLogo} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p>{t.welcomeBackUser}</p>
                  <h2>{userName} 👋</h2>
                </div>
              </div>

              <WeatherWidget location={location} />
            </div>

            <div className="px-4 space-y-6">
              <div className="bg-card p-4">
                <NewsSlider />
              </div>

              <div className="flex flex-col items-center gap-2">
                <VoiceAssistantButton />
                <p className="text-xs text-muted-foreground text-center">
                  Voice: English • Telugu • Hindi — change language above to switch.
                </p>
              </div>

              <div className="bg-card p-4">
                <FeatureGrid />
              </div>

              <Button className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> {t.logout}
              </Button>
            </div>
          </>
        );

      case 'profile':
        return (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-6">
              <img src={farmerLogo} alt="Profile" className="w-20 h-20 rounded-full" />
              <div>
                <h1>{userName}</h1>
                <p>{user?.email}</p>
              </div>
            </div>

            <Button className="w-full" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> {t.logout}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {renderTabContent()}

      {/* ✅ Chatbot */}
      <Chatbot />

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default DashboardScreen;
