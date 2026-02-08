
-- Allow admins to view ALL visits (all users)
CREATE POLICY "Admins can view all visits"
ON public.visits
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update ALL visits
CREATE POLICY "Admins can update all visits"
ON public.visits
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view ALL properties (including unpublished/draft)
CREATE POLICY "Admins can view all properties"
ON public.properties
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update ALL properties (for validation/modification)
CREATE POLICY "Admins can update all properties"
ON public.properties
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view ALL conversations
CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view ALL matches
CREATE POLICY "Admins can view all matches"
ON public.matches
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view ALL transactions
CREATE POLICY "Admins can view all wf_transactions"
ON public.wf_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
