import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, Phone, MessageCircle, Search, RefreshCw, IndianRupee, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface FarmWorkScreenProps {
  onBack: () => void;
}

type Tab = 'jobs' | 'post';

interface FarmJob {
  id: string;
  work_type: string;
  owner_name: string;
  location: string;
  state: string;
  wage_per_day: number;
  phone: string;
  duration_days?: number;
  description?: string;
  created_at?: string;
}

const STORAGE_KEY = 'farm_jobs_local';
const WORK_TYPES = ['Harvesting', 'Irrigation Work', 'Pesticide Spray', 'Weeding', 'Ploughing', 'Sowing', 'Other'];
const WORK_EMOJIS: Record<string, string> = { Harvesting: '🌾', 'Irrigation Work': '💧', 'Pesticide Spray': '💨', Weeding: '🪴', Ploughing: '🚜', Sowing: '🌱', Other: '🔧' };

const SAMPLE_JOBS: FarmJob[] = [
  { id: '1', work_type: 'Harvesting', owner_name: 'Raju Farms', location: 'Chennai', state: 'Tamil Nadu', wage_per_day: 400, phone: '9876543210', duration_days: 5, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', work_type: 'Irrigation Work', owner_name: 'Green Fields', location: 'Thanjavur', state: 'Tamil Nadu', wage_per_day: 350, phone: '9876543211', duration_days: 3, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', work_type: 'Ploughing', owner_name: 'Suresh Reddy', location: 'Coimbatore', state: 'Tamil Nadu', wage_per_day: 500, phone: '9876543212', duration_days: 7, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStored = (): FarmJob[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveStored = (items: FarmJob[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
};

const FarmWorkScreen: React.FC<FarmWorkScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('jobs');
  const [jobs, setJobs] = useState<FarmJob[]>(SAMPLE_JOBS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');

  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  const [workType, setWorkType] = useState('Harvesting');
  const [ownerName, setOwnerName] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [wagePerDay, setWagePerDay] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (activeTab === 'jobs') loadJobs();
  }, [activeTab]);

  const loadJobs = async () => {
    setLoading(true);
    const local = getStored();
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 5000));
      const { data, error } = await Promise.race([supabase.from('farm_jobs').select('*').order('created_at', { ascending: false }), timeout]) as { data: any[]; error: any };
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        work_type: r.work_type,
        owner_name: r.owner_name,
        location: r.location,
        state: r.state,
        wage_per_day: Number(r.wage_per_day),
        phone: r.phone || '',
        duration_days: r.duration_days,
        description: r.description,
        created_at: r.created_at,
      }));
      setJobs(mapped.length ? mapped : [...SAMPLE_JOBS, ...local]);
    } catch {
      setJobs(local.length ? local : SAMPLE_JOBS);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (filterType && j.work_type !== filterType) return false;
      if (filterState && j.state !== filterState) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return j.owner_name.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || j.work_type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [jobs, filterType, filterState, searchQuery]);

  const handlePostJob = async () => {
    if (!ownerName.trim() || !location.trim() || !state || !wagePerDay || !phone.trim()) {
      alert('Please fill required fields.');
      return;
    }
    setPosting(true);
    setPostSuccess(null);
    const payload = {
      work_type: workType,
      owner_name: ownerName.trim(),
      location: location.trim(),
      state,
      wage_per_day: Number(wagePerDay),
      phone: phone.replace(/[^0-9]/g, ''),
      duration_days: durationDays ? Number(durationDays) : null,
      description: description.trim() || null,
    };
    const newJob: FarmJob = { id: `local-${Date.now()}`, ...payload, created_at: new Date().toISOString() };
    setJobs((prev) => [newJob, ...prev]);
    const stored = getStored();
    stored.unshift(newJob);
    saveStored(stored);
    try {
      await Promise.race([supabase.from('farm_jobs').insert([payload]), new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 3000))]);
    } catch {}
    setPostSuccess('✅ Job posted! Workers can contact you.');
    setOwnerName('');
    setLocation('');
    setWagePerDay('');
    setDurationDays('');
    setPhone('');
    setDescription('');
    setTimeout(() => { setActiveTab('jobs'); setPostSuccess(null); }, 2000);
    setPosting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">💼 {t.farmWork || 'Farm Work'}</h1>
            <p className="text-sm text-primary-foreground/80">Find work or post jobs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === 'jobs' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[44px] ${activeTab === 'jobs' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setActiveTab('jobs')}>
            🔍 Jobs
          </Button>
          <Button variant={activeTab === 'post' ? 'secondary' : 'ghost'} className={`flex-1 min-h-[44px] ${activeTab === 'post' ? 'bg-card text-foreground' : 'text-primary-foreground'}`} onClick={() => setActiveTab('post')}>
            📝 Post Job
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {postSuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">{postSuccess}</div>}

        {activeTab === 'jobs' && (
          <>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search jobs..." className="pl-10 bg-card/90 border-0 min-h-[44px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" size="icon" onClick={() => loadJobs()} disabled={loading} className="min-h-[44px] min-w-[44px]">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex gap-2 mb-4">
              <Select value={filterType || undefined} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
                <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs"><SelectValue placeholder="Work type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {WORK_TYPES.map((t) => <SelectItem key={t} value={t}>{WORK_EMOJIS[t] || '🔧'} {t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterState || undefined} onValueChange={(v) => setFilterState(v === 'all' ? '' : v)}>
                <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs"><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {loading && jobs.length === 0 ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No jobs found.</div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{WORK_EMOJIS[job.work_type] || '🔧'}</span>
                        <div>
                          <h3 className="font-bold text-foreground">{job.work_type}</h3>
                          <p className="font-medium text-foreground">{job.owner_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}, {job.state}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.dailyWage || 'Daily wage'}</span>
                      <span className="font-bold text-primary flex items-center gap-1"><IndianRupee className="w-4 h-4" />{job.wage_per_day}/day</span>
                    </div>
                    {job.duration_days && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{job.duration_days} days</p>}
                    <div className="flex gap-2">
                      <a href={`tel:${job.phone}`} className="flex-1"><Button size="sm" className="w-full"><Phone className="w-3 h-3 mr-1" />{t.call}</Button></a>
                      <a href={`https://wa.me/${job.phone}?text=Hi, I'm interested in ${job.work_type} work.`} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full"><MessageCircle className="w-3 h-3 mr-1" />{t.message}</Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'post' && (
          <div className="space-y-3">
            <Select value={workType} onValueChange={setWorkType}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px]"><SelectValue placeholder="Work type *" /></SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((t) => <SelectItem key={t} value={t}>{WORK_EMOJIS[t] || '🔧'} {t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Owner / Farm name *" className="min-h-[44px]" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            <Input placeholder="Location *" className="min-h-[44px]" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px]"><SelectValue placeholder="State *" /></SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 bg-card/90 rounded-md px-3 min-h-[44px]">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              <Input type="number" min="0" placeholder="Wage per day (₹) *" className="bg-transparent border-0" value={wagePerDay} onChange={(e) => setWagePerDay(e.target.value)} />
            </div>
            <Input type="number" min="1" placeholder="Duration (days, optional)" className="min-h-[44px]" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
            <Input type="tel" placeholder="Contact (10 digits) *" className="min-h-[44px]" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} />
            <textarea placeholder="Description (optional)" className="w-full min-h-[80px] rounded-md border bg-card p-3 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button className="w-full min-h-[48px] font-semibold" onClick={handlePostJob} disabled={posting}>
              {posting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Posting...</> : '💼 Post Job'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmWorkScreen;
