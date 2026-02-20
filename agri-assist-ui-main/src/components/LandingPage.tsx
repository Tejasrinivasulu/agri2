import React from 'react';
import { Mic, MicOff, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import farmerLogo from '@/assets/farmer-logo.png';
import farmBackground from '@/assets/farm-background.jpg';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant, getVoiceIntentPath } from '@/hooks/useAIAssistant';
import { useToast } from '@/hooks/use-toast';

/** Short 1–2 line welcome; farmer then asks via voice to open dashboard or any feature. Language matches selected app language. */
const WELCOME_VOICE: Record<string, string> = {
  en: 'Welcome to Farmers Friendly. Say open dashboard, weather, crop price, or crop scan.',
  te: 'ఫార్మర్స్ ఫ్రెండ్లీకి స్వాగతం. డాష్‌బోర్డ్, వాతావరణం, పంట ధర లేదా క్రాప్ స్కాన్ తెరవండి అనండి.',
  hi: 'फार्मर्स फ्रेंडली में स्वागत है। डैशबोर्ड, मौसम, फसल कीमत या क्रॉप स्कैन खोलें बोलें।',
};

interface LandingPageProps {
  onEnter: () => void;
  onNavigate?: (path: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onNavigate }) => {
  const { language } = useLanguage();
  const { isListening, isSpeaking, isLoading, listen, speak, stopSpeaking, answerWithFallback } = useAIAssistant();
  const { toast } = useToast();

  const welcomeMessage = WELCOME_VOICE[language] || WELCOME_VOICE.en;

  const handleVoiceClick = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (isListening || isLoading) return;

    try {
      speak(welcomeMessage);
      toast({ title: '🎤', description: 'Listening...' });
      await new Promise((r) => setTimeout(r, 1200));

      const transcript = await listen();
      toast({ title: '🎤 Heard', description: transcript || 'Listening...' });

      const path = getVoiceIntentPath(transcript);
      if (onNavigate && path) {
        onNavigate(path);
        toast({ title: 'Opening...', description: path === '/' ? 'Dashboard' : path.replace('/features/', '') });
      }
      if (path === '/') onEnter(); // show dashboard when user says home/dashboard

      const response = await answerWithFallback(transcript);
      speak(response);
      toast({ title: '🌾 Assistant', description: response.length > 60 ? response.slice(0, 60) + '...' : response });
    } catch (error) {
      console.error('Voice error:', error);
      const msg = (error as Error)?.message || '';
      const needsPerm = msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('microphone');
      toast({
        title: 'Voice',
        description: needsPerm ? 'Microphone access needed. Allow and try again.' : 'Could not listen. Try again.',
        variant: 'destructive',
      });
    }
  };

  const getVoiceButtonContent = () => {
    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;
    if (isListening) return <MicOff className="w-6 h-6 animate-pulse" />;
    if (isSpeaking) return <VolumeX className="w-6 h-6" />;
    return <Mic className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background farmer / farm image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${farmBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/95" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Language selector - top right (3 languages) */}
        <div className="flex justify-end p-4">
          <LanguageSelector />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="text-center max-w-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg bg-card">
              <img src={farmerLogo} alt="Farmers Friendly" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Farmers Friendly</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your smart farming companion — weather, crop prices, crop scan, and more.
            </p>

            {/* AI Voice Assistant - above Get Started */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <Button
                variant="voice"
                size="icon-lg"
                onClick={handleVoiceClick}
                disabled={isLoading}
                className={`voice-pulse ${isListening ? 'bg-destructive animate-pulse' : isSpeaking ? 'bg-accent' : ''}`}
                aria-label="Voice assistant"
              >
                {getVoiceButtonContent()}
              </Button>
              <span className="text-xs text-muted-foreground">
                {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Tap, then say open dashboard or any feature'}
              </span>
            </div>

            <Button size="lg" onClick={onEnter} className="w-full max-w-[200px] font-semibold">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
