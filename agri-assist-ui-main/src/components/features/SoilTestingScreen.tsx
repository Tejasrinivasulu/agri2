import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, FlaskConical, Leaf, CheckCircle, Save, RefreshCw, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface SoilTestingScreenProps {
  onBack: () => void;
}

type Tab = 'test' | 'reports';

interface SoilReport {
  id: string;
  farmer_name: string;
  soil_type: string;
  ph_value: number;
  nitrogen_level: string;
  phosphorus_level: string;
  potassium_level: string;
  recommended_crops: string;
  district: string;
  state: string;
  created_at?: string;
}

const STORAGE_KEY = 'soil_reports_local';

const soilTypes = [
  { id: 'alluvial', name: 'Alluvial Soil', emoji: '🏞️' },
  { id: 'black', name: 'Black Soil', emoji: '⬛' },
  { id: 'red', name: 'Red Soil', emoji: '🔴' },
  { id: 'laterite', name: 'Laterite Soil', emoji: '🟤' },
  { id: 'sandy', name: 'Sandy Soil', emoji: '🏖️' },
  { id: 'clay', name: 'Clay Soil', emoji: '🪨' },
];

const npkLevels = ['Low', 'Medium', 'High', 'Very High'];

const cropRecommendations: Record<string, string[]> = {
  alluvial: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Jute', 'Maize'],
  black: ['Cotton', 'Wheat', 'Jowar', 'Groundnut', 'Soybean', 'Sunflower'],
  red: ['Groundnut', 'Millets', 'Pulses', 'Tobacco', 'Potato', 'Onion'],
  laterite: ['Tea', 'Coffee', 'Cashew', 'Rubber', 'Coconut', 'Areca'],
  sandy: ['Millets', 'Pulses', 'Sesame', 'Groundnut', 'Watermelon', 'Cucumber'],
  clay: ['Rice', 'Wheat', 'Sugarcane', 'Barley', 'Oats', 'Mustard'],
};

