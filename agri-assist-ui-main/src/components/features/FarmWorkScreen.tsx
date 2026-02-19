import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, MessageCircle, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface FarmWorkScreenProps {
  onBack: () => void;
}

const FarmWorkScreen: React.FC<FarmWorkScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [jobs, setJobs] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [jobsRes, vidRes] = await Promise.all([
        supabase.from('farm_jobs').select('*'),
        supabase.from('learning_videos').select('*').eq('feature_name', 'Farm Work'),
      ]);
      if (jobsRes.data) setJobs(jobsRes.data);
      if (vidRes.data) setVideos(vidRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const workTypes = [...new Set(jobs.map(j => j.work_type))];
  const filtered = selectedType ? jobs.filter(j => j.work_type === selectedType) : jobs;

  const workEmojis: Record<string, string> = { 'Harvesting': '🌾', 'Irrigation Work': '💧', 'Pesticide Spray': '💨', 'Weeding': '🪴', 'Ploughing': '🚜' };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl flex items-center gap-3">
        <button onClick={onBack} className="text-primary-foreground hover:opacity-80"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold text-primary-foreground">💼 {t.farmWork}</h1>
      </div>

      <div className="px-4 py-4">
        <label className="block text-sm font-medium text-foreground mb-3">{t.workType}</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setSelectedType('')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedType === '' ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-input text-foreground'}`}>{t.allTypes}</button>
          {workTypes.map(type => (
            <button key={type} onClick={() => setSelectedType(type)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedType === type ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-input text-foreground'}`}>
              {workEmojis[type] || '🔧'} {type}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.map((work) => (
          <div key={work.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{workEmojis[work.work_type] || '🔧'}</span>
                  <h3 className="font-bold text-lg text-foreground">{work.work_type}</h3>
                </div>
                <p className="font-semibold text-foreground">{work.owner_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1"><MapPin className="w-4 h-4" />{work.location}, {work.state}</div>
              </div>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t.dailyWage}</p>
              <p className="font-bold text-lg text-primary">₹{work.wage_per_day}/day</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="default" size="sm" className="flex-1" onClick={() => speak(`${work.work_type} work by ${work.owner_name}, wage ${work.wage_per_day} rupees per day`)}>
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

export default FarmWorkScreen;
