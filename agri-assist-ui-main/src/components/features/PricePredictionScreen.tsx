import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Volume2, Brain, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface PricePredictionScreenProps {
  onBack: () => void;
}

const PricePredictionScreen: React.FC<PricePredictionScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak, isSpeaking } = useAIAssistant();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [predRes, vidRes] = await Promise.all([
        supabase.from('price_predictions').select('*'),
        supabase.from('learning_videos').select('*').eq('feature_name', 'Price Prediction'),
      ]);
      if (predRes.data) {
        setPredictions(predRes.data);
        if (predRes.data.length > 0) setSelectedCrop(predRes.data[0].crop_name);
      }
      if (vidRes.data) setVideos(vidRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const crops = [...new Set(predictions.map(p => p.crop_name))];
  const selected = predictions.find(p => p.crop_name === selectedCrop);
  const change = selected ? ((selected.predicted_price - selected.current_price) / selected.current_price * 100).toFixed(1) : 0;
  const trend = selected && selected.predicted_price >= selected.current_price ? 'up' : 'down';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground"><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">{t.aiPrediction} 🤖</h1>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="bg-card rounded-2xl shadow-card p-4">
              <h3 className="font-semibold text-foreground mb-3">{t.selectCrop}</h3>
              <div className="grid grid-cols-3 gap-2">
                {crops.map((crop) => (
                  <button key={crop} onClick={() => setSelectedCrop(crop)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedCrop === crop ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary hover:bg-secondary/80'}`}>
                    <span className="text-2xl mb-1">🌾</span>
                    <span className="text-xs font-medium text-center">{crop}</span>
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <div className="bg-card rounded-2xl shadow-card p-4 animate-grow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{selected.crop_name} Prediction</h3>
                  <button onClick={() => speak(`${selected.crop_name} current price ${selected.current_price}, predicted ${selected.predicted_price} rupees, confidence ${selected.confidence_percentage}%`)}
                    className="p-2 rounded-full bg-secondary"><Volume2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-xl font-bold text-foreground">₹{selected.current_price}/q</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${trend === 'up' ? 'bg-leaf-light' : 'bg-sunrise/20'}`}>
                    <p className="text-sm text-muted-foreground">Predicted Price</p>
                    <p className="text-xl font-bold text-foreground">₹{selected.predicted_price}/q</p>
                  </div>
                </div>
                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl mb-4 ${trend === 'up' ? 'bg-leaf-light' : 'bg-sunrise/20'}`}>
                  {trend === 'up' ? <TrendingUp className="w-6 h-6 text-leaf-dark" /> : <TrendingDown className="w-6 h-6 text-sunrise" />}
                  <span className={`text-lg font-bold ${trend === 'up' ? 'text-leaf-dark' : 'text-sunrise'}`}>{Number(change) > 0 ? '+' : ''}{change}%</span>
                </div>
                <div className="bg-accent/20 rounded-xl p-3 mb-4">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="font-bold text-foreground">{selected.confidence_percentage}%</p>
                </div>
                <p className="text-xs text-muted-foreground">Prediction for: {selected.prediction_date} • {selected.district}, {selected.state}</p>
              </div>
            )}
          </>
        )}

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

export default PricePredictionScreen;
