import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, ShoppingCart, Shield, RefreshCw, IndianRupee, Minus, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { CROP_EMOJIS } from '@/data/cropRates';

interface FFSeedsScreenProps {
  onBack: () => void;
}

interface SeedItem {
  id: string;
  seed_name: string;
  crop_type: string;
  price_per_kg: number;
  growth_days: number;
  refund_policy: string;
  available_states: string;
  created_at?: string;
}

const STORAGE_KEY = 'ff_seeds_local';
const CART_KEY = 'ff_seeds_cart';
const ORDERS_KEY = 'ff_seeds_orders';

const SAMPLE_SEEDS: SeedItem[] = [
  { id: '1', seed_name: 'Paddy Premium', crop_type: 'Paddy', price_per_kg: 45, growth_days: 120, refund_policy: '7 days', available_states: 'Tamil Nadu, Andhra Pradesh', created_at: new Date().toISOString() },
  { id: '2', seed_name: 'Cotton Hybrid', crop_type: 'Cotton', price_per_kg: 320, growth_days: 150, refund_policy: '5 days', available_states: 'All States', created_at: new Date().toISOString() },
  { id: '3', seed_name: 'Tomato F1', crop_type: 'Tomato', price_per_kg: 180, growth_days: 90, refund_policy: '10 days', available_states: 'Tamil Nadu, Karnataka', created_at: new Date().toISOString() },
  { id: '4', seed_name: 'Groundnut Elite', crop_type: 'Groundnut', price_per_kg: 95, growth_days: 110, refund_policy: '7 days', available_states: 'All States', created_at: new Date().toISOString() },
  { id: '5', seed_name: 'Turmeric Select', crop_type: 'Turmeric', price_per_kg: 250, growth_days: 270, refund_policy: '5 days', available_states: 'Tamil Nadu', created_at: new Date().toISOString() },
];

