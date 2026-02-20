import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import VoiceAssistantButton from './VoiceAssistantButton';
import LocationSelector from './dashboard/LocationSelector';
import WeatherWidget from './dashboard/WeatherWidget';
import NewsSlider from './dashboard/NewsSlider';
import FeatureGrid from './dashboard/FeatureGrid';
import BottomNavigation, { NavTab } from './dashboard/BottomNavigation';
import farmerLogo from '@/assets/farmer-logo.png';
import Chatbot from './chatbot/chatbot';

const DashboardScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [location, setLocation] = useState('Chennai, Tamil Nadu');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const userName = 'Farmer';

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
                  <img src={farmerLogo} alt="Farmer" className="w-full h-full object-cover" />
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

              <div className="bg-card p-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                <p className="text-sm font-semibold text-foreground mb-2 text-center">🎤 AI Voice Assistant</p>
                <p className="text-xs text-muted-foreground text-center mb-3">Say &quot;weather prediction&quot;, &quot;crop price&quot;, &quot;buy sell&quot; to open features. Response is spoken and shown below.</p>
                <div className="flex justify-center">
                  <VoiceAssistantButton
                    onNavigate={navigate}
                    onTranscript={setVoiceTranscript}
                    onResponse={setVoiceResponse}
                  />
                </div>
                {(voiceTranscript || voiceResponse) && (
                  <div className="mt-3 p-3 rounded-xl bg-muted/50 text-sm space-y-1">
                    {voiceTranscript && (
                      <p><span className="font-medium text-muted-foreground">You said:</span> {voiceTranscript}</p>
                    )}
                    {voiceResponse && (
                      <p><span className="font-medium text-muted-foreground">Assistant:</span> {voiceResponse}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-card p-4">
                <FeatureGrid />
              </div>
            </div>
          </>
        );

      case 'profile':
        return (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-6">
              <img src={farmerLogo} alt="Farmer" className="w-20 h-20 rounded-full" />
              <div>
                <h1>{userName}</h1>
                <p className="text-muted-foreground">Farmers Friendly</p>
              </div>
            </div>
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
