-- Jeton APNs enregistré par l’app iOS (Capacitor) pour l’envoi de notifications push serveur
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS apns_device_token TEXT;

COMMENT ON COLUMN public.profiles.apns_device_token IS 'Token APNs (chaîne hex) — iOS natif uniquement';