const getStoredSeeds = (): SeedItem[] => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveStoredSeeds = (items: SeedItem[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
};

type CartItem = { id: string; seed_name: string; crop_type: string; price_per_kg: number; qty_kg: number };
const getCart = (): CartItem[] => {
  try {
    const s = localStorage.getItem(CART_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};
const saveCart = (items: CartItem[]) => {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
};

const FFSeedsScreen: React.FC<FFSeedsScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [seeds, setSeeds] = useState<SeedItem[]>(SAMPLE_SEEDS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrop, setFilterCrop] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'confirm'>('cart');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  useEffect(() => {
    loadSeeds();
  }, []);
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const loadSeeds = async () => {
    setLoading(true);
    const local = getStoredSeeds();
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 5000));
      const { data, error } = await Promise.race([supabase.from('ff_seeds').select('*'), timeout]) as { data: any[]; error: any };
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        seed_name: r.seed_name,
        crop_type: r.crop_type,
        price_per_kg: Number(r.price_per_kg),
        growth_days: Number(r.growth_days) || 0,
        refund_policy: r.refund_policy || '',
        available_states: r.available_states || '',
        created_at: r.created_at,
      }));
      setSeeds(mapped.length ? mapped : [...SAMPLE_SEEDS, ...local]);
    } catch {
      setSeeds(local.length ? local : SAMPLE_SEEDS);
    } finally {
      setLoading(false);
    }
  };

  const filteredSeeds = useMemo(() => {
    return seeds.filter((s) => {
      if (filterCrop && s.crop_type !== filterCrop) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.seed_name.toLowerCase().includes(q) || s.crop_type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [seeds, filterCrop, searchQuery]);

  const addToCart = (seed: SeedItem, qtyKg: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === seed.id);
      if (existing) {
        return prev.map((c) => (c.id === seed.id ? { ...c, qty_kg: c.qty_kg + qtyKg } : c));
      }
      return [...prev, { id: seed.id, seed_name: seed.seed_name, crop_type: seed.crop_type, price_per_kg: seed.price_per_kg, qty_kg: qtyKg }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, qty_kg: Math.max(0, c.qty_kg + delta) } : c));
      return next.filter((c) => c.qty_kg > 0);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price_per_kg * c.qty_kg, 0);

  const handlePlaceOrder = () => {
    if (checkoutStep === 'cart') {
      if (cart.length === 0) return;
      setCheckoutStep('details');
      return;
    }
    if (checkoutStep === 'details') {
      if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
        alert('Please fill name, phone, and address.');
        return;
      }
      setCheckoutStep('confirm');
      return;
    }
    const id = `ORD-${Date.now()}`;
    setOrderId(id);
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.unshift({ id, cart: [...cart], customerName, customerPhone, customerAddress, total: cartTotal, date: new Date().toISOString() });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    setCart([]);
    setOrderPlaced(true);
    setShowCart(false);
    setCheckoutStep('cart');
  };

  const cropTypes = Array.from(new Set(seeds.map((s) => s.crop_type)));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">🌱 {t.ffSeeds || 'FF Seeds'}</h1>
            <p className="text-sm text-primary-foreground/80">Quality seeds, lab tested</p>
          </div>
          <Button variant="secondary" size="icon" className="relative min-h-[44px] min-w-[44px]" onClick={() => setShowCart(true)}>
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{cart.length}</span>}
          </Button>
        </div>
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search seeds..." className="pl-10 bg-card/90 border-0 min-h-[44px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => loadSeeds()} disabled={loading} className="min-h-[44px] min-w-[44px]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Select value={filterCrop || undefined} onValueChange={(v) => setFilterCrop(v === 'all' ? '' : v)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]"><SelectValue placeholder="Crop type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All crops</SelectItem>
            {cropTypes.map((c) => <SelectItem key={c} value={c}>{CROP_EMOJIS[c] || '🌱'} {c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="px-4 mt-4">
        {loading && seeds.length === 0 ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredSeeds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No seeds found.</div>
        ) : (
          <div className="space-y-3">
            {filteredSeeds.map((seed) => (
              <div key={seed.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CROP_EMOJIS[seed.crop_type] || '🌱'}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{seed.seed_name}</h3>
                      <p className="text-xs text-muted-foreground">{seed.crop_type}</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary flex items-center gap-0.5"><IndianRupee className="w-4 h-4" />{seed.price_per_kg}/kg</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" />Lab tested</span>
                  <span>{seed.growth_days} days</span>
                  <span>{seed.refund_policy}</span>
                </div>
                <p className="text-xs text-muted-foreground">Available: {seed.available_states}</p>
                <Button className="w-full" onClick={() => addToCart(seed)}>
                  🛒 {t.buyNow || 'Add to cart'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">Cart ({cart.length})</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowCart(false); setCheckoutStep('cart'); setOrderPlaced(false); }}>✕</Button>
            </div>
            <div className="p-4 space-y-4">
              {orderPlaced ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-foreground">Order placed!</p>
                  <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
                  <p className="text-sm text-primary mt-1">Total: ₹{cartTotal.toLocaleString()}</p>
                </div>
              ) : checkoutStep === 'cart' ? (
                <>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Cart is empty.</p>
                  ) : (
                    <>
                      {cart.map((c) => (
                        <div key={c.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                          <div>
                            <p className="font-medium text-foreground">{c.seed_name}</p>
                            <p className="text-sm text-primary">₹{c.price_per_kg}/kg × {c.qty_kg} kg</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateCartQty(c.id, -1)}><Minus className="w-3 h-3" /></Button>
                            <span className="font-medium w-8 text-center">{c.qty_kg}</span>
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateCartQty(c.id, 1)}><Plus className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      ))}
                      <p className="font-bold text-lg flex items-center gap-1">Total: <IndianRupee className="w-5 h-5" />{cartTotal.toLocaleString()}</p>
                    </>
                  )}
                </>
              ) : checkoutStep === 'details' ? (
                <>
                  <Input placeholder="Your name *" className="min-h-[44px]" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  <Input type="tel" placeholder="Phone *" className="min-h-[44px]" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} />
                  <textarea placeholder="Delivery address *" className="w-full min-h-[80px] rounded-md border bg-card p-3 text-sm" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm"><strong>Name:</strong> {customerName}</p>
                  <p className="text-sm"><strong>Phone:</strong> {customerPhone}</p>
                  <p className="text-sm"><strong>Address:</strong> {customerAddress}</p>
                  <p className="font-bold text-primary">Total: ₹{cartTotal.toLocaleString()}</p>
                </div>
              )}
              {!orderPlaced && (
                <div className="flex gap-2">
                  {checkoutStep !== 'cart' && <Button variant="outline" className="flex-1" onClick={() => setCheckoutStep(checkoutStep === 'details' ? 'cart' : 'details')}>Back</Button>}
                  <Button className="flex-1" onClick={handlePlaceOrder} disabled={checkoutStep === 'cart' && cart.length === 0}>
                    {checkoutStep === 'cart' ? 'Proceed to checkout' : checkoutStep === 'details' ? 'Review order' : 'Place order'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FFSeedsScreen;
