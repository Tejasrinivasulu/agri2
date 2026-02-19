import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Landmark, Search, RefreshCw, Phone, Calculator, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS } from '@/data/cropRates';

interface LoanAssistanceScreenProps {
  onBack: () => void;
}

type Tab = 'browse' | 'calculator' | 'apply';

interface Loan {
  id: string;
  bank_name: string;
  loan_type: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  state: string;
  contact_number: string;
  created_at?: string;
}

const SAMPLE_LOANS: Loan[] = [
  { id: '1', bank_name: 'State Bank of India', loan_type: 'Kisan Credit Card', interest_rate: 4.0, min_amount: 10000, max_amount: 300000, state: 'Tamil Nadu', contact_number: '9876543210', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', bank_name: 'HDFC Bank', loan_type: 'Agricultural Loan', interest_rate: 7.5, min_amount: 50000, max_amount: 1000000, state: 'Tamil Nadu', contact_number: '9876543211', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', bank_name: 'ICICI Bank', loan_type: 'Crop Loan', interest_rate: 6.0, min_amount: 25000, max_amount: 500000, state: 'All States', contact_number: '9876543212', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', bank_name: 'Axis Bank', loan_type: 'Farm Equipment Loan', interest_rate: 8.0, min_amount: 100000, max_amount: 2000000, state: 'Tamil Nadu', contact_number: '9876543213', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const LoanAssistanceScreen: React.FC<LoanAssistanceScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [loans, setLoans] = useState<Loan[]>(SAMPLE_LOANS);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterLoanType, setFilterLoanType] = useState<string>('');

  // Calculator state
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [emiResult, setEmiResult] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  // Application state
  const [applying, setApplying] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [appSuccess, setAppSuccess] = useState<string | null>(null);
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appState, setAppState] = useState('Tamil Nadu');
  const [appLoanType, setAppLoanType] = useState('Kisan Credit Card');
  const [appAmount, setAppAmount] = useState('');
  const [appPurpose, setAppPurpose] = useState('');

  useEffect(() => {
    void loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoadingLoans(true);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      const supabasePromise = supabase.from('loan_offers').select('*').order('created_at', { ascending: false });
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
      const dbLoans = (data || []).map((r: any) => ({
        id: r.id,
        bank_name: r.bank_name,
        loan_type: r.loan_type,
        interest_rate: Number(r.interest_rate),
        min_amount: Number(r.min_amount),
        max_amount: Number(r.max_amount),
        state: r.state,
        contact_number: r.contact_number,
        created_at: r.created_at,
      }));
      setLoans(dbLoans.length > 0 ? dbLoans : SAMPLE_LOANS);
    } catch {
      setLoans(SAMPLE_LOANS);
    } finally {
      setLoadingLoans(false);
    }
  };

  const calculateEMI = () => {
    const principal = Number(loanAmount);
    const rate = Number(interestRate) / 100 / 12; // Monthly interest rate
    const months = Number(loanTenure) * 12; // Convert years to months

    if (principal <= 0 || rate <= 0 || months <= 0) {
      setEmiResult(null);
      setTotalInterest(null);
      setTotalAmount(null);
      return;
    }

    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const total = emi * months;
    const interest = total - principal;

    setEmiResult(Math.round(emi));
    setTotalInterest(Math.round(interest));
    setTotalAmount(Math.round(total));
  };

  useEffect(() => {
    if (loanAmount && interestRate && loanTenure) {
      calculateEMI();
    } else {
      setEmiResult(null);
      setTotalInterest(null);
      setTotalAmount(null);
    }
  }, [loanAmount, interestRate, loanTenure]);

  const handleLoanApplication = () => {
    if (!appName.trim() || !appPhone.trim() || !appAmount || Number(appAmount) <= 0 || !appPurpose.trim()) {
      setAppError('Please fill all required fields.');
      return;
    }

    setApplying(true);
    setAppError(null);
    
    setTimeout(() => {
      setAppSuccess(`✅ Loan application submitted! Bank will contact you at ${appPhone} within 24 hours.`);
      setAppName('');
      setAppPhone('');
      setAppAmount('');
      setAppPurpose('');
      setTimeout(() => {
        setAppSuccess(null);
        setApplying(false);
        setActiveTab('browse');
      }, 3000);
    }, 1500);
  };

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesState = !filterState || loan.state === filterState || loan.state === 'All States';
      const matchesType = !filterLoanType || loan.loan_type === filterLoanType;
      const matchesSearch = !searchQuery.trim() ||
        loan.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.loan_type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesState && matchesType && matchesSearch;
    });
  }, [loans, filterState, filterLoanType, searchQuery]);

  const loanTypes = Array.from(new Set(loans.map(l => l.loan_type)));

  const renderBrowseTab = () => (
    <>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search loans..."
            className="pl-10 bg-card/90 border-0 min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => loadLoans()} disabled={loadingLoans} className="min-h-[44px] min-w-[44px]">
          <RefreshCw className={`w-4 h-4 ${loadingLoans ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Select value={filterLoanType || undefined} onValueChange={(val) => setFilterLoanType(val === "all" ? "" : val)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="Loan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {loanTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterState || undefined} onValueChange={(val) => setFilterState(val === "all" ? "" : val)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterState || filterLoanType || searchQuery) && (
          <Button variant="outline" size="sm" onClick={() => { setFilterState(''); setFilterLoanType(''); setSearchQuery(''); }} className="min-h-[44px] text-xs">
            Clear
          </Button>
        )}
      </div>

      {filteredLoans.length > 0 && !loadingLoans && (
        <p className="text-xs text-muted-foreground mb-2 mt-3">
          Showing {filteredLoans.length} {filteredLoans.length === 1 ? 'loan' : 'loans'}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {loadingLoans && loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">🏦</div>
            <p className="text-sm font-medium text-foreground mb-1">No loans found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div key={loan.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{loan.bank_name}</h3>
                  <p className="text-sm text-primary font-medium">{loan.loan_type}</p>
                  {loan.created_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(loan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
                <span className="text-2xl">🏦</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-primary/10 rounded-lg p-2 text-center">
                  <p className="text-xs text-muted-foreground">Interest</p>
                  <p className="font-bold text-primary">{loan.interest_rate}%</p>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-xs text-muted-foreground">Min</p>
                  <p className="font-bold text-foreground text-xs">₹{(loan.min_amount / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-xs text-muted-foreground">Max</p>
                  <p className="font-bold text-foreground text-xs">₹{(loan.max_amount / 100000).toFixed(1)}L</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">📍 {loan.state}</p>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                  setInterestRate(loan.interest_rate.toString());
                  setActiveTab('calculator');
                }}>
                  <Calculator className="w-3 h-3 mr-1" />
                  Calculate EMI
                </Button>
                <a href={`tel:${loan.contact_number}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <Phone className="w-3 h-3 mr-1" />
                    Contact
                  </Button>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  const renderCalculatorTab = () => (
    <div className="space-y-4 mt-2">
      <div className="bg-card rounded-2xl shadow-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Loan EMI Calculator</h3>

        <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
          <IndianRupee className="w-4 h-4 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            placeholder="Loan Amount *"
            className="bg-transparent border-0 px-0 min-h-[44px]"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
          />
        </div>

        <Input
          type="number"
          min="0"
          max="30"
          step="0.1"
          placeholder="Interest Rate (%) per annum *"
          className="bg-card/90 border-0 min-h-[44px]"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />

        <Input
          type="number"
          min="1"
          max="30"
          placeholder="Loan Tenure (Years) *"
          className="bg-card/90 border-0 min-h-[44px]"
          value={loanTenure}
          onChange={(e) => setLoanTenure(e.target.value)}
        />

        {emiResult && (
          <div className="bg-primary/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly EMI</span>
              <span className="text-xl font-bold text-primary flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {emiResult.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                {totalInterest?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                {totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderApplyTab = () => (
    <div className="space-y-3 mt-2">
      {appError && (
        <div className="text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 rounded-lg p-3 border border-destructive/20">
          ⚠️ {appError}
        </div>
      )}
      {appSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {appSuccess}
        </div>
      )}

      <Input
        placeholder="Your Name *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
      />

      <Input
        type="tel"
        placeholder="Phone Number *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={appPhone}
        onChange={(e) => setAppPhone(e.target.value.replace(/[^0-9]/g, ''))}
        maxLength={10}
      />

      <Select value={appState} onValueChange={setAppState}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="State *" />
        </SelectTrigger>
        <SelectContent>
          {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={appLoanType} onValueChange={setAppLoanType}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Loan Type *" />
        </SelectTrigger>
        <SelectContent>
          {loanTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
        <IndianRupee className="w-4 h-4 text-muted-foreground" />
        <Input
          type="number"
          min="0"
          placeholder="Loan Amount Required *"
          className="bg-transparent border-0 px-0 min-h-[44px]"
          value={appAmount}
          onChange={(e) => setAppAmount(e.target.value)}
        />
      </div>

      <textarea
        placeholder="Purpose of Loan *"
        className="w-full bg-card/90 border-0 rounded-md p-3 min-h-[80px] text-sm"
        value={appPurpose}
        onChange={(e) => setAppPurpose(e.target.value)}
      />

      <Button
        className="w-full min-h-[48px] text-base font-semibold mt-2 shadow-lg hover:shadow-xl transition-all"
        onClick={handleLoanApplication}
        disabled={applying}
        size="lg"
      >
        {applying ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            📝 Submit Loan Application
          </>
        )}
      </Button>
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
            <h1 className="text-xl font-bold text-primary-foreground">{t.loanAssistance || 'Loans'} 🏦</h1>
            <p className="text-sm text-primary-foreground/80">Find and apply for agricultural loans</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            variant={activeTab === 'browse' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'browse' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('browse')}
          >
            🔍 Browse Loans
          </Button>
          <Button
            variant={activeTab === 'calculator' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'calculator' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('calculator')}
          >
            🧮 EMI Calculator
          </Button>
          <Button
            variant={activeTab === 'apply' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'apply' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('apply')}
          >
            📝 Apply
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'browse' ? renderBrowseTab() : activeTab === 'calculator' ? renderCalculatorTab() : renderApplyTab()}
      </div>
    </div>
  );
};

export default LoanAssistanceScreen;
