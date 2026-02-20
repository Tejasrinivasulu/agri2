import React, { useState } from 'react';
import { Mic, MicOff, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant, getVoiceIntentPath } from '@/hooks/useAIAssistant';
import { useToast } from '@/hooks/use-toast';

interface VoiceAssistantButtonProps {
  className?: string;
  /** When provided, voice intents like "crop price" or "weather" will navigate to the feature. */
  onNavigate?: (path: string) => void;
  /** Optional: called with transcript and response so parent can display them. */
  onTranscript?: (transcript: string) => void;
  onResponse?: (response: string) => void;
}

const VoiceAssistantButton: React.FC<VoiceAssistantButtonProps> = ({ className = '', onNavigate, onTranscript, onResponse }) => {
  const { t } = useLanguage();
  const { isListening, isSpeaking, isLoading, listen, speak, stopSpeaking, answerWithFallback } = useAIAssistant();
  const { toast } = useToast();

  const handleVoiceClick = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (isListening || isLoading) return;

    try {
      const transcript = await listen();
      onTranscript?.(transcript);
      toast({
        title: '🎤 Heard',
        description: transcript || 'Listening...',
      });

      const path = getVoiceIntentPath(transcript);
      if (onNavigate && path) {
        onNavigate(path);
        toast({ title: 'Opening...', description: path.replace('/features/', '') });
      }

      const response = await answerWithFallback(transcript);
      onResponse?.(response);
      speak(response);
      toast({
        title: '🌾 Assistant',
        description: response.length > 80 ? response.substring(0, 80) + '...' : response,
      });
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

  const getButtonContent = () => {
    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;
    if (isListening) return <MicOff className="w-6 h-6 animate-pulse" />;
    if (isSpeaking) return <VolumeX className="w-6 h-6" />;
    return <Mic className="w-6 h-6" />;
  };

  const getStatusText = () => {
    if (isLoading) return t.thinking;
    if (isListening) return t.listening;
    if (isSpeaking) return t.speaking;
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
