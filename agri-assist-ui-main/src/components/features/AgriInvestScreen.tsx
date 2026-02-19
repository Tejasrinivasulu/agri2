import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Handshake, Search, Phone, MessageCircle, RefreshCw, IndianRupee, MapPin, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface AgriInvestScreenProps {
  onBack: () => void;
}

type Tab = 'browse' | 'post' | 'my-proposals';

interface Investment {
  id: string;
  farmer_name: string;
  land_available: number;
  investor_required_amount: number;
  profit_share_percentage: number;
  district: string;
  state: string;
  phone: string;
  crop_planned?: string;
  created_at?: string;
}

const STORAGE_KEY = 'agri_investments_local';
const PROPOSALS_KEY = 'agri_invest_proposals';

const SAMPLE_INVESTMENTS: Investment[] = [
  { id: '1', farmer_name: 'Raju Kumar', land_available: 5, investor_required_amount: 200000, profit_share_percentage: 40, district: 'Chennai', state: 'Tamil Nadu', phone: '9876543210', crop_planned: 'Rice', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', farmer_name: 'Suresh Reddy', land_available: 10, investor_required_amount: 500000, profit_share_percentage: 35, district: 'Thanjavur', state: 'Tamil Nadu', phone: '9876543211', crop_planned: 'Cotton', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', farmer_name: 'Lakshmi Farms', land_available: 8, investor_required_amount: 350000, profit_share_percentage: 45, district: 'Coimbatore', state: 'Tamil Nadu', phone: '9876543212', crop_planned: 'Sugarcane', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStored = (): Investment[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveStored = (items: Investment[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
};

const getProposals = (): { listingId: string; investorName: string; amount: number; message: string; date: string }[] => {
  try {
    const s = localStorage.getItem(PROPOSALS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveProposals = (items: { listingId: string; investorName: string; amount: number; message: string; date: string }[]) => {
  try { localStorage.setItem(PROPOSALS_KEY, JSON.stringify(items)); } catch {}
};

const AgriInvestScreen: React.FC<AgriInvestScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [investments, setInvestments] = useState<Investment[]>(SAMPLE_INVESTMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('');

  // Post form
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  const [farmerName, setFarmerName] = useState('');
  const [landAvailable, setLandAvailable] = useState('');
  const [amountRequired, setAmountRequired] = useState('');
  const [profitShare, setProfitShare] = useState('40');
  const [cropPlanned, setCropPlanned] = useState('Rice');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  const [phone, setPhone] = useState('');

  // Apply modal
  const [selectedListing, setSelectedListing] = useState<Investment | null>(null);
  const [investorName, setInvestorName] = useState('');
  const [investorAmount, setInvestorAmount] = useState('');
  const [investorMessage, setInvestorMessage] = useState('');
  const [proposals, setProposals] = useState(getProposals());
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const districtOptions = state ? (STATES_DISTRICTS[state] ?? []) : [];

  useEffect(() => {
    if (activeTab === 'browse') loadInvestments();
  }, [activeTab]);

  const loadInvestments = async () => {
    setLoading(true);
    const local = getStored();
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 5000));
      const { data, error } = await Promise.race([
        supabase.from('agri_investments').select('*').order('created_at', { ascending: false }),
        timeout,
      ]) as { data: any[]; error: any };
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        farmer_name: r.farmer_name,
        land_available: Number(r.land_available),
        investor_required_amount: Number(r.investor_required_amount),
        profit_share_percentage: Number(r.profit_share_percentage),
        district: r.district,
        state: r.state,
        phone: r.phone || '',
        crop_planned: r.crop_planned,
        created_at: r.created_at,
      }));
      setInvestments(mapped.length ? mapped : [...SAMPLE_INVESTMENTS, ...local]);
    } catch {
      setInvestments(local.length ? local : SAMPLE_INVESTMENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = useMemo(() => {
    return investments.filter((inv) => {
      if (filterState && inv.state !== filterState) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return inv.farmer_name.toLowerCase().includes(q) || inv.district.toLowerCase().includes(q) || (inv.crop_planned || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [investments, filterState, searchQuery]);

  const handlePostListing = async () => {
    if (!farmerName.trim() || !landAvailable || !amountRequired || !state || !district || !phone.trim()) {
      alert('Please fill all required fields.');
      return;
    }
    setPosting(true);
    setPostSuccess(null);
    const payload = {
      farmer_name: farmerName.trim(),
      land_available: Number(landAvailable),
      investor_required_amount: Number(amountRequired),
      profit_share_percentage: Number(profitShare),
      district,
      state,
      phone: phone.replace(/[^0-9]/g, ''),
      crop_planned: cropPlanned,
    };
    const newItem: Investment = {
      id: `local-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    setInvestments((prev) => [newItem, ...prev]);
    const stored = getStored();
    stored.unshift(newItem);
    saveStored(stored);
    try {
      await Promise.race([
        supabase.from('agri_investments').insert([payload]),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 3000)),
      ]);
    } catch {}
    setPostSuccess('✅ Investment listing posted! Investors can now contact you.');
    setFarmerName('');
    setLandAvailable('');
    setAmountRequired('');
    setPhone('');
    setTimeout(() => {
      setActiveTab('browse');
      setPostSuccess(null);
    }, 2000);
    setPosting(false);
  };

  const handleApply = () => {
    if (!selectedListing || !investorName.trim() || !investorAmount) return;
    const newProposal = {
      listingId: selectedListing.id,
      investorName: investorName.trim(),
      amount: Number(investorAmount),
      message: investorMessage.trim(),
      date: new Date().toISOString(),
    };
    const updated = [newProposal, ...proposals];
    setProposals(updated);
    saveProposals(updated);
    setApplySuccess(`✅ Proposal sent to ${selectedListing.farmer_name}!`);
    setSelectedListing(null);
    setInvestorName('');
    setInvestorAmount('');
    setInvestorMessage('');
    setTimeout(() => setApplySuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">🤝 {t.agriInvest || 'Agri Invest'}</h1>
            <p className="text-sm text-primary-foreground/80">Invest in farming or seek investment</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === 'browse' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[44px] ${activeTab === 'browse' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setActiveTab('browse')}>
            🔍 Browse
          </Button>
          <Button variant={activeTab === 'post' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[44px] ${activeTab === 'post' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setActiveTab('post')}>
            📝 Post
          </Button>
          <Button variant={activeTab === 'my-proposals' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[44px] ${activeTab === 'my-proposals' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setActiveTab('my-proposals')}>
            📨 Proposals
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {postSuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">{postSuccess}</div>}
        {applySuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">{applySuccess}</div>}

        {activeTab === 'browse' && (
          <>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 bg-card/90 border-0 min-h-[44px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" size="icon" onClick={() => loadInvestments()} disabled={loading} className="min-h-[44px] min-w-[44px]">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Select value={filterState || undefined} onValueChange={(v) => setFilterState(v === 'all' ? '' : v)}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px] mb-4">
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {loading && investments.length === 0 ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredInvestments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No listings found.</div>
            ) : (
              <div className="space-y-3">
                {filteredInvestments.map((inv) => (
                  <div key={inv.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{inv.farmer_name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{inv.district}, {inv.state}</p>
                        {inv.crop_planned && <p className="text-xs text-primary mt-1">Crop: {inv.crop_planned}</p>}
                      </div>
                      <span className="text-2xl">🌾</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-secondary/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Acres</p>
                        <p className="font-bold text-foreground">{inv.land_available}</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Need</p>
                        <p className="font-bold text-primary flex items-center justify-center gap-0.5"><IndianRupee className="w-3 h-3" />{(inv.investor_required_amount / 100000).toFixed(1)}L</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground">Share</p>
                        <p className="font-bold text-foreground">{inv.profit_share_percentage}%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => setSelectedListing(inv)}>
                        <UserPlus className="w-3 h-3 mr-1" /> Apply as Investor
                      </Button>
                      <a href={`tel:${inv.phone}`}><Button size="sm" variant="outline"><Phone className="w-3 h-3 mr-1" />{t.call}</Button></a>
                      <a href={`https://wa.me/${inv.phone}?text=Hi, I'm interested in investing in your farm.`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><MessageCircle className="w-3 h-3" /></Button></a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'post' && (
          <div className="space-y-3">
            <Input placeholder="Farmer / Farm Name *" className="bg-card/90 border-0 min-h-[44px]" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} />
            <Input type="number" min="0" placeholder="Land available (acres) *" className="bg-card/90 border-0 min-h-[44px]" value={landAvailable} onChange={(e) => setLandAvailable(e.target.value)} />
            <div className="flex items-center gap-1 bg-card/90 rounded-md px-3 min-h-[44px]">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              <Input type="number" min="0" placeholder="Investment required (₹) *" className="bg-transparent border-0" value={amountRequired} onChange={(e) => setAmountRequired(e.target.value)} />
            </div>
            <Input type="number" min="0" max="100" placeholder="Profit share % *" className="bg-card/90 border-0 min-h-[44px]" value={profitShare} onChange={(e) => setProfitShare(e.target.value)} />
            <Select value={cropPlanned} onValueChange={setCropPlanned}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut', 'Vegetables'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={state} onValueChange={(v) => { setState(v); setDistrict(''); }}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px]"><SelectValue placeholder="State *" /></SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={district} onValueChange={setDistrict} disabled={!state || !districtOptions.length}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px]"><SelectValue placeholder={state ? 'District *' : 'Select state first'} /></SelectTrigger>
              <SelectContent>
                {districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="tel" placeholder="Contact (10 digits) *" className="bg-card/90 border-0 min-h-[44px]" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} />
            <Button className="w-full min-h-[48px] font-semibold" onClick={handlePostListing} disabled={posting}>
              {posting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Posting...</> : '🤝 Post Investment Listing'}
            </Button>
          </div>
        )}

        {activeTab === 'my-proposals' && (
          <div className="space-y-3">
            {proposals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No proposals yet. Apply as investor from Browse.</div>
            ) : (
              proposals.map((p, i) => {
                const inv = investments.find((x) => x.id === p.listingId);
                return (
                  <div key={i} className="bg-card rounded-2xl shadow-card p-4">
                    <p className="font-semibold text-foreground">To: {inv?.farmer_name || p.listingId}</p>
                    <p className="text-sm text-muted-foreground">Amount: ₹{p.amount.toLocaleString()} • {new Date(p.date).toLocaleDateString()}</p>
                    {p.message && <p className="text-sm mt-1">{p.message}</p>}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-background rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-2">Apply as Investor</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedListing.farmer_name} • ₹{selectedListing.investor_required_amount.toLocaleString()} needed</p>
            <Input placeholder="Your name *" className="mb-3 min-h-[44px]" value={investorName} onChange={(e) => setInvestorName(e.target.value)} />
            <Input type="number" placeholder="Amount you want to invest (₹) *" className="mb-3 min-h-[44px]" value={investorAmount} onChange={(e) => setInvestorAmount(e.target.value)} />
            <textarea placeholder="Message (optional)" className="w-full min-h-[80px] rounded-md border bg-card p-3 text-sm mb-4" value={investorMessage} onChange={(e) => setInvestorMessage(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedListing(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleApply}>Send Proposal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgriInvestScreen;
