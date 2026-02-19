import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Phone, MessageCircle, MapPin, Search, RefreshCw, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface AgriOfficersScreenProps {
  onBack: () => void;
}

interface Officer {
  id: string;
  name: string;
  role: string;
  experience_years: number;
  district: string;
  state: string;
  phone: string;
  office_address: string;
  created_at?: string;
}

const SAMPLE_OFFICERS: Officer[] = [
  { id: '1', name: 'Dr. Ramesh Kumar', role: 'Agri Officer', experience_years: 15, district: 'Chennai', state: 'Tamil Nadu', phone: '9876543210', office_address: 'Agriculture Office, Chennai', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', name: 'Dr. Priya Sharma', role: 'Veterinary Officer', experience_years: 12, district: 'Coimbatore', state: 'Tamil Nadu', phone: '9876543211', office_address: 'Veterinary Hospital, Coimbatore', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', name: 'Dr. Suresh Reddy', role: 'Agri Officer', experience_years: 20, district: 'Thanjavur', state: 'Tamil Nadu', phone: '9876543212', office_address: 'District Agriculture Office, Thanjavur', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', name: 'Dr. Lakshmi Devi', role: 'Veterinary Officer', experience_years: 10, district: 'Madurai', state: 'Tamil Nadu', phone: '9876543213', office_address: 'Animal Husbandry Department, Madurai', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const AgriOfficersScreen: React.FC<AgriOfficersScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [officers, setOfficers] = useState<Officer[]>(SAMPLE_OFFICERS);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');

  // Booking state
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const roles = ['all', 'Agri Officer', 'Veterinary Officer'];
  const filterDistrictOptions = filterState ? STATES_DISTRICTS[filterState] ?? [] : [];

  useEffect(() => {
    void loadOfficers();
  }, []);

  const loadOfficers = async () => {
    setLoadingOfficers(true);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      const supabasePromise = supabase.from('officers').select('*').order('created_at', { ascending: false });
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
      const dbOfficers = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        experience_years: Number(r.experience_years) || 0,
        district: r.district,
        state: r.state,
        phone: r.phone,
        office_address: r.office_address,
        created_at: r.created_at,
      }));
      setOfficers(dbOfficers.length > 0 ? dbOfficers : SAMPLE_OFFICERS);
    } catch {
      setOfficers(SAMPLE_OFFICERS);
    } finally {
      setLoadingOfficers(false);
    }
  };

  const handleBooking = () => {
    if (!selectedOfficer) return;
    if (!bookingDate || !bookingTime || !bookingName.trim() || !bookingPhone.trim() || !bookingPurpose.trim()) {
      alert('Please fill all fields.');
      return;
    }

    setBooking(true);
    setTimeout(() => {
      setBookingSuccess(`✅ Visit request confirmed! ${selectedOfficer.name} will contact you for ${bookingDate} at ${bookingTime}.`);
      setSelectedOfficer(null);
      setBookingDate('');
      setBookingTime('');
      setBookingName('');
      setBookingPhone('');
      setBookingPurpose('');
      setTimeout(() => {
        setBookingSuccess(null);
        setBooking(false);
      }, 5000);
    }, 1000);
  };

  const filteredOfficers = useMemo(() => {
    return officers.filter(officer => {
      const matchesRole = selectedRole === 'all' || officer.role === selectedRole;
      const matchesState = !filterState || officer.state === filterState;
      const matchesDistrict = !filterDistrict || officer.district === filterDistrict;
      const matchesSearch = !searchQuery.trim() ||
        officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        officer.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesState && matchesDistrict && matchesSearch;
    });
  }, [officers, selectedRole, filterState, filterDistrict, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">{t.agriOfficers || 'Agri Officers'} 👨‍🌾</h1>
            <p className="text-sm text-primary-foreground/80">Contact agricultural officers in your area</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.search2 || 'Search officers...'}
              className="pl-10 bg-card/90 border-0 min-h-[44px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => loadOfficers()} disabled={loadingOfficers} className="min-h-[44px] min-w-[44px]">
            <RefreshCw className={`w-4 h-4 ${loadingOfficers ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                selectedRole === role ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground shadow-card'
              }`}
            >
              <span>{role === 'all' ? '👨‍🌾' : role.includes('Vet') ? '👨‍⚕️' : '🌾'}</span>
              <span className="text-sm font-medium">{role === 'all' ? 'All' : role}</span>
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
          {(filterState || filterDistrict || searchQuery || selectedRole !== 'all') && (
            <Button variant="outline" size="sm" onClick={() => { setFilterState(''); setFilterDistrict(''); setSearchQuery(''); setSelectedRole('all'); }} className="min-h-[44px] text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {filteredOfficers.length > 0 && !loadingOfficers && (
          <p className="text-xs text-muted-foreground mb-2">
            Showing {filteredOfficers.length} {filteredOfficers.length === 1 ? 'officer' : 'officers'}
          </p>
        )}

        <div className="space-y-3 mt-4">
          {loadingOfficers && officers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading officers...</p>
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-4xl mb-3">👨‍🌾</div>
              <p className="text-sm font-medium text-foreground mb-1">No officers found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            filteredOfficers.map((officer) => (
              <div key={officer.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                    <span>{officer.role.includes('Vet') ? '👨‍⚕️' : '👨‍🌾'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{officer.name}</h3>
                        <p className="text-sm text-primary font-medium">{officer.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{officer.district}, {officer.state}</span>
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <span className="text-xs font-medium text-foreground">{officer.experience_years} years</span>
                          {officer.created_at && (
                            <span className="text-xs text-muted-foreground ml-1">
                              • {new Date(officer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📍 {officer.office_address}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1 min-h-[40px]"
                    onClick={() => setSelectedOfficer(officer)}
                  >
                    <Calendar className="w-3 h-3" />
                    Request Visit
                  </Button>
                  <a href={`tel:${officer.phone}`} className="flex-1">
                    <Button size="sm" className="w-full gap-1 min-h-[40px]" variant="outline">
                      <Phone className="w-3 h-3" />
                      {t.call}
                    </Button>
                  </a>
                  <a href={`https://wa.me/${officer.phone}?text=Hi ${officer.name}, I need assistance regarding agriculture.`} target="_blank" rel="noopener noreferrer" className="flex-1">
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

      {selectedOfficer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Request Visit - {selectedOfficer.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedOfficer.role} • {selectedOfficer.office_address}</p>
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
            <textarea
              placeholder="Purpose of visit *"
              className="w-full bg-card/90 border-0 rounded-md p-3 min-h-[80px] text-sm"
              value={bookingPurpose}
              onChange={(e) => setBookingPurpose(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSelectedOfficer(null); setBookingDate(''); setBookingTime(''); setBookingName(''); setBookingPhone(''); setBookingPurpose(''); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleBooking} disabled={booking}>
                {booking ? 'Requesting...' : 'Request Visit'}
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

export default AgriOfficersScreen;
