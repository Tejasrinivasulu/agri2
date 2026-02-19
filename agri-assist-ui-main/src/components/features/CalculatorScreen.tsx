import React, { useState } from 'react';
import { ArrowLeft, Volume2, Calculator as CalcIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';

interface CalculatorScreenProps {
  onBack: () => void;
}

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { speak } = useAIAssistant();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState<{ interest: number; total: number } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const n = parseFloat(time);
    if (p && r && n) {
      const interest = (p * r * n) / 100;
      setResult({ interest, total: p + interest });
    }
  };

  const speakResult = () => {
    if (result) {
      speak(`${t.principal}: ₹${principal}. ${t.interestRate}: ${rate}%. ${t.time}: ${time} years. Total interest: ₹${result.interest}. Total amount: ₹${result.total}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <CalcIcon className="w-6 h-6 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">{t.calculator} 🧮</h1>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="bg-card rounded-2xl shadow-card p-4 space-y-4">
          <h3 className="font-semibold text-foreground">{t.calculateInterest}</h3>
          
          <div>
            <label className="text-sm text-muted-foreground">{t.principal} (₹)</label>
            <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="100000" className="mt-1" />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">{t.rate} (%)</label>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="12" className="mt-1" />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground">{t.time} (Years)</label>
            <Input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="1" className="mt-1" />
          </div>

          <Button onClick={calculate} className="w-full">{t.calculateInterest}</Button>
        </div>

        {result && (
          <div className="bg-card rounded-2xl shadow-card p-4 animate-grow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{t.result}</h3>
              <button onClick={speakResult} className="p-2 rounded-full bg-secondary">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-xl p-3 text-center">
                 <p className="text-sm text-muted-foreground">{t.interest}</p>
                <p className="text-xl font-bold text-primary">₹{result.interest.toLocaleString()}</p>
              </div>
              <div className="bg-leaf-light rounded-xl p-3 text-center">
                 <p className="text-sm text-muted-foreground">{t.totalAmount}</p>
                <p className="text-xl font-bold text-leaf-dark">₹{result.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorScreen;
