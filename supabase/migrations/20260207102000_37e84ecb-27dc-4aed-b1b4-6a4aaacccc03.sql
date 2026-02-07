
-- Fix overly permissive INSERT on wf_notifications: only participants of the transaction can insert
DROP POLICY "System can insert notifications" ON public.wf_notifications;
CREATE POLICY "Participants can insert notifications"
  ON public.wf_notifications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.wf_transactions t
      WHERE t.id = wf_notifications.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

-- Fix overly permissive INSERT on wf_reminders
DROP POLICY "System can insert reminders" ON public.wf_reminders;
CREATE POLICY "Participants can insert reminders"
  ON public.wf_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wf_transactions t
      WHERE t.id = wf_reminders.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

-- Fix overly permissive UPDATE on wf_reminders
DROP POLICY "System can update reminders" ON public.wf_reminders;
CREATE POLICY "Participants can update reminders"
  ON public.wf_reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wf_transactions t
      WHERE t.id = wf_reminders.transaction_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );
