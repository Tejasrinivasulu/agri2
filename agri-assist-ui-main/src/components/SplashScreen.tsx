import React from 'react';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import VoiceAssistantButton from './VoiceAssistantButton';
import farmerLogo from '@/assets/farmer-logo.png';
import farmBackground from '@/assets/farm-background.jpg';

interface SplashScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onLogin, onSignUp }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${farmBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with Language Selector */}
        <div className="flex justify-end p-4">
          <LanguageSelector />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Logo and Branding */}
          <div className="text-center mb-8 animate-fade-in">
            {/* Logo Container */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto rounded-3xl bg-card shadow-card flex items-center justify-center overflow-hidden border-4 border-primary/20">
                <img 
                  src={farmerLogo} 
                  alt="Farmers Friendly Logo" 
                  className="w-28 h-28 object-contain"
                />
              </div>
              {/* Decorative leaves */}
              <Sprout className="absolute -top-2 -right-2 w-8 h-8 text-leaf-medium animate-bounce-soft" />
              <Sprout className="absolute -bottom-2 -left-2 w-6 h-6 text-leaf-light rotate-180" />
            </div>

            {/* App Name */}
            <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">
              {t.appName}
            </h1>

            {/* Tagline */}
            <p className="text-lg text-muted-foreground font-medium max-w-xs mx-auto">
              {t.tagline}
            </p>
          </div>

          {/* Voice Assistant */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <VoiceAssistantButton />
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-xs space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button
              variant="farmer"
              size="xl"
              className="w-full"
              onClick={onLogin}
            >
              {t.login}
            </Button>

            <Button
              variant="farmer-outline"
              size="xl"
              className="w-full"
              onClick={onSignUp}
            >
              {t.signUp}
            </Button>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="h-20 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 flex justify-around">
            {[...Array(7)].map((_, i) => (
              <Sprout 
                key={i} 
                className="w-8 h-8 text-leaf-medium opacity-60" 
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  transform: `translateY(${Math.random() * 10}px)` 
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
