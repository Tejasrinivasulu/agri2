import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, BookOpen, Video, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface FarmingClassesScreenProps {
  onBack: () => void;
}

const FarmingClassesScreen: React.FC<FarmingClassesScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [classType, setClassType] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [classRes, vidRes] = await Promise.all([
        supabase.from('farming_classes').select('*'),
        supabase.from('learning_videos').select('*').eq('feature_name', 'Farming Classes'),
      ]);
      if (classRes.data) setClasses(classRes.data);
      if (vidRes.data) setVideos(vidRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = classType ? classes.filter(c => c.mode === classType) : classes;

  const handleEnroll = (id: string) => {
    setEnrolled(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl flex items-center gap-3">
        <button onClick={onBack} className="text-primary-foreground hover:opacity-80"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold text-primary-foreground">🎓 {t.farmingClasses}</h1>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-2">
          <button onClick={() => setClassType('')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${classType === '' ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-input text-foreground'}`}>{t.allClasses}</button>
          <button onClick={() => setClassType('Online')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${classType === 'Online' ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-input text-foreground'}`}>{t.onlineClasses}</button>
          <button onClick={() => setClassType('Offline')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${classType === 'Offline' ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-input text-foreground'}`}>{t.offlineClasses}</button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.map(course => (
          <div key={course.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-2">
                  <span className="text-2xl">{course.mode === 'Online' ? '🖥️' : '🌾'}</span>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{course.class_name}</h3>
                    <p className="text-xs text-muted-foreground">{course.mode}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary">₹{course.fees}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="w-4 h-4 text-primary" />{course.duration}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 text-primary" />{course.district}, {course.state}</div>
              <div className="flex gap-2 pt-2">
                <Button variant={enrolled.includes(course.id) ? 'default' : 'outline'} className="flex-1" onClick={() => handleEnroll(course.id)}>
                  {enrolled.includes(course.id) ? `✓ ${t.enrolled}` : t.enrollNow}
                </Button>
                <Button variant="ghost" size="sm" className="px-4" onClick={() => speak(`${course.class_name}, ${course.mode}, ${course.fees} rupees`)}>🔊</Button>
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

export default FarmingClassesScreen;
