import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Users, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface WeekendFarmingScreenProps {
  onBack: () => void;
}

const WeekendFarmingScreen: React.FC<WeekendFarmingScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [sessions, setSessions] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [sessRes, vidRes] = await Promise.all([
        supabase.from('weekend_sessions').select('*'),
        supabase.from('learning_videos').select('*').eq('feature_name', 'Weekend Farming'),
      ]);
      if (sessRes.data) setSessions(sessRes.data);
      if (vidRes.data) setVideos(vidRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleBook = (id: string) => {
    setBooked(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl flex items-center gap-3">
        <button onClick={onBack} className="text-primary-foreground hover:opacity-80"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold text-primary-foreground">🌻 {t.weekendFarming}</h1>
      </div>

      {booked.length > 0 && (
        <div className="mx-4 mt-4 bg-leaf-light/50 border-l-4 border-leaf-medium p-4 rounded-lg">
          <p className="font-semibold text-leaf-dark">✓ {booked.length} {t.bookedSessions}</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : sessions.map(session => (
          <div key={session.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 flex items-start justify-between">
              <div className="flex gap-3">
                <span className="text-3xl">🌿</span>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{session.session_name}</h3>
                  <p className="text-sm text-muted-foreground">{session.state}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">₹{session.fee}</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4 text-primary" />{session.duration_days} day(s)</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 text-primary" />{session.location}</div>
              <div className="flex gap-2 pt-2">
                <Button variant={booked.includes(session.id) ? 'default' : 'outline'} className="flex-1" onClick={() => handleBook(session.id)}>
                  {booked.includes(session.id) ? `✓ ${t.booked}` : `🎫 ${t.bookNow}`}
                </Button>
                <Button variant="ghost" size="sm" className="px-4" onClick={() => speak(`${session.session_name}, ${session.location}, ${session.fee} rupees`)}>🔊</Button>
              </div>
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

export default WeekendFarmingScreen;
