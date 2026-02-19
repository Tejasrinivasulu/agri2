# Apply Crop Listings Migration

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/zusbsuunzhaocsacanai
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the SQL from `supabase/migrations/20260220000000_add_crop_listings.sql`:

```sql
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
```

5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this means the table was created successfully!

## Option 2: Install Supabase CLI (Alternative)

If you prefer using CLI:

### Windows (using Scoop):
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Windows (using Chocolatey):
```powershell
choco install supabase
```

### Then link and push:
```bash
cd agri-assist-ui-main
supabase link --project-ref zusbsuunzhaocsacanai
supabase db push
```

## Verify Migration

After applying the migration:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see `crop_listings` table listed
3. The table should have columns: id, created_at, crop_name, category, quantity, unit, price_per_unit, state, district, location, seller_name, phone, notes

## Test the Feature

1. Start your app: `npm start`
2. Navigate to Buy & Sell feature
3. Try posting a listing in the **Sell** tab
4. Switch to **Buy** tab - your listing should appear!
5. The listing will now be stored in Supabase database instead of localStorage
