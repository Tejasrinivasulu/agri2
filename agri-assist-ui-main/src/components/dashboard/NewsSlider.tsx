import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Loader2, RefreshCw } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useFarmingNews, type NewsItem } from '@/contexts/FarmingNewsContext';
import { formatRelativeTime, formatTimeAgo } from '@/lib/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';

const NewsSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const { news, lastUpdated, loading, refresh } = useFarmingNews();
  const { speak, isSpeaking, stopSpeaking } = useAIAssistant();
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => setTick((c) => c + 1), 60 * 1000);
    return () => clearInterval(interval);
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
    if (isSpeaking) stopSpeaking();
    else speak(`${item.title}. ${item.summary}`);
  };

  const displayDate = (item: NewsItem) => {
    if (item.publishedAt) {
      try {
        return formatRelativeTime(new Date(item.publishedAt));
      } catch {
        return item.date;
      }
    }
    return item.date;
  };

  const now = new Date();

  if (loading && news.length === 0) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📰</span>
            <h3 className="font-semibold text-foreground">{t.farmingNews}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-r from-primary/10 to-leaf-light/30 rounded-2xl p-6 border border-primary/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading news...</span>
        </div>
      </div>
    );
  }

  const displayNews = news.length > 0 ? news : [];

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg">📰</span>
          <h3 className="font-semibold text-foreground">{t.farmingNews}</h3>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Live</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground" title={lastUpdated.toLocaleString()}>
              Updated {formatTimeAgo(lastUpdated, now)}
            </span>
          )}
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="p-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground disabled:opacity-50 transition-colors"
            title="Refresh news"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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
                      <span className="text-xs text-muted-foreground">{displayDate(item)}</span>
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
