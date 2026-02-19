import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Phone, MessageCircle, Search, RefreshCw, Star, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface TechniciansScreenProps {
  onBack: () => void;
}

interface Technician {
  id: string;
  name: string;
  category: string;
  experience: string;
  district: string;
  state: string;
  phone: string;
  services: string;
  rating: number;
  availability_status: string;
  created_at?: string;
}

const STORAGE_KEY = 'technicians_local';

const serviceCategories = ['Electrician', 'Mechanic', 'Plumber', 'Welder', 'Carpenter', 'Other'];
const categoryEmojis: Record<string, string> = {
  'Electrician': '⚡', 'Mechanic': '🔩', 'Plumber': '🔧', 'Welder': '🔥', 'Carpenter': '🪵', 'Other': '👷'
};

const SAMPLE_TECHNICIANS: Technician[] = [
  { id: '1', name: 'Rajesh Kumar', category: 'Electrician', experience: '10 years', district: 'Chennai', state: 'Tamil Nadu', phone: '9876543210', services: 'Motor repair, Wiring, Panel installation', rating: 4.5, availability_status: 'Available', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', name: 'Suresh Motors', category: 'Mechanic', experience: '15 years', district: 'Coimbatore', state: 'Tamil Nadu', phone: '9876543211', services: 'Tractor repair, Engine service, General maintenance', rating: 4.8, availability_status: 'Available', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', name: 'Krishna Welding', category: 'Welder', experience: '8 years', district: 'Thanjavur', state: 'Tamil Nadu', phone: '9876543212', services: 'Equipment welding, Fabrication, Repair work', rating: 4.3, availability_status: 'Available', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', name: 'Green Agri Services', category: 'Mechanic', experience: '12 years', district: 'Madurai', state: 'Tamil Nadu', phone: '9876543213', services: 'Harvester repair, Sprayer service, All farm equipment', rating: 4.7, availability_status: 'Available', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStoredTechnicians = (): Technician[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredTechnicians = (items: Technician[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const TechniciansScreen: React.FC<TechniciansScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  
  // Ensure component renders even if context fails
  if (!t) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Loading Technicians...</p>
        </div>
      </div>
    );
  }
  const [technicians, setTechnicians] = useState<Technician[]>(SAMPLE_TECHNICIANS);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');

  // Booking state
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingIssue, setBookingIssue] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const filterDistrictOptions = filterState ? STATES_DISTRICTS[filterState] ?? [] : [];

  useEffect(() => {
    void loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    setLoadingTechnicians(true);
    const localTechnicians = getStoredTechnicians();
    
    // Show sample data immediately
    const initialData = localTechnicians.length > 0 ? localTechnicians : SAMPLE_TECHNICIANS;
    setTechnicians(initialData);
    setLoadingTechnicians(false);
    
    // Try to load from Supabase in background (non-blocking)
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const supabasePromise = supabase
        .from('technicians')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      
      if (error) throw error;
      const dbTechnicians = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        experience: r.experience,
        district: r.district,
        state: r.state,
        phone: r.phone,
        services: r.services,
        rating: Number(r.rating) || 4.0,
        availability_status: r.availability_status || 'Available',
        created_at: r.created_at,
      }));
      const merged = [...dbTechnicians, ...localTechnicians.filter((l) => !dbTechnicians.some((d) => d.id === l.id))];
      setTechnicians(merged.length > 0 ? merged : [...SAMPLE_TECHNICIANS, ...localTechnicians]);
    } catch (err) {
      // Connection failed - use local/sample data (already set above)
      console.log('Using local data:', err);
    }
  };

  const handleBooking = () => {
    if (!selectedTechnician) return;
    if (!bookingDate) {
      alert('Please select a date.');
      return;
    }
    if (!bookingTime) {
      alert('Please select a time.');
      return;
    }
    if (!bookingName.trim() || !bookingPhone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (!bookingIssue.trim()) {
      alert('Please describe the issue.');
      return;
    }

    setBooking(true);
    setTimeout(() => {
      setBookingSuccess(`✅ Booking confirmed! ${selectedTechnician.name} will contact you on ${bookingDate} at ${bookingTime}.`);
      setSelectedTechnician(null);
      setBookingDate('');
      setBookingTime('');
      setBookingName('');
      setBookingPhone('');
      setBookingIssue('');
      setTimeout(() => {
        setBookingSuccess(null);
        setBooking(false);
      }, 5000);
    }, 1000);
  };

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      const matchesCat = selectedCategory === 'all' || tech.category === selectedCategory;
      const matchesState = !filterState || tech.state === filterState;
      const matchesDistrict = !filterDistrict || tech.district === filterDistrict;
      const matchesSearch = !searchQuery.trim() ||
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.services.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesState && matchesDistrict && matchesSearch;
    });
  }, [technicians, selectedCategory, filterState, filterDistrict, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">{t?.technicians || 'Technicians'} 🔧</h1>
            <p className="text-sm text-primary-foreground/80">Get technical support for equipment</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.search2 || 'Search technicians...'}
              className="pl-10 bg-card/90 border-0 min-h-[44px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => loadTechnicians()} disabled={loadingTechnicians} className="min-h-[44px] min-w-[44px]">
            <RefreshCw className={`w-4 h-4 ${loadingTechnicians ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground shadow-card'
            }`}
          >
            <span>🔧</span>
            <span className="text-sm font-medium">{t.allCategories || 'All'}</span>
          </button>
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground shadow-card'
              }`}
            >
              <span>{categoryEmojis[cat]}</span>
              <span className="text-sm font-medium">{cat}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <Select value={filterState || undefined} onValueChange={(val) => { setFilterState(val === "all" ? "" : val); setFilterDistrict(''); }}>
            <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
              <SelectValue placeholder="Any State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any State</SelectItem>
              {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterDistrict || undefined} onValueChange={(val) => setFilterDistrict(val === "all" ? "" : val)} disabled={!filterState}>
            <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
              <SelectValue placeholder="Any District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any District</SelectItem>
              {filterDistrictOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          {(filterState || filterDistrict || searchQuery || selectedCategory !== 'all') && (
            <Button variant="outline" size="sm" onClick={() => { setFilterState(''); setFilterDistrict(''); setSearchQuery(''); setSelectedCategory('all'); }} className="min-h-[44px] text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {filteredTechnicians.length > 0 && !loadingTechnicians && (
          <p className="text-xs text-muted-foreground mb-2">
            Showing {filteredTechnicians.length} {filteredTechnicians.length === 1 ? 'technician' : 'technicians'}
          </p>
        )}

        <div className="space-y-3 mt-4">
          {loadingTechnicians && technicians.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading technicians...</p>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-4xl mb-3">🔧</div>
              <p className="text-sm font-medium text-foreground mb-1">No technicians found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' || filterState || filterDistrict ? 'Try adjusting your filters.' : 'No technicians available in your area.'}
              </p>
            </div>
          ) : (
            filteredTechnicians.map((tech) => (
              <div key={tech.id} className="bg-card rounded-2xl p-4 shadow-card space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                    <span>{categoryEmojis[tech.category] || '👷'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{tech.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{tech.district}, {tech.state}</span>
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <span className="text-xs font-medium text-foreground">{tech.rating}</span>
                          {tech.created_at && (
                            <span className="text-xs text-muted-foreground ml-1">
                              • {new Date(tech.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tech.availability_status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {tech.availability_status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-secondary px-2 py-1 rounded-full font-medium">
                        {categoryEmojis[tech.category]} {tech.category}
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">
                        ⏱️ {tech.experience}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Services:</span> {tech.services}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {tech.availability_status === 'Available' && (
                    <Button
                      size="sm"
                      className="flex-1 gap-1 min-h-[40px]"
                      onClick={() => setSelectedTechnician(tech)}
                    >
                      <Calendar className="w-3 h-3" />
                      Book Service
                    </Button>
                  )}
                  <a href={`tel:${tech.phone}`} className="flex-1">
                    <Button size="sm" className="w-full gap-1 min-h-[40px]" variant="outline">
                      <Phone className="w-3 h-3" />
                      {t.call}
                    </Button>
                  </a>
                  <a href={`https://wa.me/${tech.phone}?text=Hi ${tech.name}, I need ${tech.category} services.`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" className="w-full gap-1 min-h-[40px]">
                      <MessageCircle className="w-3 h-3" />
                      {t.message}
                    </Button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTechnician && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Book {selectedTechnician.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedTechnician.category} • {selectedTechnician.services}</p>
            <Input
              type="date"
              placeholder="Select date *"
              className="bg-card/90 border-0 min-h-[44px]"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              type="time"
              placeholder="Select time *"
              className="bg-card/90 border-0 min-h-[44px]"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
            />
            <Input
              placeholder="Your name *"
              className="bg-card/90 border-0 min-h-[44px]"
              value={bookingName}
              onChange={(e) => setBookingName(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Your phone *"
              className="bg-card/90 border-0 min-h-[44px]"
              value={bookingPhone}
              onChange={(e) => setBookingPhone(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <Textarea
              placeholder="Describe the issue or service needed *"
              className="bg-card/90 border-0 min-h-[80px]"
              value={bookingIssue}
              onChange={(e) => setBookingIssue(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSelectedTechnician(null); setBookingDate(''); setBookingTime(''); setBookingName(''); setBookingPhone(''); setBookingIssue(''); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleBooking} disabled={booking}>
                {booking ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {bookingSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-medium">{bookingSuccess}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansScreen;
