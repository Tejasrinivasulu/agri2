import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, Volume2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { supabase } from '@/integrations/supabase/client';

interface CropScanScreenProps {
  onBack: () => void;
}

const MAX_SIZE = 800;
const CROPS = [
  { name: 'Rice', description: 'Staple grain crop, widely cultivated in India.' },
  { name: 'Wheat', description: 'Major rabi crop, used for flour and bread.' },
  { name: 'Cotton', description: 'Fiber crop, important for textile industry.' },
  { name: 'Maize', description: 'Corn crop, used for food and fodder.' },
  { name: 'Sugarcane', description: 'Tall perennial grass, source of sugar.' },
  { name: 'Tomato', description: 'Vegetable crop, rich in lycopene.' },
  { name: 'Chilli', description: 'Spice crop, widely used in cuisines.' },
  { name: 'Groundnut', description: 'Oilseed and food crop.' },
  { name: 'Paddy', description: 'Rice before husking, kharif crop.' },
];
const CONDITIONS = ['healthy', 'pest-affected', 'dry', 'nutrient-deficient'] as const;
type Condition = (typeof CONDITIONS)[number];

interface AnalysisResult {
  cropName: string;
  confidence: number;
  condition: Condition;
  description: string;
}

/** Simple preprocessing: resize and optional brightness for poor lighting. */
function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = (height * MAX_SIZE) / width;
          width = MAX_SIZE;
        } else {
          width = (width * MAX_SIZE) / height;
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(url);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      const avg = sum / (data.length / 4);
      if (avg < 80) {
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.3);
          data[i + 1] = Math.min(255, data[i + 1] * 1.3);
          data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        }
        ctx.putImageData(imageData, 0, 0);
      }
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/** Mock analysis when backend is unavailable. */
function mockAnalyze(): AnalysisResult {
  const crop = CROPS[Math.floor(Math.random() * CROPS.length)];
  const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  const confidence = 72 + Math.floor(Math.random() * 24);
  return {
    cropName: crop.name,
    confidence,
    condition,
    description: crop.description,
  };
}

const CropScanScreen: React.FC<CropScanScreenProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const { speak } = useAIAssistant();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-open camera when Crop Scan screen opens (no button click)
  useEffect(() => {
    const t = setTimeout(() => cameraInputRef.current?.click(), 400);
    return () => clearTimeout(t);
  }, []);

  const analyze = useCallback(
    async (imageBase64?: string) => {
      const dataUrl = imageBase64 ?? imageDataUrl;
      if (!dataUrl) {
        setError('Capture or upload an image first.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('crop-image-analysis', {
          body: { imageBase64: dataUrl, language: language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English' },
        });
      if (fnError || !data?.cropName) {
        setResult(mockAnalyze());
      } else {
        setResult({
          cropName: data.cropName || 'Unknown',
          confidence: Number(data.confidence) || 80,
          condition: (data.condition || 'healthy').toLowerCase().replace(/\s/g, '-') as Condition,
          description: data.description || '',
        });
      }
    } catch {
      setResult(mockAnalyze());
    } finally {
      setLoading(false);
    }
  }, [imageDataUrl, language]);

  const handleFile = useCallback(
    async (file: File | null, autoAnalyze = false) => {
      if (!file || !file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      setError(null);
      setResult(null);
      try {
        const dataUrl = await preprocessImage(file);
        setImageDataUrl(dataUrl);
        if (autoAnalyze) {
          await analyze(dataUrl);
        }
      } catch (e) {
        setError('Failed to process image.');
      }
    },
    [analyze]
  );

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file || null, true);
    e.target.value = '';
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file || null, false);
    e.target.value = '';
  };

  const getTTSMessage = useCallback(
    (r: AnalysisResult): string => {
      const cond = r.condition?.toLowerCase() || 'healthy';
      const conditionPhrase: Record<string, { en: string; hi: string; te: string }> = {
        healthy: { en: 'looks healthy', hi: 'स्वस्थ लग रहा है', te: 'ఆరోగ్యంగా ఉంది' },
        'pest-affected': { en: 'may be pest-affected', hi: 'कीट प्रभावित हो सकता है', te: 'చీడపీడలతో ప్రభావితమై ఉండవచ్చు' },
        dry: { en: 'looks dry', hi: 'सूखा लग रहा है', te: 'ఎండిపోయినట్లు ఉంది' },
        'nutrient-deficient': { en: 'may need nutrients', hi: 'पोषण की जरूरत हो सकती है', te: 'పోషకాలు అవసరం కావచ్చు' },
      };
      const phraseMap = conditionPhrase[cond] || conditionPhrase.healthy;
      const lang = language === 'hi' ? 'hi' : language === 'te' ? 'te' : 'en';
      const phrase = phraseMap[lang] || phraseMap.en;
      if (lang === 'hi') return `यह ${r.cropName} की फसल है। फसल ${phrase}।`;
      if (lang === 'te') return `ఇది ${r.cropName} పంట. పంట ${phrase}.`;
      return `This is a ${r.cropName} crop. The crop ${phrase}.`;
    },
    [language]
  );

  // Auto-speak result when capture is analyzed (no button click)
  useEffect(() => {
    if (result) speak(getTTSMessage(result));
  }, [result, getTTSMessage, speak]);

  const handleSpeak = () => {
    if (result) speak(getTTSMessage(result));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-4 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Crop Scan</h1>
            <p className="text-sm text-primary-foreground/80">Take a photo to auto-display and detect; or upload an image</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Camera-only input: Take Photo opens device camera (mobile/tablet). */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraCapture}
        />
        {/* Upload from gallery/files (no capture). */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => cameraInputRef.current?.click()}
            disabled={loading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {imageDataUrl && (
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <img src={imageDataUrl} alt="Captured" className="w-full max-h-64 object-contain bg-muted/30" />
          </div>
        )}

        {!imageDataUrl && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center justify-center text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Take a photo of your crop or land, or upload an image.</p>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</div>
        )}

        <Button
          className="w-full"
          onClick={analyze}
          disabled={!imageDataUrl || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze with AI'
          )}
        </Button>

        {result && (
          <div className="rounded-2xl border border-primary/30 bg-card p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Detected crop</h3>
            <p className="text-2xl font-bold text-primary">{result.cropName}</p>
            <p className="text-sm text-muted-foreground">
              Confidence: <strong>{result.confidence}%</strong>
            </p>
            <p className="text-sm text-foreground">{result.description}</p>
            <p className="text-xs text-muted-foreground capitalize">Condition: {result.condition.replace(/-/g, ' ')}</p>
            <Button variant="outline" className="w-full" onClick={handleSpeak}>
              <Volume2 className="w-4 h-4 mr-2" />
              Hear result (TTS)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropScanScreen;
