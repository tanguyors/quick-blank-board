-- Allow admins to view all transaction messages
CREATE POLICY "Admins can view all wf_messages"
ON public.wf_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
