
-- =============================================================
-- Enum for transaction status
-- =============================================================
CREATE TYPE public.transaction_status AS ENUM (
  'matched',
  'visit_requested',
  'visit_proposed',
  'visit_confirmed',
  'visit_completed',
  'visit_cancelled',
  'visit_rescheduled',
  'intention_expressed',
  'offer_made',
  'documents_generated',
  'in_validation',
  'deal_finalized',
  'deal_cancelled',
  'archived'
);

-- =============================================================
-- 1. wf_transactions
-- =============================================================
CREATE TABLE public.wf_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'matched',
  previous_status public.transaction_status,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_requested_at TIMESTAMPTZ,
  visit_proposed_dates JSONB,
  visit_confirmed_date TIMESTAMPTZ,
  visit_confirmed_by_buyer BOOLEAN DEFAULT false,
  visit_confirmed_by_seller BOOLEAN DEFAULT false,
  visit_refusal_reason TEXT,
  visit_refusal_details TEXT,
  visit_completed_at TIMESTAMPTZ,
  buyer_intention TEXT,
  rejection_reason TEXT,
  rejection_details TEXT,
  offer_type TEXT,
  offer_amount NUMERIC,
  offer_details TEXT,
  buyer_validated BOOLEAN DEFAULT false,
  seller_validated BOOLEAN DEFAULT false,
  buyer_validated_at TIMESTAMPTZ,
  seller_validated_at TIMESTAMPTZ,
  deal_finalized_at TIMESTAMPTZ,
  buyer_no_show BOOLEAN DEFAULT false,
  seller_no_show BOOLEAN DEFAULT false,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_amount NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wf_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their transactions"
  ON public.wf_transactions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view their transactions"
  ON public.wf_transactions FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "System can insert transactions"
  ON public.wf_transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update their transactions"
  ON public.wf_transactions FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE TRIGGER update_wf_transactions_updated_at
  BEFORE UPDATE ON public.wf_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 2. wf_transaction_logs
-- =============================================================
CREATE TABLE public.wf_transaction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.wf_transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  actor_role TEXT,
  previous_status public.transaction_status,
  new_status public.transaction_status,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wf_transaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction participants can view logs"
  ON public.wf_transaction_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.wf_transactions t
    WHERE t.id = wf_transaction_logs.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));

CREATE POLICY "Participants can insert logs"
  ON public.wf_transaction_logs FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- =============================================================
-- 3. wf_messages (messagerie sécurisée)
-- =============================================================
CREATE TABLE public.wf_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.wf_transactions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  contains_phone_number BOOLEAN DEFAULT false,
  flagged_suspicious BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wf_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view transaction messages"
  ON public.wf_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Participants can send messages"
  ON public.wf_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.wf_transactions t
    WHERE t.id = wf_messages.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));

CREATE POLICY "Participants can mark messages as read"
  ON public.wf_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- =============================================================
-- 4. wf_documents
-- =============================================================
CREATE TABLE public.wf_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.wf_transactions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  pdf_url TEXT,
  buyer_validated BOOLEAN DEFAULT false,
  seller_validated BOOLEAN DEFAULT false,
  buyer_validated_at TIMESTAMPTZ,
  seller_validated_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wf_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transaction participants can view documents"
  ON public.wf_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.wf_transactions t
    WHERE t.id = wf_documents.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));

CREATE POLICY "Participants can insert documents"
  ON public.wf_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.wf_transactions t
    WHERE t.id = wf_documents.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));

CREATE POLICY "Participants can update documents"
  ON public.wf_documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.wf_transactions t
    WHERE t.id = wf_documents.transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));

CREATE TRIGGER update_wf_documents_updated_at
  BEFORE UPDATE ON public.wf_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 5. wf_notifications
-- =============================================================
CREATE TABLE public.wf_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.wf_transactions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wf_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.wf_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.wf_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
  ON public.wf_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================
-- 6. wf_user_scores
-- =============================================================
CREATE TABLE public.wf_user_scores (
  user_id UUID NOT NULL PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 50,
  total_transactions INTEGER DEFAULT 0,
  completed_transactions INTEGER DEFAULT 0,
  cancelled_transactions INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  visit_refusals INTEGER DEFAULT 0,
  certified BOOLEAN DEFAULT false,
  certified_at TIMESTAMPTZ,
  vip_access BOOLEAN DEFAULT false,
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wf_user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all scores"
  ON public.wf_user_scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own score"
  ON public.wf_user_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own score"
  ON public.wf_user_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_wf_user_scores_updated_at
  BEFORE UPDATE ON public.wf_user_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 7. wf_reminders
-- =============================================================
CREATE TABLE public.wf_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.wf_transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wf_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reminders"
  ON public.wf_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert reminders"
  ON public.wf_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update reminders"
  ON public.wf_reminders FOR UPDATE
  USING (true);

CREATE TRIGGER update_wf_reminders_updated_at
  BEFORE UPDATE ON public.wf_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- Score calculation function
-- =============================================================
CREATE OR REPLACE FUNCTION public.wf_calculate_user_score(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_score INTEGER := 50;
  v_completed INTEGER;
  v_cancelled INTEGER;
  v_no_shows INTEGER;
  v_refusals INTEGER;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN status = 'deal_finalized' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'deal_cancelled' THEN 1 ELSE 0 END), 0)
  INTO v_completed, v_cancelled
  FROM wf_transactions
  WHERE buyer_id = p_user_id OR seller_id = p_user_id;

  SELECT COALESCE(SUM(
    CASE WHEN (buyer_id = p_user_id AND buyer_no_show = true) OR (seller_id = p_user_id AND seller_no_show = true) THEN 1 ELSE 0 END
  ), 0) INTO v_no_shows
  FROM wf_transactions
  WHERE buyer_id = p_user_id OR seller_id = p_user_id;

  SELECT COUNT(*) INTO v_refusals
  FROM wf_transactions
  WHERE seller_id = p_user_id AND status = 'visit_cancelled' AND visit_refusal_reason IS NOT NULL;

  v_score := 50 + (v_completed * 10) - (v_cancelled * 5) - (v_no_shows * 10) - (v_refusals * 5);
  v_score := GREATEST(0, LEAST(100, v_score));

  INSERT INTO wf_user_scores (user_id, score, total_transactions, completed_transactions, cancelled_transactions, no_shows, visit_refusals, last_calculated_at)
  VALUES (p_user_id, v_score, v_completed + v_cancelled, v_completed, v_cancelled, v_no_shows, v_refusals, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    total_transactions = EXCLUDED.total_transactions,
    completed_transactions = EXCLUDED.completed_transactions,
    cancelled_transactions = EXCLUDED.cancelled_transactions,
    no_shows = EXCLUDED.no_shows,
    visit_refusals = EXCLUDED.visit_refusals,
    last_calculated_at = now();

  RETURN v_score;
END;
$$;
