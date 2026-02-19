import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  emoji: string;
  date: string;
}

const NewsSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { getNews, speak, isSpeaking, stopSpeaking } = useAIAssistant();

  const defaultNews: NewsItem[] = [
    { id: 1, title: 'Paddy MSP increased by ₹100 per quintal', summary: 'Government announces new MSP rates for rabi season.', category: 'government', emoji: '🌾', date: 'Today' },
    { id: 2, title: 'New irrigation scheme launched for farmers', summary: 'Free micro-irrigation kits available for small farmers.', category: 'schemes', emoji: '💧', date: 'Today' },
    { id: 3, title: 'Organic farming subsidy extended till 2025', summary: 'Up to 50% subsidy on organic inputs for registered farmers.', category: 'schemes', emoji: '🌱', date: 'Today' },
    { id: 4, title: 'Weather alert: Heavy rains expected', summary: 'IMD predicts rainfall in southern states this week.', category: 'weather', emoji: '🌧️', date: 'Today' },
    { id: 5, title: 'Tomato prices rise by 20%', summary: 'Supply shortage drives prices up in wholesale markets.', category: 'market', emoji: '🍅', date: 'Today' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await getNews();
        if (data?.news && data.news.length > 0) {
          setNews(data.news);
        } else {
          setNews(defaultNews);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        setNews(defaultNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const handleSpeak = (item: NewsItem) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(`${item.title}. ${item.summary}`);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📰</span>
          <h3 className="font-semibold text-foreground">Farming News</h3>
        </div>
        <div className="bg-gradient-to-r from-primary/10 to-leaf-light/30 rounded-2xl p-6 border border-primary/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading news...</span>
        </div>
      </div>
    );
  }

  const displayNews = news.length > 0 ? news : defaultNews;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📰</span>
        <h3 className="font-semibold text-foreground">Farming News</h3>
        <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">AI Powered</span>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {displayNews.map((item) => (
            <div key={item.id} className="min-w-full px-1">
              <div className="bg-gradient-to-r from-primary/10 to-leaf-light/30 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm leading-tight mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                      <button 
                        onClick={() => handleSpeak(item)}
                        className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={goToPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-1 bg-card/80 rounded-full shadow-md z-10"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-card/80 rounded-full shadow-md z-10"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>
      
      <div className="flex justify-center gap-1.5 mt-3">
        {displayNews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-4' : 'bg-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsSlider;
