import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Phone, MessageCircle, Search, RefreshCw, IndianRupee, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface AgriToolsScreenProps {
  onBack: () => void;
}

type Tab = 'buy' | 'rent' | 'sell';

interface ToolListing {
  id: string;
  tool_name: string;
  category: string;
  rent_price_per_day: number;
  sale_price: number;
  district: string;
  state: string;
  owner_name: string;
  phone: string;
  availability: string;
  created_at?: string;
}

const STORAGE_KEY = 'agri_tools_local';

const toolCategories = ['Tractor', 'Rotavator', 'Seed Drill', 'Sprayer', 'Harvester', 'Plough', 'Cultivator', 'Fertilizer Spreader'];
const toolEmojis: Record<string, string> = {
  'Tractor': '🚜', 'Rotavator': '⚙️', 'Seed Drill': '🌱', 'Sprayer': '💨',
  'Harvester': '🌾', 'Plough': '🔧', 'Cultivator': '🛠️', 'Fertilizer Spreader': '🧪'
};

const SAMPLE_TOOLS: ToolListing[] = [
  { id: '1', tool_name: 'Tractor', category: 'Tractor', rent_price_per_day: 1500, sale_price: 450000, district: 'Chennai', state: 'Tamil Nadu', owner_name: 'Farm Equipment Co', phone: '9876543210', availability: 'Available', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', tool_name: 'Rotavator', category: 'Rotavator', rent_price_per_day: 800, sale_price: 85000, district: 'Thanjavur', state: 'Tamil Nadu', owner_name: 'Green Fields', phone: '9876543211', availability: 'Available', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', tool_name: 'Sprayer', category: 'Sprayer', rent_price_per_day: 300, sale_price: 25000, district: 'Coimbatore', state: 'Tamil Nadu', owner_name: 'Agri Solutions', phone: '9876543212', availability: 'Available', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', tool_name: 'Seed Drill', category: 'Seed Drill', rent_price_per_day: 600, sale_price: 65000, district: 'Madurai', state: 'Tamil Nadu', owner_name: 'Krishna Farms', phone: '9876543213', availability: 'Available', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStoredTools = (): ToolListing[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredTools = (items: ToolListing[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const AgriToolsScreen: React.FC<AgriToolsScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  
  // Ensure component renders even if context fails
  if (!t) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Loading Agri Tools...</p>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<Tab>('rent');
  const [tools, setTools] = useState<ToolListing[]>(SAMPLE_TOOLS);
  const [loadingTools, setLoadingTools] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');

  // Sell form state
  const [selling, setSelling] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellSuccess, setSellSuccess] = useState<string | null>(null);
  const [sellToolName, setSellToolName] = useState('Tractor');
  const [sellCategory, setSellCategory] = useState('Tractor');
  const [sellRentPrice, setSellRentPrice] = useState('');
  const [sellSalePrice, setSellSalePrice] = useState('');
  const [sellState, setSellState] = useState('Tamil Nadu');
  const [sellDistrict, setSellDistrict] = useState('Chennai');
  const [sellOwnerName, setSellOwnerName] = useState('');
  const [sellPhone, setSellPhone] = useState('');
  const [sellAvailability, setSellAvailability] = useState('Available');

  // Booking state
  const [selectedTool, setSelectedTool] = useState<ToolListing | null>(null);
  const [bookingDays, setBookingDays] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const districtOptions = sellState ? STATES_DISTRICTS[sellState] ?? [] : [];
  const filterDistrictOptions = filterState ? STATES_DISTRICTS[filterState] ?? [] : [];

  useEffect(() => {
    void loadTools();
  }, [activeTab]);

  const loadTools = async () => {
    setLoadingTools(true);
    const localTools = getStoredTools();
    
    // Show sample data immediately
    const initialData = localTools.length > 0 ? localTools : SAMPLE_TOOLS;
    setTools(initialData);
    setLoadingTools(false);
    
    // Try to load from Supabase in background (non-blocking)
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const supabasePromise = supabase
        .from('agri_tools')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      
      if (error) throw error;
      const dbTools = (data || []).map((r: any) => ({
        id: r.id,
        tool_name: r.tool_name,
        category: r.category || r.tool_name,
        rent_price_per_day: Number(r.rent_price_per_day) || 0,
        sale_price: Number(r.sale_price) || 0,
        district: r.district,
        state: r.state,
        owner_name: r.owner_name,
        phone: r.phone,
        availability: r.availability || 'Available',
        created_at: r.created_at,
      }));
      const merged = [...dbTools, ...localTools.filter((l) => !dbTools.some((d) => d.id === l.id))];
      setTools(merged.length > 0 ? merged : [...SAMPLE_TOOLS, ...localTools]);
    } catch (err) {
      // Connection failed - use local/sample data (already set above)
      console.log('Using local data:', err);
    }
  };

  const validateSellForm = () => {
    if (!sellToolName.trim()) return 'Please select tool name.';
    if (!sellRentPrice || Number(sellRentPrice) < 0) return 'Please enter rent price per day (0 if not for rent).';
    if (!sellSalePrice || Number(sellSalePrice) < 0) return 'Please enter sale price (0 if not for sale).';
    if (Number(sellRentPrice) === 0 && Number(sellSalePrice) === 0) return 'Please enter at least rent or sale price.';
    if (!sellState || !sellDistrict) return 'Please select state and district.';
    if (!sellOwnerName.trim()) return 'Please enter owner name.';
    if (!sellPhone.trim()) return 'Please enter phone number.';
    const cleaned = sellPhone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) return 'Please enter a valid phone number (10-15 digits).';
    return null;
  };

  const handlePostTool = async () => {
    setSellError(null);
    setSellSuccess(null);
    const validationError = validateSellForm();
    if (validationError) {
      setSellError(validationError);
      return;
    }

    setSelling(true);
    const payload = {
      tool_name: sellToolName.trim(),
      category: sellCategory,
      rent_price_per_day: Number(sellRentPrice) || 0,
      sale_price: Number(sellSalePrice) || 0,
      state: sellState,
      district: sellDistrict,
      owner_name: sellOwnerName.trim(),
      phone: sellPhone.replace(/[^0-9]/g, ''),
      availability: sellAvailability,
    };

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      const supabasePromise = supabase.from('agri_tools').insert([payload]);
      const { error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
    } catch (err) {
      // Supabase failed - save to localStorage
      console.log('Saving to localStorage:', err);
      const newTool: ToolListing = {
        id: `local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      const stored = getStoredTools();
      stored.unshift(newTool);
      saveStoredTools(stored);
    }

    // Add to tools immediately for instant visibility
    const newTool: ToolListing = {
      id: `local-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    
    // Update tools immediately
    setTools(prev => [newTool, ...prev]);
    
    setSellSuccess('✅ Your tool listing has been posted successfully!');
    setSellToolName('Tractor');
    setSellCategory('Tractor');
    setSellRentPrice('');
    setSellSalePrice('');
    setSellOwnerName('');
    setSellPhone('');
    
    // Switch to rent tab immediately to show the new listing
    setTimeout(() => {
      setActiveTab('rent');
      // Refresh tools to merge with any Supabase data
      void loadTools();
      setTimeout(() => setSellSuccess(null), 3000);
    }, 500);
    setSelling(false);
  };

  const handleBooking = () => {
    if (!selectedTool) return;
    if (!bookingDays || Number(bookingDays) <= 0) {
      alert('Please enter number of days.');
      return;
    }
    if (!bookingDate) {
      alert('Please select start date.');
      return;
    }
    if (!bookingName.trim() || !bookingPhone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }

    setBooking(true);
    const totalCost = Number(bookingDays) * selectedTool.rent_price_per_day;
    setTimeout(() => {
      setBookingSuccess(`✅ Booking confirmed! Total cost: ₹${totalCost.toLocaleString('en-IN')} for ${bookingDays} days. Owner will contact you soon.`);
      setSelectedTool(null);
      setBookingDays('');
      setBookingDate('');
      setBookingName('');
      setBookingPhone('');
      setTimeout(() => {
        setBookingSuccess(null);
        setBooking(false);
      }, 5000);
    }, 1000);
  };

  const filteredTools = useMemo(() => {
    return tools.filter((item) => {
      if (filterCategory && item.category !== filterCategory) return false;
      if (filterState && item.state !== filterState) return false;
      if (filterDistrict && item.district !== filterDistrict) return false;
      if (activeTab === 'rent' && item.rent_price_per_day === 0) return false;
      if (activeTab === 'buy' && item.sale_price === 0) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          item.tool_name.toLowerCase().includes(term) ||
          item.owner_name.toLowerCase().includes(term) ||
          item.district.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [tools, filterCategory, filterState, filterDistrict, searchTerm, activeTab]);

  const renderBuyRentTab = () => (
    <>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            className="pl-10 bg-card/90 border-0 min-h-[44px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => loadTools()} disabled={loadingTools} className="min-h-[44px] min-w-[44px]">
          <RefreshCw className={`w-4 h-4 ${loadingTools ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterCategory('')}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            !filterCategory ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground shadow-card'
          }`}
        >
          <span>🔧</span>
          <span className="text-sm font-medium">All</span>
        </button>
        {toolCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              filterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground shadow-card'
            }`}
          >
            <span>{toolEmojis[cat] || '🔧'}</span>
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
        {(filterState || filterDistrict || searchTerm || filterCategory) && (
          <Button variant="outline" size="sm" onClick={() => { setFilterState(''); setFilterDistrict(''); setSearchTerm(''); setFilterCategory(''); }} className="min-h-[44px] text-xs">
            Clear
          </Button>
        )}
      </div>

      {filteredTools.length > 0 && !loadingTools && (
        <p className="text-xs text-muted-foreground mb-2 mt-3">
          Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {loadingTools && tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading tools...</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">🚜</div>
            <p className="text-sm font-medium text-foreground mb-1">No tools found</p>
            <p className="text-xs text-muted-foreground">
              {searchTerm || filterCategory || filterState || filterDistrict ? 'Try adjusting your filters.' : 'Be the first to list a tool!'}
            </p>
          </div>
        ) : (
          filteredTools.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl p-4 shadow-card space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  <span>{toolEmojis[item.category] || toolEmojis[item.tool_name] || '🔧'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.tool_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        👤 {item.owner_name} • 📍 {item.district}, {item.state}
                        {item.created_at && <span className="ml-2">• {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.availability === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {item.availability}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeTab === 'rent' && item.rent_price_per_day > 0 && (
                      <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {item.rent_price_per_day.toLocaleString('en-IN')}/day
                      </span>
                    )}
                    {activeTab === 'buy' && item.sale_price > 0 && (
                      <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {item.sale_price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {activeTab === 'rent' && item.rent_price_per_day > 0 && item.availability === 'Available' && (
                  <Button
                    size="sm"
                    className="flex-1 gap-1 min-h-[40px]"
                    onClick={() => setSelectedTool(item)}
                  >
                    <Calendar className="w-3 h-3" />
                    Book Now
                  </Button>
                )}
                <a href={`tel:${item.phone}`} className={activeTab === 'rent' && item.rent_price_per_day > 0 ? 'flex-1' : 'flex-1'}>
                  <Button size="sm" className="w-full gap-1 min-h-[40px]" variant="outline">
                    <Phone className="w-3 h-3" />
                    {t.call}
                  </Button>
                </a>
                <a href={`https://wa.me/${item.phone}?text=Hi, I'm interested in your ${item.tool_name} ${activeTab === 'rent' ? 'for rent' : 'for sale'}.`} target="_blank" rel="noopener noreferrer" className="flex-1">
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

      {selectedTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Book {selectedTool.tool_name}</h3>
            <p className="text-sm text-muted-foreground">Rent: ₹{selectedTool.rent_price_per_day.toLocaleString('en-IN')}/day</p>
            <Input
              type="number"
              min="1"
              placeholder="Number of days *"
              className="bg-card/90 border-0 min-h-[44px]"
              value={bookingDays}
              onChange={(e) => setBookingDays(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Start date *"
              className="bg-card/90 border-0 min-h-[44px]"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
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
            {bookingDays && Number(bookingDays) > 0 && (
              <p className="text-sm font-semibold text-primary">
                Total Cost: ₹{(Number(bookingDays) * selectedTool.rent_price_per_day).toLocaleString('en-IN')}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setSelectedTool(null); setBookingDays(''); setBookingDate(''); setBookingName(''); setBookingPhone(''); }}>
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

      <Select value={sellToolName} onValueChange={(val) => { setSellToolName(val); setSellCategory(val); }}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Tool Name *" />
        </SelectTrigger>
        <SelectContent>
          {toolCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {toolEmojis[cat]} {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
        <IndianRupee className="w-4 h-4 text-muted-foreground" />
        <Input
          type="number"
          min="0"
          placeholder="Rent price per day (₹) *"
          className="bg-transparent border-0 px-0 min-h-[44px]"
          value={sellRentPrice}
          onChange={(e) => setSellRentPrice(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
        <IndianRupee className="w-4 h-4 text-muted-foreground" />
        <Input
          type="number"
          min="0"
          placeholder="Sale price (₹) *"
          className="bg-transparent border-0 px-0 min-h-[44px]"
          value={sellSalePrice}
          onChange={(e) => setSellSalePrice(e.target.value)}
        />
      </div>

      <Select value={sellAvailability} onValueChange={setSellAvailability}>
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Available">✅ Available</SelectItem>
          <SelectItem value="Booked">📅 Booked</SelectItem>
          <SelectItem value="Unavailable">❌ Unavailable</SelectItem>
        </SelectContent>
      </Select>

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
        placeholder="Owner name *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellOwnerName}
        onChange={(e) => setSellOwnerName(e.target.value)}
      />

      <Input
        type="tel"
        placeholder="Phone number (10 digits) *"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellPhone}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
          setSellPhone(value);
        }}
        maxLength={15}
      />

      <Button className="w-full min-h-[48px] text-base font-semibold mt-2 shadow-lg hover:shadow-xl transition-all" onClick={handlePostTool} disabled={selling} size="lg">
        {selling ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            💰 Post Tool Listing
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
            <h1 className="text-xl font-bold text-primary-foreground">{t?.agriTools || 'Agri Tools'} 🚜</h1>
            <p className="text-sm text-primary-foreground/80">Buy or rent farming equipment</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            variant={activeTab === 'rent' ? 'secondary' : 'ghost'}
            className={`flex-1 min-h-[44px] ${activeTab === 'rent' ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
            onClick={() => setActiveTab('rent')}
          >
            📅 {t.rent}
          </Button>
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
        {activeTab === 'sell' ? renderSellTab() : renderBuyRentTab()}
      </div>
    </div>
  );
};

export default AgriToolsScreen;
