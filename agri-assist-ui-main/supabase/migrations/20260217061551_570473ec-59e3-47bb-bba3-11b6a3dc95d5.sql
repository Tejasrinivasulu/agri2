
-- 1. Crop Rates
CREATE TABLE public.crop_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Quintal',
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crop_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Crop rates are publicly readable" ON public.crop_rates FOR SELECT USING (true);

-- 2. Weather Forecast
CREATE TABLE public.weather_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  rainfall NUMERIC NOT NULL DEFAULT 0,
  wind_speed NUMERIC NOT NULL DEFAULT 0,
  forecast_type TEXT NOT NULL DEFAULT 'daily',
  forecast_date DATE NOT NULL DEFAULT CURRENT_DATE,
  condition TEXT NOT NULL DEFAULT 'Clear',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weather_forecast ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weather is publicly readable" ON public.weather_forecast FOR SELECT USING (true);

-- 3. Technicians
CREATE TABLE public.technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  experience TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  phone TEXT NOT NULL,
  services TEXT NOT NULL,
  rating NUMERIC NOT NULL DEFAULT 4.0,
  availability_status TEXT NOT NULL DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Technicians are publicly readable" ON public.technicians FOR SELECT USING (true);

-- 4. Animal Listings
CREATE TABLE public.animal_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_type TEXT NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  price NUMERIC NOT NULL,
  health_status TEXT NOT NULL DEFAULT 'Healthy',
  vaccinated BOOLEAN NOT NULL DEFAULT true,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.animal_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Animal listings are publicly readable" ON public.animal_listings FOR SELECT USING (true);

-- 5. Agri Tools
CREATE TABLE public.agri_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  category TEXT NOT NULL,
  rent_price_per_day NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agri_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agri tools are publicly readable" ON public.agri_tools FOR SELECT USING (true);

-- 6. Price Predictions
CREATE TABLE public.price_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  predicted_price NUMERIC NOT NULL,
  prediction_date DATE NOT NULL,
  confidence_percentage NUMERIC NOT NULL DEFAULT 75,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.price_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Price predictions are publicly readable" ON public.price_predictions FOR SELECT USING (true);

-- 7. Soil Reports
CREATE TABLE public.soil_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_name TEXT NOT NULL,
  soil_type TEXT NOT NULL,
  ph_value NUMERIC NOT NULL,
  nitrogen_level TEXT NOT NULL,
  phosphorus_level TEXT NOT NULL,
  potassium_level TEXT NOT NULL,
  recommended_crops TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Soil reports are publicly readable" ON public.soil_reports FOR SELECT USING (true);

-- 8. Government Schemes
CREATE TABLE public.government_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_name TEXT NOT NULL,
  scheme_type TEXT NOT NULL,
  state TEXT NOT NULL,
  benefit_details TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  subsidy_percentage TEXT,
  official_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schemes are publicly readable" ON public.government_schemes FOR SELECT USING (true);

-- 9. Officers
CREATE TABLE public.officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  phone TEXT NOT NULL,
  office_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Officers are publicly readable" ON public.officers FOR SELECT USING (true);

-- 10. Loan Offers
CREATE TABLE public.loan_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  interest_rate NUMERIC NOT NULL,
  min_amount NUMERIC NOT NULL,
  max_amount NUMERIC NOT NULL,
  state TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loan_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loan offers are publicly readable" ON public.loan_offers FOR SELECT USING (true);

-- 11. Land Rentals
CREATE TABLE public.land_rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_name TEXT NOT NULL,
  land_size_acres NUMERIC NOT NULL,
  rent_price_per_acre NUMERIC NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  soil_type TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.land_rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Land rentals are publicly readable" ON public.land_rentals FOR SELECT USING (true);

-- 12. Agri Investments
CREATE TABLE public.agri_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_name TEXT NOT NULL,
  investor_required_amount NUMERIC NOT NULL,
  land_available TEXT NOT NULL,
  profit_share_percentage NUMERIC NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agri_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investments are publicly readable" ON public.agri_investments FOR SELECT USING (true);

-- 13. Farm Jobs
CREATE TABLE public.farm_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_type TEXT NOT NULL,
  wage_per_day NUMERIC NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farm_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm jobs are publicly readable" ON public.farm_jobs FOR SELECT USING (true);

-- 14. FF Seeds
CREATE TABLE public.ff_seeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  growth_days INTEGER NOT NULL,
  refund_policy TEXT NOT NULL,
  available_states TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ff_seeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seeds are publicly readable" ON public.ff_seeds FOR SELECT USING (true);

-- 15. Farmer Guides
CREATE TABLE public.farmer_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content_summary TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farmer_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guides are publicly readable" ON public.farmer_guides FOR SELECT USING (true);

-- 16. Farming Classes
CREATE TABLE public.farming_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name TEXT NOT NULL,
  mode TEXT NOT NULL,
  duration TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  fees NUMERIC NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farming_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes are publicly readable" ON public.farming_classes FOR SELECT USING (true);

-- 17. Weekend Sessions
CREATE TABLE public.weekend_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 1,
  fee NUMERIC NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weekend_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weekend sessions are publicly readable" ON public.weekend_sessions FOR SELECT USING (true);

-- 18. Interest Records
CREATE TABLE public.interest_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  principal_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  time_period_years NUMERIC NOT NULL,
  interest_type TEXT NOT NULL DEFAULT 'Simple',
  calculated_interest NUMERIC NOT NULL,
  farmer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interest_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interest records are publicly readable" ON public.interest_records FOR SELECT USING (true);

-- 19. Learning Videos
CREATE TABLE public.learning_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos are publicly readable" ON public.learning_videos FOR SELECT USING (true);
