
-- Create identity verification status enum
CREATE TYPE public.identity_verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Create identity_verifications table
CREATE TABLE public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_url text NOT NULL,
  document_type text NOT NULL DEFAULT 'id_card',
  status identity_verification_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification
CREATE POLICY "Users can view own verification"
ON public.identity_verifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own verification
CREATE POLICY "Users can submit verification"
ON public.identity_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending verification (resubmit)
CREATE POLICY "Users can update own pending verification"
ON public.identity_verifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.identity_verifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update verifications (approve/reject)
CREATE POLICY "Admins can update verifications"
ON public.identity_verifications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for identity documents (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('identity-documents', 'identity-documents', false);

-- Storage policies: users can upload their own docs
CREATE POLICY "Users can upload own identity docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can view their own docs
CREATE POLICY "Users can view own identity docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can view all identity docs
CREATE POLICY "Admins can view all identity docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'identity-documents' AND public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_identity_verifications_updated_at
  BEFORE UPDATE ON public.identity_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
