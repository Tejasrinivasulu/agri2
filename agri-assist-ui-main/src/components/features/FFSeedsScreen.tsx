import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, Shield, Trophy, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface FFSeedsScreenProps {
  onBack: () => void;
}

const FFSeedsScreen: React.FC<FFSeedsScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [seeds, setSeeds] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [seedsRes, vidRes] = await Promise.all([
        supabase.from('ff_seeds').select('*'),
        supabase.from('learning_videos').select('*').eq('feature_name', 'FF Seeds'),
      ]);
      if (seedsRes.data) setSeeds(seedsRes.data);
      if (vidRes.data) setVideos(vidRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const cropEmojis: Record<string, string> = { 'Paddy': '🌾', 'Banana': '🍌', 'Cotton': '🌸', 'Tomato': '🍅', 'Turmeric': '🟡' };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl flex items-center gap-3">
        <button onClick={onBack} className="text-primary-foreground hover:opacity-80"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold text-primary-foreground">🌱 {t.ffSeeds}</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : seeds.map((seed) => (
          <div key={seed.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cropEmojis[seed.crop_type] || '🌱'}</span>
                <div>
                  <h3 className="font-bold text-foreground">{seed.seed_name}</h3>
                  <p className="text-xs text-muted-foreground">{seed.crop_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-primary">₹{seed.price_per_kg}/kg</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/30 rounded-lg p-2 text-center">
                <Shield className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium text-foreground">{t.labTested}</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-2 text-center">
                <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium text-foreground">{seed.growth_days} days</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-2 text-center">
                <p className="text-xs font-medium text-primary">{seed.refund_policy}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Available: {seed.available_states}</p>
            <Button variant="default" className="w-full" onClick={() => speak(`${seed.seed_name}, ${seed.price_per_kg} rupees per kg, ${seed.growth_days} days growth`)}>
              🛒 {t.buyNow}
            </Button>
          </div>
        ))}

        {videos.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">🎥 Learning Videos</h3>
            <div className="space-y-2">
              {videos.map((video: any) => (
                <a key={video.id} href={video.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card hover:bg-secondary/30 transition-colors">
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center"><Play className="w-5 h-5 text-destructive" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-foreground">{video.title}</p><p className="text-xs text-muted-foreground">{video.language}</p></div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FFSeedsScreen;
