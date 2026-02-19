import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface AgriInvestScreenProps {
  onBack: () => void;
}

const AgriInvestScreen: React.FC<AgriInvestScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [investments, setInvestments] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [invRes, vidRes] = await Promise.all([
        supabase.from('agri_investments').select('*'),
        supabase.from('learning_videos').select('*').eq('feature_name', 'Agri Invest'),
      ]);
      if (invRes.data) setInvestments(invRes.data);
      if (vidRes.data) setVideos(vidRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl flex items-center gap-3">
        <button onClick={onBack} className="text-primary-foreground hover:opacity-80"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold text-primary-foreground">🤝 {t.agriInvest}</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : investments.map((inv) => (
          <div key={inv.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">{inv.farmer_name}</h3>
                <p className="text-sm text-muted-foreground">👨‍🌾 {t.seekingInvestment}</p>
              </div>
              <span className="text-2xl">🌾</span>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t.acres}:</span><span className="font-bold text-foreground">{inv.land_available}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t.requiredInvestment}:</span><span className="font-bold text-primary">₹{Number(inv.investor_required_amount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t.profitSharing}:</span><span className="font-bold text-foreground">{inv.profit_share_percentage}%</span></div>
            </div>
            <p className="text-sm text-muted-foreground">{inv.district}, {inv.state}</p>
            <div className="flex gap-2 pt-2">
              <Button variant="default" size="sm" className="flex-1" onClick={() => speak(`${inv.farmer_name}, ${inv.land_available}, needs ${inv.investor_required_amount} rupees investment`)}>
                <Phone className="w-4 h-4 mr-2" />{t.call}
              </Button>
              <Button variant="outline" size="sm" className="flex-1"><MessageCircle className="w-4 h-4 mr-2" />{t.message}</Button>
            </div>
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

export default AgriInvestScreen;
