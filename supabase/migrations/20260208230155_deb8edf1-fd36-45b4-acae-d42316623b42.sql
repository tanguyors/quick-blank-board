-- Add notification preference columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notif_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_whatsapp boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_newsletter boolean NOT NULL DEFAULT true;