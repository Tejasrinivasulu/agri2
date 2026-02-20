import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const LANG_MAP: Record<string, string> = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN' };

/** Local fallback responses when backend is unavailable. Keys are lowercase English keywords; values are [en, hi, te]. */
const LOCAL_VOICE_RESPONSES: Record<string, [string, string, string]> = {
  crop: ['Open Crop Rates from the dashboard for live market prices.', 'फसल कीमत के लिए डैशबोर्ड से Crop Rates खोलें।', 'లైవ్ మార్కెట్ ధరల కోసం డాష్‌బోర్డ్ నుండి Crop Rates తెరవండి।'],
  price: ['Open Crop Rates for today\'s prices.', 'आज की कीमतों के लिए Crop Rates खोलें।', 'ఈ రోజు ధరల కోసం Crop Rates తెరవండి।'],
  weather: ['Open Weather from the dashboard for forecast.', 'मौसम के लिए डैशबोर्ड से Weather खोलें।', 'వాతావరణ పూర్వావలోకనం కోసం డాష్‌బోర్డ్ నుండి Weather తెరవండి।'],
  buy: ['Open Buy and Sell to trade crops.', 'फसल बेचने-खरीदने के लिए Buy and Sell खोलें।', 'పంటల వ్యాపారం కోసం Buy and Sell తెరవండి।'],
  sell: ['Open Buy and Sell to list your crops.', 'अपनी फसल लिस्ट करने के लिए Buy and Sell खोलें।', 'మీ పంటలను జాబితా చేయడానికి Buy and Sell తెరవండి।'],
  cattle: ['Open Cattle and Pets for livestock.', 'पशुधन के लिए Cattle and Pets खोलें।', 'పశువుల కోసం Cattle and Pets తెరవండి।'],
  tools: ['Open Agri Tools to rent or buy equipment.', 'उपकरण के लिए Agri Tools खोलें।', 'పరికరాల కోసం Agri Tools తెరవండి।'],
  technician: ['Open Technicians to find support.', 'तकनीशियन के लिए Technicians खोलें।', 'టెక్నీషియన్ల కోసం Technicians తెరవండి।'],
  soil: ['Open Soil Test for soil health and crop tips.', 'मिट्टी जांच के लिए Soil Test खोलें।', 'మట్టి ఆరోగ్యం కోసం Soil Test తెరవండి।'],
  scheme: ['Open Govt Schemes for subsidies and schemes.', 'योजनाओं के लिए Govt Schemes खोलें।', 'సబ్సిడీల కోసం Govt Schemes తెరవండి।'],
  loan: ['Open Loan Assistance for loan options.', 'कर्ज के लिए Loan Assistance खोलें।', 'లోన్ ఎంపికల కోసం Loan Assistance తెరవండి।'],
  land: ['Open Land Rent to rent in or rent out land.', 'जमीन किराए के लिए Land Rent खोलें।', 'భూమి అద్దె కోసం Land Rent తెరవండి।'],
  invest: ['Open Agri Invest for investment options.', 'निवेश के लिए Agri Invest खोलें।', 'ఇన్వెస్ట్ మెంట్ కోసం Agri Invest తెరవండి।'],
  job: ['Open Farm Work for jobs and workers.', 'काम के लिए Farm Work खोलें।', 'ఉద్యోగాల కోసం Farm Work తెరవండి।'],
  seed: ['Open FF Seeds for seed catalog.', 'बीज के लिए FF Seeds खोलें।', 'విత్తనాల కోసం FF Seeds తెరవండి।'],
  guide: ['Open Farmer Guide for farming tips.', 'जानकारी के लिए Farmer Guide खोलें।', 'వ్యవసాయ చిట్కాల కోసం Farmer Guide తెరవండి।'],
  calculator: ['Open Calculator for fertilizer, yield and profit.', 'कैलकुलेटर के लिए Calculator खोलें।', 'కాల్క్యులేటర్ కోసం Calculator తెరవండి।'],
  reward: ['Open Rewards to see your points.', 'पॉइंट्स के लिए Rewards खोलें।', 'మీ పాయింట్లు కోసం Rewards తెరవండి।'],
  map: ['Open Map View for farms and markets.', 'नक्शा के लिए Map View खोलें।', 'పంటలు మరియు మార్కెట్ల కోసం Map View తెరవండి।'],
  news: ['Farming news is on the dashboard. Scroll up to see latest.', 'खेती की खबरें डैशबोर्ड पर हैं।', 'వ్యవసాయ వార్తలు డాష్‌బోర్డ్‌లో ఉన్నాయి।'],
  help: ['You can ask for crop prices, weather, buy sell, cattle, tools, technicians, soil test, schemes, loans, land, invest, jobs, seeds, guide, calculator, rewards and map.', 'आप कीमत, मौसम, खरीद-बिक्री, पशु, उपकरण, मिट्टी, योजना, कर्ज पूछ सकते हैं।', 'మీరు ధరలు, వాతావరణం, కొనడం అమ్మడం, పశువులు, సాధనాలు, మట్టి, ఋణాలు అడగవచ్చు।'],
};

