import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Phone, MessageCircle, Search, RefreshCw, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface CattlePetsScreenProps {
  onBack: () => void;
}

type Tab = 'buy' | 'sell';

interface AnimalListing {
  id: string;
  animal_type: string;
  breed: string;
  age: string;
  price: number;
  health_status: string;
  vaccinated: boolean;
  district: string;
  state: string;
  seller_name: string;
  phone: string;
  created_at?: string;
}

const STORAGE_KEY = 'animal_listings_local';

const animalTypes = ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Dog', 'Cat', 'Chicken', 'Duck'];
const animalEmojis: Record<string, string> = {
  'Cow': '🐄', 'Buffalo': '🐃', 'Goat': '🐐', 'Sheep': '🐑',
  'Dog': '🐕', 'Cat': '🐈', 'Chicken': '🐔', 'Duck': '🦆'
};

const SAMPLE_LISTINGS: AnimalListing[] = [
  { id: '1', animal_type: 'Cow', breed: 'Holstein Friesian', age: '3 years', price: 45000, health_status: 'Healthy', vaccinated: true, district: 'Chennai', state: 'Tamil Nadu', seller_name: 'Raju Farm', phone: '9876543210', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', animal_type: 'Buffalo', breed: 'Murrah', age: '4 years', price: 55000, health_status: 'Healthy', vaccinated: true, district: 'Thanjavur', state: 'Tamil Nadu', seller_name: 'Green Fields', phone: '9876543211', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', animal_type: 'Goat', breed: 'Boer', age: '1 year', price: 8000, health_status: 'Healthy', vaccinated: true, district: 'Coimbatore', state: 'Tamil Nadu', seller_name: 'Krishna Farms', phone: '9876543212', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', animal_type: 'Dog', breed: 'Labrador', age: '6 months', price: 12000, health_status: 'Healthy', vaccinated: true, district: 'Chennai', state: 'Tamil Nadu', seller_name: 'Pet Care', phone: '9876543213', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStoredListings = (): AnimalListing[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredListings = (items: AnimalListing[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const CattlePetsScreen: React.FC<CattlePetsScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  
  // Ensure component renders even if context fails
  if (!t) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Loading Cattle & Pets...</p>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [listings, setListings] = useState<AnimalListing[]>(SAMPLE_LISTINGS);
  const [loadingListings, setLoadingListings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');

  // Sell form state
  const [selling, setSelling] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellSuccess, setSellSuccess] = useState<string | null>(null);
  const [sellAnimalType, setSellAnimalType] = useState('Cow');
  const [sellBreed, setSellBreed] = useState('');
  const [sellAge, setSellAge] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellHealthStatus, setSellHealthStatus] = useState('Healthy');
  const [sellVaccinated, setSellVaccinated] = useState(true);
  const [sellState, setSellState] = useState('Tamil Nadu');
  const [sellDistrict, setSellDistrict] = useState('Chennai');
  const [sellSellerName, setSellSellerName] = useState('');
  const [sellPhone, setSellPhone] = useState('');

  const districtOptions = sellState ? STATES_DISTRICTS[sellState] ?? [] : [];
  const filterDistrictOptions = filterState ? STATES_DISTRICTS[filterState] ?? [] : [];

  useEffect(() => {
    void loadListings();
  }, [activeTab]);

  const loadListings = async () => {
    setLoadingListings(true);
    const localListings = getStoredListings();
    
    // Show sample data immediately
    const initialData = localListings.length > 0 ? localListings : SAMPLE_LISTINGS;
    setListings(initialData);
    setLoadingListings(false);
    
    // Try to load from Supabase in background (non-blocking)
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const supabasePromise = supabase
        .from('animal_listings')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      
      if (error) throw error;
      const dbListings = (data || []).map((r: any) => ({
        id: r.id,
        animal_type: r.animal_type,
        breed: r.breed,
        age: r.age,
        price: Number(r.price),
        health_status: r.health_status || 'Healthy',
        vaccinated: r.vaccinated ?? true,
        district: r.district,
        state: r.state,
        seller_name: r.seller_name,
        phone: r.phone,
        created_at: r.created_at,
      }));
      const merged = [...dbListings, ...localListings.filter((l) => !dbListings.some((d) => d.id === l.id))];
      setListings(merged.length > 0 ? merged : [...SAMPLE_LISTINGS, ...localListings]);
    } catch (err) {
      // Connection failed - use local/sample data (already set above)
      console.log('Using local data:', err);
    }
  };

  const validateSellForm = () => {
    if (!sellBreed.trim()) return 'Please enter breed.';
    if (!sellAge.trim()) return 'Please enter age.';
    if (!sellPrice || Number(sellPrice) <= 0) return 'Please enter a valid price.';
    if (!sellState || !sellDistrict) return 'Please select state and district.';
    if (!sellSellerName.trim()) return 'Please enter your name.';
    if (!sellPhone.trim()) return 'Please enter your phone number.';
    const cleaned = sellPhone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) return 'Please enter a valid phone number (10-15 digits).';
    return null;
  };

  const handlePostListing = async () => {
    setSellError(null);
    setSellSuccess(null);
    const validationError = validateSellForm();
    if (validationError) {
      setSellError(validationError);
      return;
    }

    setSelling(true);
    const payload = {
      animal_type: sellAnimalType,
      breed: sellBreed.trim(),
      age: sellAge.trim(),
      price: Number(sellPrice),
      health_status: sellHealthStatus,
      vaccinated: sellVaccinated,
      state: sellState,
      district: sellDistrict,
      seller_name: sellSellerName.trim(),
      phone: sellPhone.replace(/[^0-9]/g, ''),
    };

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      const supabasePromise = supabase.from('animal_listings').insert([payload]);
      const { error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
    } catch (err) {
      // Supabase failed - save to localStorage
      console.log('Saving to localStorage:', err);
      const newListing: AnimalListing = {
        id: `local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      const stored = getStoredListings();
      stored.unshift(newListing);
      saveStoredListings(stored);
    }

    // Add to listings immediately for instant visibility
    const newListing: AnimalListing = {
      id: `local-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    
    // Update listings immediately
    setListings(prev => [newListing, ...prev]);
    
    setSellSuccess('✅ Your animal listing has been posted successfully!');
    setSellBreed('');
    setSellAge('');
    setSellPrice('');
    setSellSellerName('');
    setSellPhone('');
    
    // Switch to buy tab immediately to show the new listing
    setTimeout(() => {
      setActiveTab('buy');
      // Refresh listings to merge with any Supabase data
      void loadListings();
      setTimeout(() => setSellSuccess(null), 3000);
    }, 500);
    setSelling(false);
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (filterType && item.animal_type !== filterType) return false;
      if (filterState && item.state !== filterState) return false;
      if (filterDistrict && item.district !== filterDistrict) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          item.animal_type.toLowerCase().includes(term) ||
          item.breed.toLowerCase().includes(term) ||
          item.seller_name.toLowerCase().includes(term) ||
          item.district.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [listings, filterType, filterState, filterDistrict, searchTerm]);

  const renderBuyTab = () => (
    <>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search animals..."
            className="pl-10 bg-card/90 border-0 min-h-[44px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => loadListings()} disabled={loadingListings} className="min-h-[44px] min-w-[44px]">
          <RefreshCw className={`w-4 h-4 ${loadingListings ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('')}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            !filterType ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground shadow-card'
          }`}
        >
          <span>🐾</span>
          <span className="text-sm font-medium">All</span>
        </button>
        {animalTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              filterType === type ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground shadow-card'
            }`}
          >
            <span>{animalEmojis[type]}</span>
            <span className="text-sm font-medium">{type}</span>
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
        {(filterState || filterDistrict || searchTerm || filterType) && (
          <Button variant="outline" size="sm" onClick={() => { setFilterState(''); setFilterDistrict(''); setSearchTerm(''); setFilterType(''); }} className="min-h-[44px] text-xs">
            Clear
          </Button>
        )}
      </div>

      {filteredListings.length > 0 && !loadingListings && (
        <p className="text-xs text-muted-foreground mb-2 mt-3">
          Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {loadingListings && listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">🐾</div>
            <p className="text-sm font-medium text-foreground mb-1">No listings found</p>
            <p className="text-xs text-muted-foreground">
              {searchTerm || filterType || filterState || filterDistrict ? 'Try adjusting your filters.' : 'Be the first to post an animal listing!'}
            </p>
          </div>
        ) : (
          filteredListings.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl p-4 shadow-card space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  <span>{animalEmojis[item.animal_type] || '🐾'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.breed} {item.animal_type}</h3>
                      <p className="text-xs text-muted-foreground">
                        👤 {item.seller_name} • 📍 {item.district}, {item.state}
                        {item.created_at && <span className="ml-2">• {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                      </p>
                    </div>
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {item.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full font-medium">
                      🎂 {item.age}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.health_status === 'Healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                      {item.health_status === 'Healthy' ? '✅' : '⚠️'} {item.health_status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.vaccinated ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                      {item.vaccinated ? '💉 Vaccinated' : '❌ Not Vaccinated'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${item.phone}`} className="flex-1">
                  <Button size="sm" className="w-full gap-1 min-h-[40px]" variant="outline">
                    <Phone className="w-3 h-3" />
                    {t.call}
                  </Button>
                </a>
                <a href={`https://wa.me/${item.phone}?text=Hi, I'm interested in your ${item.breed} ${item.animal_type} listing.`} target="_blank" rel="noopener noreferrer" className="flex-1">
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
    </>
  );

  const renderSellTab = () => (
    <div className="space-y-3 mt-2">
      {sellError && (
        <div className="text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 rounded-lg p-3 border border-destructive/20">
          ⚠️ {sellError}
        </div>
      )}
      {sellSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {sellSuccess}
        </div>
      )}

      <Select value={sellAnimalType} onValueChange={setSellAnimalType}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Animal Type *" />
        </SelectTrigger>
        <SelectContent>
          {animalTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {animalEmojis[type]} {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Breed *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellBreed}
        onChange={(e) => setSellBreed(e.target.value)}
      />

      <Input
        placeholder="Age (e.g., 2 years, 6 months) *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellAge}
        onChange={(e) => setSellAge(e.target.value)}
      />

      <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
        <IndianRupee className="w-4 h-4 text-muted-foreground" />
        <Input
          type="number"
          min="0"
          placeholder="Price *"
          className="bg-transparent border-0 px-0 min-h-[44px]"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
        />
      </div>

      <Select value={sellHealthStatus} onValueChange={setSellHealthStatus}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Health Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Healthy">✅ Healthy</SelectItem>
          <SelectItem value="Good">👍 Good</SelectItem>
          <SelectItem value="Fair">⚠️ Fair</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-3 bg-card/90 rounded-md p-3 min-h-[44px]">
        <input
          type="checkbox"
          checked={sellVaccinated}
          onChange={(e) => setSellVaccinated(e.target.checked)}
          className="w-4 h-4"
        />
        <label className="text-sm">💉 Vaccinated</label>
      </div>

      <Select value={sellState} onValueChange={(val) => { setSellState(val); setSellDistrict(''); }}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Select State *" />
        </SelectTrigger>
        <SelectContent>
          {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={sellDistrict} onValueChange={setSellDistrict} disabled={!sellState || districtOptions.length === 0}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder={sellState ? 'Select District *' : 'Select State first'} />
        </SelectTrigger>
        <SelectContent>
          {districtOptions.length > 0 ? districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>) : <SelectItem value="none" disabled>No districts available</SelectItem>}
        </SelectContent>
      </Select>

      <Input
        placeholder="Your name *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellSellerName}
        onChange={(e) => setSellSellerName(e.target.value)}
      />

      <Input
        type="tel"
        placeholder="Your phone number (10 digits) *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellPhone}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
          setSellPhone(value);
        }}
        maxLength={15}
      />

      <Button className="w-full min-h-[48px] text-base font-semibold mt-2 shadow-lg hover:shadow-xl transition-all" onClick={handlePostListing} disabled={selling} size="lg">
        {selling ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            💰 Post Animal Listing
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
            <h1 className="text-xl font-bold text-primary-foreground">{t?.cattlePets || 'Cattle & Pets'} 🐄</h1>
            <p className="text-sm text-primary-foreground/80">Buy and sell livestock and pets</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            variant={activeTab === 'buy' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'buy' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('buy')}
          >
            🛒 {t.buy}
          </Button>
          <Button
            variant={activeTab === 'sell' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'sell' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('sell')}
          >
            💰 {t.sell}
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'buy' ? renderBuyTab() : renderSellTab()}
      </div>
    </div>
  );
};

export default CattlePetsScreen;
