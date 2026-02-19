import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  emoji: string;
  date: string;
  publishedAt?: string; // ISO string if from API
}

const defaultNews: NewsItem[] = [
  { id: 1, title: 'Paddy MSP increased by ₹100 per quintal', summary: 'Government announces new MSP rates for rabi season.', category: 'government', emoji: '🌾', date: 'Today' },
  { id: 2, title: 'New irrigation scheme launched for farmers', summary: 'Free micro-irrigation kits available for small farmers.', category: 'schemes', emoji: '💧', date: 'Today' },
  { id: 3, title: 'Organic farming subsidy extended till 2025', summary: 'Up to 50% subsidy on organic inputs for registered farmers.', category: 'schemes', emoji: '🌱', date: 'Today' },
  { id: 4, title: 'Weather alert: Heavy rains expected', summary: 'IMD predicts rainfall in southern states this week.', category: 'weather', emoji: '🌧️', date: 'Today' },
  { id: 5, title: 'Tomato prices rise by 20%', summary: 'Supply shortage drives prices up in wholesale markets.', category: 'market', emoji: '🍅', date: 'Today' },
];

function normalizeNewsItem(item: any, index: number, fetchedAt: Date): NewsItem {
  const id = item.id ?? index + 1;
  const title = item.title || item.headline || 'Update';
  const summary = item.summary || item.description || '';
  const category = item.category || 'news';
  const emoji = item.emoji || '📌';
  const date = item.date || item.publishedAt || item.published_at || fetchedAt.toISOString();
  return { id, title, summary, category, emoji, date, publishedAt: typeof date === 'string' ? date : undefined };
}

interface FarmingNewsContextValue {
  news: NewsItem[];
  lastUpdated: Date | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const FarmingNewsContext = createContext<FarmingNewsContextValue | null>(null);

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function FarmingNewsProvider({ children }: { children: React.ReactNode }) {
  const { getNews } = useAIAssistant();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNews();
      const fetchedAt = new Date();
      if (data?.news && Array.isArray(data.news) && data.news.length > 0) {
        const items = data.news.map((item: any, i: number) => normalizeNewsItem(item, i, fetchedAt));
        setNews(items);
      } else {
        setNews(defaultNews.map((item, i) => ({ ...item, publishedAt: fetchedAt.toISOString() })));
      }
      setLastUpdated(fetchedAt);
    } catch (error) {
      console.error('Farming news fetch failed:', error);
      setNews(defaultNews);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [getNews]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const value: FarmingNewsContextValue = { news, lastUpdated, loading, refresh };
  return (
    <FarmingNewsContext.Provider value={value}>
      {children}
    </FarmingNewsContext.Provider>
  );
}

export function useFarmingNews() {
  const ctx = useContext(FarmingNewsContext);
  if (!ctx) throw new Error('useFarmingNews must be used within FarmingNewsProvider');
  return ctx;
}
