-- Crop Listings (Buy & Sell marketplace)
CREATE TABLE IF NOT EXISTS public.crop_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  crop_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'vegetables',
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  price_per_unit NUMERIC NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  location TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT
);

ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read listings
CREATE POLICY "Crop listings are publicly readable" ON public.crop_listings
  FOR SELECT USING (true);

-- Allow anyone to insert (post new listings)
CREATE POLICY "Crop listings allow insert" ON public.crop_listings
  FOR INSERT WITH CHECK (true);
