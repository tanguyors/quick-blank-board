
-- Create buyer preferences table
CREATE TABLE public.buyer_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_types TEXT[] DEFAULT '{}',
  preferred_operation TEXT,
  preferred_chambres INT[] DEFAULT '{}',
  preferred_salles_bain INT[] DEFAULT '{}',
  preferred_sectors TEXT[] DEFAULT '{}',
  custom_sector TEXT,
  receive_alerts BOOLEAN DEFAULT true,
  preferred_status TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  budget_currency TEXT DEFAULT 'EUR',
  intention TEXT,
  wants_advisor BOOLEAN DEFAULT false,
  payment_knowledge TEXT,
  cash_available TEXT,
  visit_availability TEXT[] DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buyer_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.buyer_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own preferences
CREATE POLICY "Users can create own preferences"
  ON public.buyer_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.buyer_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_buyer_preferences_updated_at
  BEFORE UPDATE ON public.buyer_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
