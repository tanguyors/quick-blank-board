ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS nationality TEXT;