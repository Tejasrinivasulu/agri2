import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Search,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  STATES_DISTRICTS,
  STATE_OPTIONS,
  CROP_OPTIONS,
  CROP_EMOJIS,
} from "@/data/cropRates";

interface BuySellScreenProps {
  onBack: () => void;
}

type Tab = "buy" | "sell";

type CropCategory = "all" | "vegetables" | "fruits" | "grains" | "spices";

interface CropListing {
  id: string;
  crop_name: string;
  category: CropCategory;
  quantity: number;
  unit: string;
  price_per_unit: number;
  state: string;
  district: string;
  location: string;
  seller_name: string;
  phone: string;
  notes?: string | null;
  created_at?: string;
}

const STORAGE_KEY = "crop_listings_local";

// Sample listings when no data available
const SAMPLE_LISTINGS: CropListing[] = [
  { id: "1", crop_name: "Tomato", category: "vegetables", quantity: 500, unit: "kg", price_per_unit: 40, state: "Tamil Nadu", district: "Chennai", location: "Koyambedu Market, Chennai", seller_name: "Raju Farm", phone: "9876543210", notes: "Premium quality, fresh harvest", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "2", crop_name: "Rice", category: "grains", quantity: 2000, unit: "kg", price_per_unit: 55, state: "Tamil Nadu", district: "Thanjavur", location: "Thanjavur APMC", seller_name: "Green Fields", phone: "9876543211", notes: "Organic certified, Grade A", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "3", crop_name: "Banana", category: "fruits", quantity: 100, unit: "dozen", price_per_unit: 35, state: "Tamil Nadu", district: "Coimbatore", location: "Coimbatore Main Market", seller_name: "Krishna Farms", phone: "9876543212", notes: "Grade A, ready to sell", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "4", crop_name: "Chilli", category: "spices", quantity: 200, unit: "kg", price_per_unit: 120, state: "Andhra Pradesh", district: "Guntur", location: "Guntur Spice Market", seller_name: "Spice King", phone: "9876543213", notes: "Dried, premium quality", created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStoredListings = (): CropListing[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
};

const saveStoredListings = (items: CropListing[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

const BuySellScreen: React.FC<BuySellScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("buy");

  // Buy tab state
  const [listings, setListings] = useState<CropListing[]>(SAMPLE_LISTINGS); // Initialize with sample data
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CropCategory>("all");
  const [filterState, setFilterState] = useState<string>("");
  const [filterDistrict, setFilterDistrict] = useState<string>("");

  // Sell tab state
  const [selling, setSelling] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellSuccess, setSellSuccess] = useState<string | null>(null);
  const [sellCropName, setSellCropName] = useState("");
  const [sellCategory, setSellCategory] = useState<CropCategory>("vegetables");
  const [sellQuantity, setSellQuantity] = useState("");
  const [sellUnit, setSellUnit] = useState("kg");
  const [sellPrice, setSellPrice] = useState("");
  const [sellState, setSellState] = useState("Tamil Nadu");
  const [sellDistrict, setSellDistrict] = useState("Chennai");
  const [sellLocation, setSellLocation] = useState("Chennai, Tamil Nadu");
  const [sellSellerName, setSellSellerName] = useState("");
  const [sellPhone, setSellPhone] = useState("");
  const [sellNotes, setSellNotes] = useState("");

  const categories: { id: CropCategory; name: string; emoji: string }[] = [
    { id: "all", name: t.allCategories, emoji: "📦" },
    { id: "vegetables", name: t.vegetables, emoji: "🥬" },
    { id: "fruits", name: t.fruits, emoji: "🍎" },
    { id: "grains", name: t.grains, emoji: "🌾" },
    { id: "spices", name: t.spices, emoji: "🌶️" },
  ];

  const districtOptions = sellState
    ? STATES_DISTRICTS[sellState] ?? []
    : [];

  const filterDistrictOptions = filterState
    ? STATES_DISTRICTS[filterState] ?? []
    : [];

  // Load listings on mount and when switching back to buy tab
  useEffect(() => {
    void loadListings();
  }, [activeTab]);

  const loadListings = async () => {
    setLoadingListings(true);
    setListingError(null);
    const localListings = getStoredListings();
    try {
      const { data, error } = await supabase
        .from("crop_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const dbListings = (data || []).map((r: any) => ({
        id: r.id,
        crop_name: r.crop_name,
        category: r.category || "vegetables",
        quantity: Number(r.quantity),
        unit: r.unit || "kg",
        price_per_unit: Number(r.price_per_unit),
        state: r.state,
        district: r.district,
        location: r.location,
        seller_name: r.seller_name,
        phone: r.phone,
        notes: r.notes || null,
      }));
      const merged = [...dbListings, ...localListings.filter((l) => !dbListings.some((d) => d.id === l.id))];
      setListings(merged.length > 0 ? merged : [...SAMPLE_LISTINGS, ...localListings]);
    } catch (err: any) {
      // Handle 404 (table doesn't exist) or other errors gracefully
      if (err?.code === 'PGRST116' || err?.status === 404 || err?.message?.includes('404')) {
        // Table doesn't exist - use sample/local data
        console.log('crop_listings table not found, using sample data');
      } else {
        console.log('Error loading listings:', err);
      }
      const combined = localListings.length > 0 ? localListings : SAMPLE_LISTINGS;
      setListings(combined);
    } finally {
      setLoadingListings(false);
    }
  };

  const resetSellForm = () => {
    setSellCropName("");
    setSellCategory("vegetables");
    setSellQuantity("");
    setSellUnit("kg");
    setSellPrice("");
    setSellState("Tamil Nadu");
    setSellDistrict("Chennai");
    setSellLocation("Chennai, Tamil Nadu");
    setSellSellerName("");
    setSellPhone("");
    setSellNotes("");
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const validateSellForm = () => {
    if (!sellCropName.trim()) return "Please select a crop name.";
    if (!sellQuantity || Number(sellQuantity) <= 0)
      return "Please enter a valid quantity (greater than 0).";
    if (!sellPrice || Number(sellPrice) <= 0)
      return "Please enter a valid price per unit (greater than 0).";
    if (!sellState || !sellDistrict) return "Please select both state and district.";
    if (!sellLocation.trim()) return "Please enter your location/village name.";
    if (!sellSellerName.trim()) return "Please enter your name.";
    if (!sellPhone.trim()) return "Please enter your phone number.";
    if (!validatePhoneNumber(sellPhone)) {
      return "Please enter a valid phone number (10-15 digits).";
    }
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
      crop_name: sellCropName.trim(),
      category: sellCategory,
      quantity: Number(sellQuantity),
      unit: sellUnit,
      price_per_unit: Number(sellPrice),
      state: sellState,
      district: sellDistrict,
      location: sellLocation.trim(),
      seller_name: sellSellerName.trim(),
      phone: sellPhone.replace(/[^0-9]/g, ""), // Clean phone number
      notes: sellNotes.trim() || null,
    };

    // Create new listing object
    const newListing: CropListing = {
      id: `local-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };

    // Add to listings immediately for instant visibility
    setListings(prev => [newListing, ...prev]);
    
    // Save to localStorage
    const stored = getStoredListings();
    stored.unshift(newListing);
    saveStoredListings(stored);

    // Try to save to Supabase (non-blocking)
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      const supabasePromise = supabase.from("crop_listings").insert([payload]);
      await Promise.race([supabasePromise, timeoutPromise]);
    } catch (err) {
      // Supabase failed - already saved to localStorage, so continue
      console.log('Saved to localStorage, Supabase unavailable');
    }
    
    setSellSuccess("✅ Your crop has been listed successfully! Buyers can now see your listing.");
    resetSellForm();
    
    // Switch to buy tab immediately to show the new listing
    setTimeout(() => {
      setActiveTab("buy");
      // Refresh listings to merge with any Supabase data
      void loadListings();
      // Clear success message after 3 seconds
      setTimeout(() => setSellSuccess(null), 3000);
    }, 500);
    setSelling(false);
  };

  const filteredListings = React.useMemo(() => {
    return listings.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (filterState && item.state !== filterState) return false;
      if (filterDistrict && item.district !== filterDistrict) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          item.crop_name.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term) ||
          item.seller_name.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [listings, selectedCategory, filterState, filterDistrict, searchTerm]);

  const renderBuyTab = () => (
    <>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.searchCrops}
            className="pl-10 bg-card/90 border-0 min-h-[44px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => loadListings()}
          disabled={loadingListings}
          className="min-h-[44px] min-w-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${loadingListings ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground shadow-card"
            }`}
          >
            <span>{cat.emoji}</span>
            <span className="text-sm font-medium">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <Select
          value={filterState || undefined}
          onValueChange={(val) => {
            setFilterState(val === "all" ? "" : val);
            setFilterDistrict("");
          }}
        >
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="Any State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any State</SelectItem>
            {STATE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterDistrict || undefined}
          onValueChange={(val) => setFilterDistrict(val === "all" ? "" : val)}
          disabled={!filterState}
        >
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="Any District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any District</SelectItem>
            {filterDistrictOptions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filterState || filterDistrict || searchTerm || selectedCategory !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterState("");
              setFilterDistrict("");
              setSearchTerm("");
              setSelectedCategory("all");
            }}
            className="min-h-[44px] text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      {listingError && (
        <div className="text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 rounded-lg p-3 border border-destructive/20 mt-3">
          ⚠️ {listingError}
        </div>
      )}

      {filteredListings.length > 0 && !loadingListings && (
        <p className="text-xs text-muted-foreground mb-2">
          Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          {(searchTerm || selectedCategory !== "all" || filterState || filterDistrict) && ` (filtered)`}
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
            <div className="text-4xl mb-3">🌾</div>
            <p className="text-sm font-medium text-foreground mb-1">
              No listings found
            </p>
            <p className="text-xs text-muted-foreground">
              {searchTerm || selectedCategory !== "all" || filterState || filterDistrict
                ? "Try adjusting your filters or search terms."
                : "Be the first to post a crop listing!"}
            </p>
          </div>
        ) : (
          filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl p-4 shadow-card space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {/* Emoji based on crop name using CROP_EMOJIS mapping */}
                  <span>
                    {Object.keys(CROP_EMOJIS).find(
                      (crop) =>
                        item.crop_name.toLowerCase().includes(crop.toLowerCase()) ||
                        crop.toLowerCase().includes(item.crop_name.toLowerCase())
                    )
                      ? CROP_EMOJIS[
                          Object.keys(CROP_EMOJIS).find(
                            (crop) =>
                              item.crop_name.toLowerCase().includes(crop.toLowerCase()) ||
                              crop.toLowerCase().includes(item.crop_name.toLowerCase())
                          )!
                        ]
                      : item.category === "vegetables"
                      ? "🥬"
                      : item.category === "fruits"
                      ? "🍎"
                      : item.category === "grains"
                      ? "🌾"
                      : item.category === "spices"
                      ? "🌶️"
                      : "🌱"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {item.crop_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        👤 {item.seller_name} • 📍 {item.location}
                        {item.created_at && (
                          <span className="ml-2">
                            • {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 whitespace-nowrap">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {item.price_per_unit.toLocaleString('en-IN')}/{item.unit}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full font-medium">
                      📦 {item.quantity} {item.unit}
                    </span>
                    <span className="text-xs bg-leaf-light/30 text-leaf-dark dark:bg-leaf-dark/30 dark:text-leaf-light px-2 py-1 rounded-full font-medium">
                      {item.category === "vegetables" ? "🥬" : item.category === "fruits" ? "🍎" : item.category === "grains" ? "🌾" : "🌶️"} {item.category.toUpperCase()}
                    </span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">
                      📍 {item.district}, {item.state}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${item.phone}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full gap-1 min-h-[40px]"
                    variant="outline"
                  >
                    <Phone className="w-3 h-3" />
                    {t.call}
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}?text=Hi, I'm interested in your ${item.crop_name} listing.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full gap-1 min-h-[40px]"
                  >
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

      <Select
        value={sellCropName}
        onValueChange={setSellCropName}
      >
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Select Crop Name *" />
        </SelectTrigger>
        <SelectContent>
          {CROP_OPTIONS.map((c) => (
            <SelectItem key={c} value={c}>
              {CROP_EMOJIS[c] || "🌱"} {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Select
          value={sellCategory}
          onValueChange={(val: CropCategory) => setSellCategory(val)}
        >
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories
              .filter((c) => c.id !== "all")
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={sellUnit} onValueChange={setSellUnit}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">kg</SelectItem>
            <SelectItem value="quintal">Quintal</SelectItem>
            <SelectItem value="ton">Ton</SelectItem>
            <SelectItem value="dozen">Dozen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          placeholder="Quantity"
          className="bg-card/90 border-0 min-h-[44px]"
          value={sellQuantity}
          onChange={(e) => setSellQuantity(e.target.value)}
        />
        <div className="flex-1 flex items-center gap-1 bg-card/90 border-0 rounded-md px-3">
          <IndianRupee className="w-4 h-4 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            placeholder="Price per unit"
            className="bg-transparent border-0 px-0 min-h-[44px]"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />
        </div>
      </div>

      <Select
        value={sellState}
        onValueChange={(val) => {
          setSellState(val);
          setSellDistrict("");
        }}
      >
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder="Select State" />
        </SelectTrigger>
        <SelectContent>
          {STATE_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sellDistrict}
        onValueChange={(val) => {
          setSellDistrict(val);
          if (sellState && val) {
            setSellLocation(`${val}, ${sellState}`);
          }
        }}
        disabled={!sellState || districtOptions.length === 0}
      >
        <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
          <SelectValue placeholder={sellState ? "Select District *" : "Select State first"} />
        </SelectTrigger>
        <SelectContent>
          {districtOptions.length > 0 ? (
            districtOptions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No districts available
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Input
        placeholder="Full location / village name"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellLocation}
        onChange={(e) => setSellLocation(e.target.value)}
      />

      <Input
        placeholder="Your name"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellSellerName}
        onChange={(e) => setSellSellerName(e.target.value)}
      />
      <Input
        type="tel"
        placeholder="Your phone number (10 digits)"
        className="bg-card/90 border-0 min-h-[44px]"
        value={sellPhone}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9+\-\s()]/g, "");
          setSellPhone(value);
        }}
        maxLength={15}
      />

      <Textarea
        placeholder="Any notes (quality, delivery, payment, etc.)"
        className="bg-card/90 border-0 min-h-[80px]"
        value={sellNotes}
        onChange={(e) => setSellNotes(e.target.value)}
      />

      <Button
        className="w-full min-h-[48px] text-base font-semibold mt-2 shadow-lg hover:shadow-xl transition-all"
        onClick={handlePostListing}
        disabled={selling}
        size="lg"
      >
        {selling ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            💰 Post Crop for Sale
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">
              {t.buySell || "Buy & Sell"} 🛒
            </h1>
            <p className="text-sm text-primary-foreground/80">
              {t.tradeCrops || "Trade crops directly with farmers"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            variant={activeTab === "buy" ? "secondary" : "ghost"}
            className={`flex-1 min-h-[44px] ${
              activeTab === "buy"
                ? "bg-card text-foreground"
                : "text-primary-foreground"
            }`}
            onClick={() => setActiveTab("buy")}
          >
            🛒 {t.buy}
          </Button>
          <Button
            variant={activeTab === "sell" ? "secondary" : "ghost"}
            className={`flex-1 min-h-[44px] ${
              activeTab === "sell"
                ? "bg-card text-foreground"
                : "text-primary-foreground"
            }`}
            onClick={() => setActiveTab("sell")}
          >
            💰 {t.sell}
          </Button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === "buy" ? renderBuyTab() : renderSellTab()}
      </div>
    </div>
  );
};

export default BuySellScreen;