/** Voice intent → route. Longer phrases first for accurate matching. Includes common EN + transliterations (Hindi/Telugu). */
const VOICE_INTENT_ROUTES: [string, string][] = [
  ['open weather prediction', '/features/weather'],
  ['weather prediction', '/features/weather'],
  ['open weather forecast', '/features/weather'],
  ['weather forecast', '/features/weather'],
  ['open weather', '/features/weather'],
  ['crop price', '/features/crop-rates'],
  ['crop prices', '/features/crop-rates'],
  ['crop rate', '/features/crop-rates'],
  ['tomato price', '/features/crop-rates'],
  ['rice price', '/features/crop-rates'],
  ['market price', '/features/crop-rates'],
  ['buy and sell', '/features/buy-sell'],
  ['buy sell', '/features/buy-sell'],
  ['weekend farm', '/features/weekend-farming'],
  ['farming class', '/features/farming-classes'],
  ['farmer guide', '/features/farmer-guide'],
  ['agri invest', '/features/agri-invest'],
  ['farm work', '/features/farm-work'],
  ['ff seeds', '/features/ff-seeds'],
  ['govt scheme', '/features/govt-schemes'],
  ['government scheme', '/features/govt-schemes'],
  ['agri officer', '/features/agri-officers'],
  ['loan assistance', '/features/loan-assistance'],
  ['land rent', '/features/land-renting'],
  ['soil test', '/features/soil-testing'],
  ['price prediction', '/features/price-prediction'],
  ['agri tools', '/features/agri-tools'],
  ['map view', '/features/map'],
  ['crop scan', '/features/crop-scan'],
  ['scan crop', '/features/crop-scan'],
  ['camera', '/features/crop-scan'],
  ['mausam', '/features/weather'],
  ['mausam report', '/features/weather'],
  ['weather report', '/features/weather'],
  ['crop', '/features/crop-rates'],
  ['price', '/features/crop-rates'],
  ['weather', '/features/weather'],
  ['buy', '/features/buy-sell'],
  ['sell', '/features/buy-sell'],
  ['cattle', '/features/cattle'],
  ['pets', '/features/cattle'],
  ['tools', '/features/agri-tools'],
  ['tractor', '/features/agri-tools'],
  ['technician', '/features/technicians'],
  ['soil', '/features/soil-testing'],
  ['scheme', '/features/govt-schemes'],
  ['government', '/features/govt-schemes'],
  ['officer', '/features/agri-officers'],
  ['loan', '/features/loan-assistance'],
  ['land', '/features/land-renting'],
  ['rent', '/features/land-renting'],
  ['invest', '/features/agri-invest'],
  ['job', '/features/farm-work'],
  ['work', '/features/farm-work'],
  ['seed', '/features/ff-seeds'],
  ['seeds', '/features/ff-seeds'],
  ['guide', '/features/farmer-guide'],
  ['weekend', '/features/weekend-farming'],
  ['class', '/features/farming-classes'],
  ['classes', '/features/farming-classes'],
  ['calculator', '/features/calculator'],
  ['reward', '/features/rewards'],
  ['rewards', '/features/rewards'],
  ['map', '/features/map'],
  ['prediction', '/features/price-prediction'],
  ['ai', '/features/price-prediction'],
  ['home', '/'],
  ['main', '/'],
  ['back', '/'],
];

export function getVoiceIntentPath(transcript: string): string | null {
  const lower = (transcript || '').toLowerCase().trim();
  if (!lower) return null;
  for (const [keyword, path] of VOICE_INTENT_ROUTES) {
    if (lower.includes(keyword)) return path;
  }
  return null;
}

function getLocalFallback(text: string, lang: 'en' | 'hi' | 'te'): string {
  const lower = text.toLowerCase().trim();
  const idx = lang === 'hi' ? 1 : lang === 'te' ? 2 : 0;
  for (const [key, responses] of Object.entries(LOCAL_VOICE_RESPONSES)) {
    if (lower.includes(key)) return responses[idx];
  }
  const generic: [string, string, string] = [
    'I can help with crop prices, weather, buy and sell, and more. Open the dashboard and tap the feature you need, or try asking "crop price" or "weather".',
    'मैं कीमत, मौसम, खरीद-बिक्री में मदद कर सकता हूं। डैशबोर्ड से फीचर चुनें।',
    'నేను ధరలు, వాతావరణం, కొనడం అమ్మడం లో సహాయం చేయగలను. డాష్‌బోర్డ్ నుండి ఎంచుకోండి.',
  ];
  return generic[idx];
}

/** Wait for speech synthesis voices to be loaded (browsers often load them async). */
function ensureVoicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) {
      resolve(list);
      return;
    }
    const onVoices = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
}

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
    if (!('speechSynthesis' in window) || !text?.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    const preferred = LANG_MAP[language] || 'en-IN';
    utterance.lang = preferred;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    ensureVoicesReady().then((voices) => {
      const pick = (locale: string) => voices.find((v) => v.lang === locale || v.lang.startsWith(locale.split('-')[0]));
      const voice = pick(preferred) || pick('en-IN') || pick('en');
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    });
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
      const response = data?.response;
      if (typeof response === 'string' && response.trim()) return response;
      throw new Error('No response');
    } catch (error) {
      console.error('AI Assistant error:', error);
      return '';
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  /** End-to-end: try backend first, then local fallback. Always returns a string to speak. */
  const answerWithFallback = useCallback(async (transcript: string): Promise<string> => {
    const trimmed = transcript?.trim();
    if (!trimmed) return getLocalFallback('help', language === 'hi' ? 'hi' : language === 'te' ? 'te' : 'en');

    const fallbackLang = language === 'hi' ? 'hi' : language === 'te' ? 'te' : 'en';
    try {
      const response = await askAssistant(trimmed, 'voice');
      if (response && response.trim()) return response;
    } catch (_) {
      // ignore
    }
    return getLocalFallback(trimmed, fallbackLang);
  }, [language, askAssistant]);

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
    answerWithFallback,
    getWeather,
    getCropPrices,
    getNews,
  };
};
