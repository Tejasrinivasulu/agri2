import React, { useState } from 'react';
import { ArrowLeft, Volume2, Calculator as CalcIcon, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';

interface CalculatorScreenProps {
  onBack: () => void;
}

type CalcTab = 'interest' | 'fertilizer' | 'yield' | 'profit';

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [activeTab, setActiveTab] = useState<CalcTab>('interest');

  // Interest
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [interestResult, setInterestResult] = useState<{ interest: number; total: number } | null>(null);

  // Fertilizer
  const [areaAcres, setAreaAcres] = useState('');
  const [dosePerAcre, setDosePerAcre] = useState('');
  const [fertilizerResult, setFertilizerResult] = useState<number | null>(null);

  // Yield
  const [yieldArea, setYieldArea] = useState('');
  const [yieldPerAcre, setYieldPerAcre] = useState('');
  const [yieldResult, setYieldResult] = useState<number | null>(null);

  // Profit
  const [revenue, setRevenue] = useState('');
  const [cost, setCost] = useState('');
  const [profitResult, setProfitResult] = useState<{ profit: number; margin: number } | null>(null);

  const calcInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const n = parseFloat(time);
    if (p > 0 && r >= 0 && n > 0) {
      const interest = (p * r * n) / 100;
      setInterestResult({ interest, total: p + interest });
    } else setInterestResult(null);
  };

  const calcFertilizer = () => {
    const area = parseFloat(areaAcres);
    const dose = parseFloat(dosePerAcre);
    if (area > 0 && dose >= 0) {
      setFertilizerResult(area * dose);
    } else setFertilizerResult(null);
  };

  const calcYield = () => {
    const area = parseFloat(yieldArea);
    const y = parseFloat(yieldPerAcre);
    if (area > 0 && y >= 0) {
      setYieldResult(area * y);
    } else setYieldResult(null);
  };

  const calcProfit = () => {
    const rev = parseFloat(revenue);
    const c = parseFloat(cost);
    if (rev >= 0 && c >= 0) {
      const profit = rev - c;
      const margin = rev > 0 ? (profit / rev) * 100 : 0;
      setProfitResult({ profit, margin });
    } else setProfitResult(null);
  };

  const speakResult = () => {
    if (activeTab === 'interest' && interestResult) {
      speak(`${t.principal}: ₹${principal}. ${t.interestRate}: ${rate}%. ${t.time}: ${time} years. Total interest: ₹${interestResult.interest.toLocaleString()}. Total amount: ₹${interestResult.total.toLocaleString()}`);
    }
    if (activeTab === 'fertilizer' && fertilizerResult !== null) {
      speak(`Total fertilizer needed: ${fertilizerResult.toLocaleString()} kg for ${areaAcres} acres at ${dosePerAcre} kg per acre.`);
    }
    if (activeTab === 'yield' && yieldResult !== null) {
      speak(`Total yield: ${yieldResult.toLocaleString()} kg for ${yieldArea} acres at ${yieldPerAcre} kg per acre.`);
    }
    if (activeTab === 'profit' && profitResult) {
      speak(`Profit: ₹${profitResult.profit.toLocaleString()}. Margin: ${profitResult.margin.toFixed(1)} percent.`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">{t.calculator || 'Calculator'} 🧮</h1>
            <p className="text-sm text-primary-foreground/80">Interest, fertilizer, yield, profit</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['interest', 'fertilizer', 'yield', 'profit'] as CalcTab[]).map((tab) => (
            <Button key={tab} variant={activeTab === tab ? 'secondary' : 'ghost'} className={`flex-shrink-0 min-h-[40px] capitalize ${activeTab === tab ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setActiveTab(tab)}>
              {tab === 'interest' ? '💰 Interest' : tab === 'fertilizer' ? '🧪 Fertilizer' : tab === 'yield' ? '🌾 Yield' : '📈 Profit'}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {activeTab === 'interest' && (
          <div className="bg-card rounded-2xl shadow-card p-4 space-y-4">
            <h3 className="font-semibold text-foreground">{t.calculateInterest || 'Simple interest'}</h3>
            <div>
              <label className="text-sm text-muted-foreground">{t.principal} (₹)</label>
              <Input type="number" min="0" step="1000" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="100000" className="mt-1 min-h-[44px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t.rate} (%)</label>
              <Input type="number" min="0" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="12" className="mt-1 min-h-[44px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t.time} (Years)</label>
              <Input type="number" min="0" step="0.5" value={time} onChange={(e) => setTime(e.target.value)} placeholder="1" className="mt-1 min-h-[44px]" />
            </div>
            <Button onClick={calcInterest} className="w-full min-h-[44px]">Calculate</Button>
            {interestResult && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-sm text-muted-foreground">{t.interest}</p>
                  <p className="text-xl font-bold text-primary flex items-center justify-center gap-0.5"><IndianRupee className="w-4 h-4" />{interestResult.interest.toLocaleString()}</p>
                </div>
                <div className="bg-leaf-light rounded-xl p-3 text-center">
                  <p className="text-sm text-muted-foreground">{t.totalAmount}</p>
                  <p className="text-xl font-bold text-leaf-dark flex items-center justify-center gap-0.5"><IndianRupee className="w-4 h-4" />{interestResult.total.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fertilizer' && (
          <div className="bg-card rounded-2xl shadow-card p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Fertilizer quantity</h3>
            <div>
              <label className="text-sm text-muted-foreground">Area (acres)</label>
              <Input type="number" min="0" step="0.1" value={areaAcres} onChange={(e) => setAreaAcres(e.target.value)} placeholder="5" className="mt-1 min-h-[44px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Dose per acre (kg)</label>
              <Input type="number" min="0" step="1" value={dosePerAcre} onChange={(e) => setDosePerAcre(e.target.value)} placeholder="50" className="mt-1 min-h-[44px]" />
            </div>
            <Button onClick={calcFertilizer} className="w-full min-h-[44px]">Calculate</Button>
            {fertilizerResult !== null && (
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Total fertilizer needed</p>
                <p className="text-2xl font-bold text-primary">{fertilizerResult.toLocaleString()} kg</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'yield' && (
          <div className="bg-card rounded-2xl shadow-card p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Total yield</h3>
            <div>
              <label className="text-sm text-muted-foreground">Area (acres)</label>
              <Input type="number" min="0" step="0.1" value={yieldArea} onChange={(e) => setYieldArea(e.target.value)} placeholder="5" className="mt-1 min-h-[44px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Yield per acre (kg)</label>
              <Input type="number" min="0" step="1" value={yieldPerAcre} onChange={(e) => setYieldPerAcre(e.target.value)} placeholder="2000" className="mt-1 min-h-[44px]" />
            </div>
            <Button onClick={calcYield} className="w-full min-h-[44px]">Calculate</Button>
            {yieldResult !== null && (
              <div className="bg-leaf-light rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Total yield</p>
                <p className="text-2xl font-bold text-leaf-dark">{yieldResult.toLocaleString()} kg</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="bg-card rounded-2xl shadow-card p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Profit & margin</h3>
            <div>
              <label className="text-sm text-muted-foreground">Total revenue (₹)</label>
              <Input type="number" min="0" step="100" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="100000" className="mt-1 min-h-[44px]" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Total cost (₹)</label>
              <Input type="number" min="0" step="100" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="60000" className="mt-1 min-h-[44px]" />
            </div>
            <Button onClick={calcProfit} className="w-full min-h-[44px]">Calculate</Button>
            {profitResult && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-primary/10 rounded-xl p-3 text-center">
                  <p className="text-sm text-muted-foreground">Profit</p>
                  <p className="text-xl font-bold text-primary flex items-center justify-center gap-0.5"><IndianRupee className="w-4 h-4" />{profitResult.profit.toLocaleString()}</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-sm text-muted-foreground">Margin %</p>
                  <p className="text-xl font-bold text-foreground">{profitResult.margin.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>
        )}

        {(interestResult || fertilizerResult !== null || yieldResult !== null || profitResult) && (
          <Button variant="outline" className="w-full" onClick={speakResult}>
            <Volume2 className="w-4 h-4 mr-2" /> Hear result
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalculatorScreen;
