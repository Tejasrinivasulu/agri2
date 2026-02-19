import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, Clock, Search, RefreshCw, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS } from '@/data/cropRates';

interface WeekendFarmingScreenProps {
  onBack: () => void;
}

interface Session {
  id: string;
  session_name: string;
  state: string;
  location: string;
  fee: number;
  duration_days: number;
  description?: string;
  contact_phone?: string;
  created_at?: string;
}

const STORAGE_KEY = 'weekend_sessions_local';
const BOOKINGS_KEY = 'weekend_farm_bookings';

const SAMPLE_SESSIONS: Session[] = [
  { id: '1', session_name: 'Organic Farm Experience', state: 'Tamil Nadu', location: 'Chennai outskirts', fee: 1500, duration_days: 1, description: 'Hands-on organic farming', contact_phone: '9876543210', created_at: new Date().toISOString() },
  { id: '2', session_name: 'Weekend Harvest Camp', state: 'Tamil Nadu', location: 'Thanjavur', fee: 2500, duration_days: 2, description: 'Harvest and learn', contact_phone: '9876543211', created_at: new Date().toISOString() },
  { id: '3', session_name: 'Family Farming Day', state: 'Tamil Nadu', location: 'Coimbatore', fee: 2000, duration_days: 1, description: 'Family-friendly activities', contact_phone: '9876543212', created_at: new Date().toISOString() },
];

const getStored = (): Session[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveStored = (items: Session[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
};

type Booking = { sessionId: string; sessionName: string; date: string; guestName: string; phone: string; amount: number; status: string };
const getBookings = (): Booking[] => {
  try {
    const s = localStorage.getItem(BOOKINGS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveBookings = (items: Booking[]) => {
  try { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(items)); } catch {}
};

const WeekendFarmingScreen: React.FC<WeekendFarmingScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>(SAMPLE_SESSIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>(getBookings());

  const [bookingModal, setBookingModal] = useState<Session | null>(null);
  const [bookDate, setBookDate] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const local = getStored();
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 5000));
      const { data, error } = await Promise.race([supabase.from('weekend_sessions').select('*'), timeout]) as { data: any[]; error: any };
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        session_name: r.session_name,
        state: r.state,
        location: r.location,
        fee: Number(r.fee),
        duration_days: Number(r.duration_days) || 1,
        description: r.description,
        contact_phone: r.contact_phone,
        created_at: r.created_at,
      }));
      setSessions(mapped.length ? mapped : [...SAMPLE_SESSIONS, ...local]);
    } catch {
      setSessions(local.length ? local : SAMPLE_SESSIONS);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterState && s.state !== filterState) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.session_name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sessions, filterState, searchQuery]);

  const handleBook = () => {
    if (!bookingModal || !bookDate || !guestName.trim() || !guestPhone.trim()) {
      alert('Please fill date, name, and phone.');
      return;
    }
    const newBooking: Booking = {
      sessionId: bookingModal.id,
      sessionName: bookingModal.session_name,
      date: bookDate,
      guestName: guestName.trim(),
      phone: guestPhone.replace(/[^0-9]/g, ''),
      amount: bookingModal.fee,
      status: 'confirmed',
    };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    saveBookings(updated);
    setBookSuccess(`✅ Booked! ${bookingModal.session_name} on ${new Date(bookDate).toLocaleDateString()}. Total ₹${bookingModal.fee}.`);
    setBookingModal(null);
    setBookDate('');
    setGuestName('');
    setGuestPhone('');
    setTimeout(() => setBookSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">🌻 {t.weekendFarming || 'Weekend Farm'}</h1>
            <p className="text-sm text-primary-foreground/80">Discover and book farm experiences</p>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-card/90 border-0 min-h-[44px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => loadSessions()} disabled={loading} className="min-h-[44px] min-w-[44px] text-primary-foreground border-primary-foreground/30">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Select value={filterState || undefined} onValueChange={(v) => setFilterState(v === 'all' ? '' : v)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-primary-foreground"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 mt-4">
        {bookSuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">{bookSuccess}</div>}
        {bookings.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-leaf-light/50 border border-leaf-medium/30">
            <p className="font-semibold text-leaf-dark">✓ {bookings.length} {t.bookedSessions || 'bookings'}</p>
          </div>
        )}
        {loading && sessions.length === 0 ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No sessions found.</div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    <span className="text-3xl">🌿</span>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{session.session_name}</h3>
                      <p className="text-sm text-muted-foreground">{session.state}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary flex items-center gap-0.5"><IndianRupee className="w-5 h-5" />{session.fee}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4 text-primary" />{session.duration_days} day(s)</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 text-primary" />{session.location}</div>
                  {session.description && <p className="text-sm text-muted-foreground">{session.description}</p>}
                  <Button className="w-full min-h-[44px]" onClick={() => setBookingModal(session)}>
                    🎫 {t.bookNow || 'Book now'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-background rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">Book: {bookingModal.session_name}</h3>
            <p className="text-primary font-semibold mb-4">₹{bookingModal.fee} • {bookingModal.duration_days} day(s)</p>
            <Input type="date" className="mb-3 min-h-[44px]" value={bookDate} onChange={(e) => setBookDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            <Input placeholder="Your name *" className="mb-3 min-h-[44px]" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            <Input type="tel" placeholder="Phone *" className="mb-4 min-h-[44px]" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setBookingModal(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleBook}>Confirm & Pay ₹{bookingModal.fee}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekendFarmingScreen;
