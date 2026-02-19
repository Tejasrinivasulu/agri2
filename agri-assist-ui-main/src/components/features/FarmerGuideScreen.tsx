import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface FarmerGuideScreenProps {
  onBack: () => void;
}

const FarmerGuideScreen: React.FC<FarmerGuideScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [guides, setGuides] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryEmojis: Record<string, string> = { 'Crop': '🌾', 'Animal': '🐄', 'Soil': '🌱' };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [guideRes, vidRes] = await Promise.all([
        supabase.from('farmer_guides').select('*'),
        supabase.from('learning_videos').select('*').eq('feature_name', 'Farmer Guide'),
      ]);
      if (guideRes.data) setGuides(guideRes.data);
      if (vidRes.data) setVideos(vidRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl flex items-center gap-3">
        <button onClick={onBack} className="text-primary-foreground hover:opacity-80"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold text-primary-foreground">📖 {t.farmerGuide}</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : guides.map(guide => (
          <div key={guide.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <button onClick={() => setExpandedId(expandedId === guide.id ? null : guide.id)} className="w-full p-4 flex items-start justify-between hover:bg-secondary/20 transition-colors">
              <div className="flex items-start gap-3 flex-1 text-left">
                <span className="text-2xl">{categoryEmojis[guide.category] || '📖'}</span>
                <div>
                  <p className="text-xs font-semibold text-primary uppercase">{guide.category}</p>
                  <h3 className="font-bold text-foreground">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground">{guide.language}</p>
                </div>
              </div>
              {expandedId === guide.id ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            {expandedId === guide.id && (
              <div className="px-4 pb-4 border-t border-border space-y-4">
                <p className="text-foreground text-sm leading-relaxed">{guide.content_summary}</p>
                <Button variant="default" className="w-full" onClick={() => speak(guide.content_summary)}>
                  🔊 {t.hearGuide}
                </Button>
              </div>
            )}
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

export default FarmerGuideScreen;
