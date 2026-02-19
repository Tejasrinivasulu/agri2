import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, Phone, MessageCircle, Search, RefreshCw, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface LandRentingScreenProps {
  onBack: () => void;
}

type Tab = 'rent-in' | 'rent-out';

interface LandRental {
  id: string;
  owner_name: string;
  land_size_acres: number;
  rent_price_per_acre: number;
  district: string;
  state: string;
  soil_type: string;
  contact_number: string;
  created_at?: string;
}

const STORAGE_KEY = 'land_rentals_local';

const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay'];

const SAMPLE_RENTALS: LandRental[] = [
  { id: '1', owner_name: 'Raju Farm', land_size_acres: 5, rent_price_per_acre: 15000, district: 'Chennai', state: 'Tamil Nadu', soil_type: 'Alluvial', contact_number: '9876543210', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', owner_name: 'Green Fields', land_size_acres: 10, rent_price_per_acre: 12000, district: 'Thanjavur', state: 'Tamil Nadu', soil_type: 'Black', contact_number: '9876543211', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', owner_name: 'Krishna Farms', land_size_acres: 8, rent_price_per_acre: 18000, district: 'Coimbatore', state: 'Tamil Nadu', soil_type: 'Red', contact_number: '9876543212', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', owner_name: 'Suresh Reddy', land_size_acres: 15, rent_price_per_acre: 10000, district: 'Madurai', state: 'Tamil Nadu', soil_type: 'Alluvial', contact_number: '9876543213', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStoredRentals = (): LandRental[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredRentals = (items: LandRental[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const LandRentingScreen: React.FC<LandRentingScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('rent-in');
  const [rentals, setRentals] = useState<LandRental[]>(SAMPLE_RENTALS);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterSoilType, setFilterSoilType] = useState<string>('');

  // Rent-Out form state
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [landSize, setLandSize] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [soilType, setSoilType] = useState('Alluvial');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  const [contactNumber, setContactNumber] = useState('');

  const districtOptions = state ? STATES_DISTRICTS[state] ?? [] : [];
  const filterDistrictOptions = filterState ? STATES_DISTRICTS[filterState] ?? [] : [];

  useEffect(() => {
    if (activeTab === 'rent-in') {
      void loadRentals();
    }
  }, [activeTab]);

  const loadRentals = async () => {
    setLoadingRentals(true);
    const localRentals = getStoredRentals();
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      const supabasePromise = supabase.from('land_rentals').select('*').order('created_at', { ascending: false });
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
      const dbRentals = (data || []).map((r: any) => ({
        id: r.id,
        owner_name: r.owner_name,
        land_size_acres: Number(r.land_size_acres),
        rent_price_per_acre: Number(r.rent_price_per_acre),
        district: r.district,
        state: r.state,
        soil_type: r.soil_type,
        contact_number: r.contact_number,
        created_at: r.created_at,
      }));
      const merged = [...dbRentals, ...localRentals.filter((l) => !dbRentals.some((d) => d.id === l.id))];
      setRentals(merged.length > 0 ? merged : [...SAMPLE_RENTALS, ...localRentals]);
    } catch {
      const combined = localRentals.length > 0 ? localRentals : SAMPLE_RENTALS;
      setRentals(combined);
    } finally {
      setLoadingRentals(false);
    }
  };

  const validatePostForm = () => {
    if (!ownerName.trim()) return 'Please enter owner name.';
    if (!landSize || Number(landSize) <= 0) return 'Please enter valid land size.';
    if (!rentPrice || Number(rentPrice) <= 0) return 'Please enter valid rent price per acre.';
    if (!state || !district) return 'Please select state and district.';
    if (!contactNumber.trim()) return 'Please enter contact number.';
    const cleaned = contactNumber.replace(/[^0-9]/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) return 'Please enter a valid phone number (10-15 digits).';
    return null;
  };

  const handlePostRental = async () => {
    setPostError(null);
    setPostSuccess(null);
    const validationError = validatePostForm();
    if (validationError) {
      setPostError(validationError);
      return;
    }

    setPosting(true);
    const payload = {
      owner_name: ownerName.trim(),
      land_size_acres: Number(landSize),
      rent_price_per_acre: Number(rentPrice),
      district,
      state,
      soil_type: soilType,
      contact_number: contactNumber.replace(/[^0-9]/g, ''),
    };

    const newRental: LandRental = {
      id: `local-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };

    // Add immediately
    setRentals(prev => [newRental, ...prev]);
    const stored = getStoredRentals();
    stored.unshift(newRental);
    saveStoredRentals(stored);

    // Try Supabase
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      const supabasePromise = supabase.from('land_rentals').insert([payload]);
      await Promise.race([supabasePromise, timeoutPromise]);
    } catch (err) {
      console.log('Saved to localStorage');
    }

    setPostSuccess('✅ Your land listing has been posted successfully!');
    setOwnerName('');
    setLandSize('');
    setRentPrice('');
    setContactNumber('');
    setTimeout(() => {
      setActiveTab('rent-in');
      setTimeout(() => setPostSuccess(null), 3000);
    }, 1000);
    setPosting(false);
  };

  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      if (filterState && rental.state !== filterState) return false;
      if (filterDistrict && rental.district !== filterDistrict) return false;
      if (filterSoilType && rental.soil_type !== filterSoilType) return false;
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        return (
          rental.owner_name.toLowerCase().includes(term) ||
          rental.district.toLowerCase().includes(term) ||
          rental.soil_type.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [rentals, filterState, filterDistrict, filterSoilType, searchQuery]);

  const renderRentInTab = () => (
    <>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search land..."
            className="pl-10 bg-card/90 border-0 min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => loadRentals()} disabled={loadingRentals} className="min-h-[44px] min-w-[44px]">
          <RefreshCw className={`w-4 h-4 ${loadingRentals ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Select value={filterState || undefined} onValueChange={(val) => { setFilterState(val === "all" ? "" : val); setFilterDistrict(''); }}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any State</SelectItem>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDistrict || undefined} onValueChange={(val) => setFilterDistrict(val === "all" ? "" : val)} disabled={!filterState}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any District</SelectItem>
            {filterDistrictOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSoilType || undefined} onValueChange={(val) => setFilterSoilType(val === "all" ? "" : val)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="Soil Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Soil</SelectItem>
            {soilTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterState || filterDistrict || filterSoilType || searchQuery) && (
          <Button variant="outline" size="sm" onClick={() => { setFilterState(''); setFilterDistrict(''); setFilterSoilType(''); setSearchQuery(''); }} className="min-h-[44px] text-xs">
            Clear
          </Button>
        )}
      </div>

      {filteredRentals.length > 0 && !loadingRentals && (
        <p className="text-xs text-muted-foreground mb-2 mt-3">
          Showing {filteredRentals.length} {filteredRentals.length === 1 ? 'listing' : 'listings'}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {loadingRentals && rentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading land listings...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-sm font-medium text-foreground mb-1">No land listings found</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery || filterState || filterDistrict || filterSoilType ? 'Try adjusting your filters.' : 'Be the first to list land for rent!'}
            </p>
          </div>
        ) : (
          filteredRentals.map((rental) => {
            const totalRent = rental.land_size_acres * rental.rent_price_per_acre;
            return (
              <div key={rental.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{rental.owner_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      📍 {rental.district}, {rental.state}
                      {rental.created_at && <span className="ml-2">• {new Date(rental.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    </p>
                  </div>
                  <span className="text-2xl">🏞️</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-bold text-foreground">{rental.land_size_acres} acres</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Soil</p>
                    <p className="font-bold text-foreground">{rental.soil_type}</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Per Acre</p>
                    <p className="font-bold text-primary flex items-center justify-center gap-1 text-xs">
                      <IndianRupee className="w-3 h-3" />
                      {rental.rent_price_per_acre.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="bg-accent/20 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Total Annual Rent</p>
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {totalRent.toLocaleString('en-IN')} / year
                  </p>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${rental.contact_number}`} className="flex-1">
                    <Button size="sm" className="w-full gap-1 min-h-[40px]">
                      <Phone className="w-3 h-3" />
                      {t.call}
                    </Button>
                  </a>
                  <a href={`https://wa.me/${rental.contact_number}?text=Hi, I'm interested in renting your ${rental.land_size_acres} acres land in ${rental.district}.`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" className="w-full gap-1 min-h-[40px]" variant="outline">
                      <MessageCircle className="w-3 h-3" />
                      {t.message}
                    </Button>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  const renderRentOutTab = () => (
    <div className="space-y-3 mt-2">
      {postError && (
        <div className="text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 rounded-lg p-3 border border-destructive/20">
          ⚠️ {postError}
        </div>
      )}
      {postSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {postSuccess}
        </div>
      )}

      <Input
        placeholder="Owner Name *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
      />

      <Input
        type="number"
        min="0"
        step="0.1"
        placeholder="Land Size (Acres) *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={landSize}
        onChange={(e) => setLandSize(e.target.value)}
      />

      <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
        <IndianRupee className="w-4 h-4 text-muted-foreground" />
        <Input
          type="number"
          min="0"
          placeholder="Rent Price per Acre (₹) *"
          className="bg-transparent border-0 px-0 min-h-[44px]"
          value={rentPrice}
          onChange={(e) => setRentPrice(e.target.value)}
        />
      </div>

      <Select value={soilType} onValueChange={setSoilType}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Soil Type *" />
        </SelectTrigger>
        <SelectContent>
          {soilTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={state} onValueChange={(val) => { setState(val); setDistrict(''); }}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Select State *" />
        </SelectTrigger>
        <SelectContent>
          {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={district} onValueChange={setDistrict} disabled={!state || districtOptions.length === 0}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder={state ? 'Select District *' : 'Select State first'} />
        </SelectTrigger>
        <SelectContent>
          {districtOptions.length > 0 ? districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>) : <SelectItem value="none" disabled>No districts available</SelectItem>}
        </SelectContent>
      </Select>

      <Input
        type="tel"
        placeholder="Contact Number (10 digits) *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={contactNumber}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
          setContactNumber(value);
        }}
        maxLength={15}
      />

      <Button
        className="w-full min-h-[48px] text-base font-semibold mt-2 shadow-lg hover:shadow-xl transition-all"
        onClick={handlePostRental}
        disabled={posting}
        size="lg"
      >
        {posting ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            🗺️ Post Land for Rent
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
            <h1 className="text-xl font-bold text-primary-foreground">{t.landRenting || 'Land Rent'} 🗺️</h1>
            <p className="text-sm text-primary-foreground/80">Rent-in or rent-out agricultural land</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            variant={activeTab === 'rent-in' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'rent-in' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('rent-in')}
          >
            🔍 Rent-In
          </Button>
          <Button
            variant={activeTab === 'rent-out' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'rent-out' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('rent-out')}
          >
            📝 Rent-Out
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'rent-in' ? renderRentInTab() : renderRentOutTab()}
      </div>
    </div>
  );
};

export default LandRentingScreen;
