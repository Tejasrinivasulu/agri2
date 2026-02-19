import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { language } = useLanguage();

  const getLanguageName = () => {
    switch (language) {
      case 'te': return 'Telugu';
      case 'hi': return 'Hindi';
      default: return 'English';
    }
  };

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'te': 'te-IN',
      'hi': 'hi-IN',
      'ta': 'ta-IN'
    };
    const preferred = langMap[language] || 'en-IN';
    const fallback = 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const pickVoice = (locale: string) => voices.find((v) => v.lang === locale || v.lang.startsWith(locale.split('-')[0]));
    utterance.lang = preferred;
    utterance.rate = 0.9;
    const voice = pickVoice(preferred) || pickVoice(fallback);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const listen = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      const langMap: Record<string, string> = {
        'en': 'en-IN',
        'te': 'te-IN',
        'hi': 'hi-IN',
        'ta': 'ta-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        reject(new Error(event.error));
      };

      recognition.start();
    });
  }, [language]);

  const askAssistant = useCallback(async (query: string, type: 'general' | 'weather' | 'crop_prices' | 'news' | 'voice' = 'general') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { query, type, language: getLanguageName() }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('AI Assistant error:', error);
      return 'Sorry, I could not process your request. Please try again.';
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const getWeather = useCallback(async (location: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { location, language: getLanguageName() }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Weather error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const getCropPrices = useCallback(async (crop: string, location: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-crop-prices', {
        body: { crop, location, language: getLanguageName() }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Crop prices error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const getNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-news', {
        body: { language: getLanguageName() }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('News error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  return {
    isLoading,
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    listen,
    askAssistant,
    getWeather,
    getCropPrices,
    getNews,
  };
};
