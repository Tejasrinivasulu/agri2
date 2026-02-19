import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useToast } from '@/hooks/use-toast';

interface VoiceAssistantButtonProps {
  className?: string;
}

const VoiceAssistantButton: React.FC<VoiceAssistantButtonProps> = ({ className = '' }) => {
  const { t } = useLanguage();
  const { isListening, isSpeaking, isLoading, listen, speak, stopSpeaking, askAssistant } = useAIAssistant();
  const { toast } = useToast();
  const [lastResponse, setLastResponse] = useState<string>('');
  
  const handleVoiceClick = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isListening || isLoading) return;

    try {
      const transcript = await listen();
      toast({
        title: "🎤 Heard you say:",
        description: transcript,
      });

      const response = await askAssistant(transcript, 'voice');
      setLastResponse(response);
      speak(response);
      
      toast({
        title: "🌾 Farmer Assistant",
        description: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
      });
    } catch (error) {
      console.error('Voice error:', error);
      toast({
        title: "Voice Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const getButtonContent = () => {
    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;
    if (isListening) return <MicOff className="w-6 h-6 animate-pulse" />;
    if (isSpeaking) return <VolumeX className="w-6 h-6" />;
    return <Mic className="w-6 h-6" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Thinking...";
    if (isListening) return "Listening...";
    if (isSpeaking) return "Tap to stop";
    return t.voiceAssistant;
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Button
        variant="voice"
        size="icon-lg"
        onClick={handleVoiceClick}
        className={`voice-pulse ${isListening ? 'bg-destructive animate-pulse' : isSpeaking ? 'bg-accent' : 'animate-bounce-soft'}`}
        aria-label={t.voiceAssistant}
        disabled={isLoading}
      >
        {getButtonContent()}
      </Button>
      <span className="text-sm text-muted-foreground font-medium">
        {getStatusText()}
      </span>
    </div>
  );
};

export default VoiceAssistantButton;