const getStoredReports = (): SoilReport[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredReports = (items: SoilReport[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const SAMPLE_REPORTS: SoilReport[] = [
  { id: '1', farmer_name: 'Raju Kumar', soil_type: 'alluvial', ph_value: 7.0, nitrogen_level: 'High', phosphorus_level: 'Medium', potassium_level: 'High', recommended_crops: 'Rice, Wheat, Sugarcane', district: 'Chennai', state: 'Tamil Nadu', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', farmer_name: 'Suresh Reddy', soil_type: 'black', ph_value: 7.8, nitrogen_level: 'Medium', phosphorus_level: 'High', potassium_level: 'High', recommended_crops: 'Cotton, Wheat, Groundnut', district: 'Thanjavur', state: 'Tamil Nadu', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const SoilTestingScreen: React.FC<SoilTestingScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('test');
  const [reports, setReports] = useState<SoilReport[]>(SAMPLE_REPORTS);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Form state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [farmerName, setFarmerName] = useState('');
  const [soilType, setSoilType] = useState('');
  const [phValue, setPhValue] = useState('');
  const [nitrogenLevel, setNitrogenLevel] = useState('Medium');
  const [phosphorusLevel, setPhosphorusLevel] = useState('Medium');
  const [potassiumLevel, setPotassiumLevel] = useState('Medium');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  
  const [analysis, setAnalysis] = useState<any>(null);

  const districtOptions = state ? STATES_DISTRICTS[state] ?? [] : [];

  useEffect(() => {
    if (activeTab === 'reports') {
      void loadReports();
    }
  }, [activeTab]);

  const loadReports = async () => {
    setLoadingReports(true);
    const localReports = getStoredReports();
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      const supabasePromise = supabase.from('soil_reports').select('*').order('created_at', { ascending: false });
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
      const dbReports = (data || []).map((r: any) => ({
        id: r.id,
        farmer_name: r.farmer_name,
        soil_type: r.soil_type,
        ph_value: Number(r.ph_value),
        nitrogen_level: r.nitrogen_level,
        phosphorus_level: r.phosphorus_level,
        potassium_level: r.potassium_level,
        recommended_crops: r.recommended_crops,
        district: r.district,
        state: r.state,
        created_at: r.created_at,
      }));
      const merged = [...dbReports, ...localReports.filter((l) => !dbReports.some((d) => d.id === l.id))];
      setReports(merged.length > 0 ? merged : [...SAMPLE_REPORTS, ...localReports]);
    } catch {
      const combined = localReports.length > 0 ? localReports : SAMPLE_REPORTS;
      setReports(combined);
    } finally {
      setLoadingReports(false);
    }
  };

  const analyzeSoil = () => {
    if (!soilType || !phValue) {
      setSaveError('Please select soil type and enter pH value.');
      return;
    }

    const ph = Number(phValue);
    if (ph < 0 || ph > 14) {
      setSaveError('pH value must be between 0 and 14.');
      return;
    }

    const recommendedCrops = cropRecommendations[soilType] || [];
    const soilInfo = soilTypes.find(s => s.id === soilType);
    
    let phStatus = 'Optimal';
    if (ph < 6.0) phStatus = 'Acidic - Add lime';
    else if (ph > 7.5) phStatus = 'Alkaline - Add sulfur';
    
    const analysisResult = {
      soilType: soilInfo?.name || soilType,
      phValue: ph,
      phStatus,
      nitrogenLevel,
      phosphorusLevel,
      potassiumLevel,
      recommendedCrops,
      fertilizerAdvice: getFertilizerAdvice(nitrogenLevel, phosphorusLevel, potassiumLevel),
      waterAdvice: getWaterAdvice(soilType),
    };

    setAnalysis(analysisResult);
    setSaveError(null);
  };

  const getFertilizerAdvice = (n: string, p: string, k: string): string => {
    const advice = [];
    if (n === 'Low') advice.push('Add nitrogen-rich fertilizers (Urea, Ammonium Sulfate)');
    if (p === 'Low') advice.push('Add phosphorus fertilizers (DAP, Superphosphate)');
    if (k === 'Low') advice.push('Add potassium fertilizers (Potash, MOP)');
    if (advice.length === 0) return 'NPK levels are adequate. Maintain with organic compost.';
    return advice.join('. ') + '.';
  };

  const getWaterAdvice = (type: string): string => {
    const advice: Record<string, string> = {
      alluvial: 'Good water retention. Irrigate as needed.',
      black: 'Excellent water retention. Avoid waterlogging.',
      red: 'Good drainage. Requires regular irrigation.',
      laterite: 'Poor water retention. Frequent irrigation needed.',
      sandy: 'Poor water retention. Frequent light irrigation.',
      clay: 'High water retention. Improve drainage.',
    };
    return advice[type] || 'Monitor soil moisture regularly.';
  };

  const handleSaveReport = async () => {
    if (!farmerName.trim()) {
      setSaveError('Please enter farmer name.');
      return;
    }
    if (!analysis) {
      setSaveError('Please analyze soil first.');
      return;
    }
    if (!state || !district) {
      setSaveError('Please select state and district.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    const payload = {
      farmer_name: farmerName.trim(),
      soil_type: soilType,
      ph_value: analysis.phValue,
      nitrogen_level: analysis.nitrogenLevel,
      phosphorus_level: analysis.phosphorusLevel,
      potassium_level: analysis.potassiumLevel,
      recommended_crops: analysis.recommendedCrops.join(', '),
      district,
      state,
    };

    const newReport: SoilReport = {
      id: `local-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };

    // Add immediately
    setReports(prev => [newReport, ...prev]);
    const stored = getStoredReports();
    stored.unshift(newReport);
    saveStoredReports(stored);

    // Try Supabase
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      const supabasePromise = supabase.from('soil_reports').insert([payload]);
      await Promise.race([supabasePromise, timeoutPromise]);
    } catch (err) {
      console.log('Saved to localStorage');
    }

    setSaveSuccess('✅ Soil report saved successfully!');
    setTimeout(() => {
      setActiveTab('reports');
      setTimeout(() => setSaveSuccess(null), 3000);
    }, 1000);
    setSaving(false);
  };

  const renderTestTab = () => (
    <div className="space-y-4 mt-2">
      {saveError && (
        <div className="text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 rounded-lg p-3 border border-destructive/20">
          ⚠️ {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {saveSuccess}
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Enter Soil Test Data</h3>

        <Input
          placeholder="Farmer Name *"
          className="bg-card/90 border-0 min-h-[44px]"
          value={farmerName}
          onChange={(e) => setFarmerName(e.target.value)}
        />

        <Select value={soilType} onValueChange={setSoilType}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder="Select Soil Type *" />
          </SelectTrigger>
          <SelectContent>
            {soilTypes.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="0"
          max="14"
          step="0.1"
          placeholder="pH Value (0-14) *"
          className="bg-card/90 border-0 min-h-[44px]"
          value={phValue}
          onChange={(e) => setPhValue(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-2">
          <Select value={nitrogenLevel} onValueChange={setNitrogenLevel}>
            <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
              <SelectValue placeholder="N" />
            </SelectTrigger>
            <SelectContent>
              {npkLevels.map((l) => <SelectItem key={l} value={l}>N: {l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={phosphorusLevel} onValueChange={setPhosphorusLevel}>
            <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
              <SelectValue placeholder="P" />
            </SelectTrigger>
            <SelectContent>
              {npkLevels.map((l) => <SelectItem key={l} value={l}>P: {l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={potassiumLevel} onValueChange={setPotassiumLevel}>
            <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
              <SelectValue placeholder="K" />
            </SelectTrigger>
            <SelectContent>
              {npkLevels.map((l) => <SelectItem key={l} value={l}>K: {l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Select value={state || undefined} onValueChange={(val) => { setState(val === "all" ? "" : val); setDistrict(''); }}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder="Select State *" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any State</SelectItem>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={district || undefined} onValueChange={(val) => setDistrict(val === "all" ? "" : val)} disabled={!state || districtOptions.length === 0}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder={state ? 'Select District *' : 'Select State first'} />
          </SelectTrigger>
          <SelectContent>
            {districtOptions.length > 0 ? districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>) : <SelectItem value="none" disabled>No districts available</SelectItem>}
          </SelectContent>
        </Select>

        <Button className="w-full min-h-[44px] text-base font-semibold" onClick={analyzeSoil}>
          <FlaskConical className="w-4 h-4 mr-2" />
          Analyze Soil
        </Button>
      </div>

      {analysis && (
        <div className="bg-card rounded-2xl shadow-card p-4 space-y-4 animate-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Soil Analysis Results</h3>
            <Button size="sm" onClick={handleSaveReport} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Saving...' : 'Save Report'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">pH Level</p>
              <p className="font-bold text-foreground text-lg">{analysis.phValue}</p>
              <p className="text-xs text-muted-foreground">{analysis.phStatus}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Soil Type</p>
              <p className="font-bold text-foreground">{analysis.soilType}</p>
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-2">NPK Levels</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">N: {analysis.nitrogenLevel}</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">P: {analysis.phosphorusLevel}</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">K: {analysis.potassiumLevel}</span>
            </div>
          </div>

          <div className="bg-leaf-light rounded-xl p-4">
            <p className="text-sm font-medium text-leaf-dark mb-2">🌾 Recommended Crops</p>
            <div className="flex flex-wrap gap-2">
              {analysis.recommendedCrops.map((crop: string) => (
                <span key={crop} className="px-3 py-1 bg-card rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-leaf-medium" />
                  {crop}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-accent/20 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-1">💡 Fertilizer Advice</p>
            <p className="text-sm text-muted-foreground">{analysis.fertilizerAdvice}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-1">💧 Water Management</p>
            <p className="text-sm text-muted-foreground">{analysis.waterAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-3 mt-2">
      {loadingReports && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="text-4xl mb-3">🧪</div>
          <p className="text-sm font-medium text-foreground mb-1">No soil reports found</p>
          <p className="text-xs text-muted-foreground">Create your first soil test report!</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{report.farmer_name}</h3>
                <p className="text-xs text-muted-foreground">
                  📍 {report.district}, {report.state}
                  {report.created_at && <span className="ml-2">• {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </p>
              </div>
              <span className="text-2xl">{soilTypes.find(s => s.id === report.soil_type)?.emoji || '🌱'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary rounded-lg p-2">
                <p className="text-xs text-muted-foreground">pH Value</p>
                <p className="font-bold text-foreground">{report.ph_value}</p>
              </div>
              <div className="bg-secondary rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Soil Type</p>
                <p className="font-bold text-foreground">{soilTypes.find(s => s.id === report.soil_type)?.name || report.soil_type}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">N: {report.nitrogen_level}</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">P: {report.phosphorus_level}</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">K: {report.potassium_level}</span>
            </div>

            <div className="bg-leaf-light rounded-lg p-3">
              <p className="text-xs font-medium text-leaf-dark mb-1">Recommended Crops</p>
              <p className="text-sm text-leaf-dark">{report.recommended_crops}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">{t.soilTesting || 'Soil Test'} 🧪</h1>
            <p className="text-sm text-primary-foreground/80">Test soil and get crop recommendations</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            variant={activeTab === 'test' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'test' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('test')}
          >
            🧪 Test Soil
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'reports' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('reports')}
          >
            📋 Reports
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'test' ? renderTestTab() : renderReportsTab()}
      </div>
    </div>
  );
};

export default SoilTestingScreen;
