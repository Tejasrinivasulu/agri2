import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Search, Volume2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface FarmerGuideScreenProps {
  onBack: () => void;
}

interface Guide {
  id: string;
  category: string;
  title: string;
  content_summary: string;
  language: string;
  steps?: string[];
  created_at?: string;
}

const CATEGORY_EMOJIS: Record<string, string> = { Crop: '🌾', Animal: '🐄', Soil: '🌱', Pest: '🐛', Water: '💧', Marketing: '📈', Other: '📖' };

const SAMPLE_GUIDES: Guide[] = [
  { id: '1', category: 'Crop', title: 'Paddy cultivation step-by-step', content_summary: 'Prepare land with puddling. Use certified seeds at 40 kg/acre. Transplant 25-day seedlings. Maintain 2-3 cm water. Apply nitrogen in splits. Control weeds and pests. Harvest at 80% grain maturity.', language: 'English', steps: ['Land preparation', 'Seed selection', 'Transplanting', 'Water management', 'Fertilizer application', 'Harvesting'] },
  { id: '2', category: 'Soil', title: 'Improving soil fertility', content_summary: 'Add organic manure and compost. Practice crop rotation. Use green manure crops. Test soil every 2-3 years. Maintain pH between 6-7.5 for most crops.', language: 'English', steps: ['Soil testing', 'Organic matter', 'Crop rotation', 'pH management'] },
  { id: '3', category: 'Animal', title: 'Dairy cattle care basics', content_summary: 'Provide clean water and balanced feed. Vaccinate as per schedule. Maintain clean shelter. Regular health check-ups. Proper milking hygiene.', language: 'English', steps: ['Feeding', 'Vaccination', 'Shelter', 'Health checks'] },
  { id: '4', category: 'Pest', title: 'Natural pest control', content_summary: 'Use neem-based sprays. Encourage beneficial insects. Practice intercropping. Remove infected plants. Keep field borders clean.', language: 'English', steps: ['Neem spray', 'Beneficial insects', 'Intercropping'] },
  { id: '5', category: 'Water', title: 'Drip irrigation benefits', content_summary: 'Saves 30-50% water. Reduces weeds. Better nutrient delivery. Suitable for vegetables and orchards. Initial cost is offset by yield increase.', language: 'English', steps: ['Design', 'Installation', 'Scheduling', 'Maintenance'] },
];

const FarmerGuideScreen: React.FC<FarmerGuideScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>(SAMPLE_GUIDES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterLang, setFilterLang] = useState<string>('');

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 5000));
      const { data, error } = await Promise.race([supabase.from('farmer_guides').select('*'), timeout]) as { data: any[]; error: any };
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        category: r.category,
        title: r.title,
        content_summary: r.content_summary,
        language: r.language,
        steps: r.steps,
        created_at: r.created_at,
      }));
      setGuides(mapped.length ? mapped : SAMPLE_GUIDES);
    } catch {
      setGuides(SAMPLE_GUIDES);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      if (filterCategory && g.category !== filterCategory) return false;
      if (filterLang && g.language !== filterLang) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return g.title.toLowerCase().includes(q) || g.content_summary.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [guides, filterCategory, filterLang, searchQuery]);

  const categories = Array.from(new Set(guides.map((g) => g.category)));
  const languages = Array.from(new Set(guides.map((g) => g.language)));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">📖 {t.farmerGuide || 'Farmer Guide'}</h1>
            <p className="text-sm text-primary-foreground/80">Step-by-step farming guidance</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => loadGuides()} disabled={loading} className="text-primary-foreground border-primary-foreground/30">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search guides..." className="pl-10 bg-card/90 border-0 min-h-[44px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setFilterCategory('')} className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium ${!filterCategory ? 'bg-card text-foreground' : 'bg-primary-foreground/20 text-primary-foreground'}`}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilterCategory(c)} className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${filterCategory === c ? 'bg-card text-foreground' : 'bg-primary-foreground/20 text-primary-foreground'}`}>
              {CATEGORY_EMOJIS[c] || '📖'} {c}
            </button>
          ))}
        </div>
        {languages.length > 1 && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => setFilterLang('')} className={`text-xs px-2 py-1 rounded ${!filterLang ? 'bg-card text-foreground' : 'text-primary-foreground'}`}>All</button>
            {languages.map((l) => (
              <button key={l} onClick={() => setFilterLang(l)} className={`text-xs px-2 py-1 rounded ${filterLang === l ? 'bg-card text-foreground' : 'text-primary-foreground'}`}>{l}</button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading && guides.length === 0 ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No guides found.</div>
        ) : (
          filteredGuides.map((guide) => (
            <div key={guide.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === guide.id ? null : guide.id)} className="w-full p-4 flex items-start justify-between hover:bg-secondary/20 transition-colors text-left">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{CATEGORY_EMOJIS[guide.category] || '📖'}</span>
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase">{guide.category}</p>
                    <h3 className="font-bold text-foreground">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground">{guide.language}</p>
                  </div>
                </div>
                {expandedId === guide.id ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
              </button>
              {expandedId === guide.id && (
                <div className="px-4 pb-4 border-t border-border space-y-4">
                  <p className="text-foreground text-sm leading-relaxed pt-3">{guide.content_summary}</p>
                  {guide.steps && guide.steps.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Steps</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {guide.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(guide.content_summary))}>
                    <Volume2 className="w-4 h-4 mr-2" /> {t.hearGuide || 'Hear guide'}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FarmerGuideScreen;
