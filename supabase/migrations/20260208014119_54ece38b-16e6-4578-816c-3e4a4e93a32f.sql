
-- Add preferred_currency column to profiles
ALTER TABLE public.profiles 
ADD COLUMN preferred_currency text NOT NULL DEFAULT 'EUR';
