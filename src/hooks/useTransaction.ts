import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { WorkflowService } from '@/services/workflowService';
import { MessageDetectionService } from '@/services/messageDetectionService';
import type { TransactionStatus } from '@/types/workflow';

export function useTransaction(transactionId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const transaction = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
      if (error) throw error;

      // Fetch property and profiles
      const [propertyRes, buyerRes, sellerRes] = await Promise.all([
        supabase.from('properties').select('*, property_media(*)').eq('id', data.property_id).single(),
        supabase.from('profiles').select('*').eq('id', data.buyer_id).single(),
        supabase.from('profiles').select('*').eq('id', data.seller_id).single(),
      ]);

      return {
        ...data,
        properties: propertyRes.data,
        buyer_profile: buyerRes.data,
        seller_profile: sellerRes.data,
      };
    },
    enabled: !!transactionId && !!user,
  });

  const logs = useQuery({
    queryKey: ['transaction-logs', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_transaction_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!transactionId && !!user,
  });

  const messages = useQuery({
    queryKey: ['transaction-messages', transactionId],
    queryFn: () => MessageDetectionService.getTransactionMessages(transactionId),
    enabled: !!transactionId && !!user,
    refetchInterval: 5000,
  });

  const documents = useQuery({
    queryKey: ['transaction-documents', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_documents')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!transactionId && !!user,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
    queryClient.invalidateQueries({ queryKey: ['transaction-logs', transactionId] });
    queryClient.invalidateQueries({ queryKey: ['transaction-messages', transactionId] });
    queryClient.invalidateQueries({ queryKey: ['transaction-documents', transactionId] });
  };

  const requestVisit = useMutation({
    mutationFn: () => WorkflowService.requestVisit(transactionId, user!.id),
    onSuccess: invalidateAll,
  });

  const proposeVisitDates = useMutation({
    mutationFn: (dates: { date: string; preference: number }[]) =>
      WorkflowService.proposeVisitDates(transactionId, user!.id, dates),
    onSuccess: invalidateAll,
  });

  const confirmVisit = useMutation({
    mutationFn: (confirmedDate: string) =>
      WorkflowService.confirmVisit(transactionId, user!.id, confirmedDate),
    onSuccess: invalidateAll,
  });

  const completeVisit = useMutation({
    mutationFn: (wasPresent: boolean) =>
      WorkflowService.completeVisit(transactionId, user!.id, wasPresent),
    onSuccess: invalidateAll,
  });

  const expressIntention = useMutation({
    mutationFn: (args: { intention: 'continue' | 'offer' | 'stop'; reason?: string; details?: string }) =>
      WorkflowService.expressIntention(transactionId, user!.id, args.intention, args.reason, args.details),
    onSuccess: invalidateAll,
  });

  const makeOffer = useMutation({
    mutationFn: (args: { offerType: string; amount: number; details?: string }) =>
      WorkflowService.makeOffer(transactionId, user!.id, args.offerType, args.amount, args.details),
    onSuccess: invalidateAll,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const tx = transaction.data;
      if (!tx || !user) throw new Error('Transaction ou utilisateur manquant');
      const receiverId = user.id === tx.buyer_id ? tx.seller_id : tx.buyer_id;
      return MessageDetectionService.analyzeAndSaveMessage(transactionId, user.id, receiverId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-messages', transactionId] });
    },
  });

  return {
    transaction,
    logs,
    messages,
    documents,
    requestVisit,
    proposeVisitDates,
    confirmVisit,
    completeVisit,
    expressIntention,
    makeOffer,
    sendMessage,
  };
}

export function useMyTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_transactions')
        .select('*')
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
        .order('updated_at', { ascending: false });
      if (error) throw error;

      // Fetch property info for each
      const propertyIds = [...new Set(data.map(t => t.property_id))];
      const { data: properties } = await supabase
        .from('properties')
        .select('id, type, adresse, prix, prix_currency, property_media(url, is_primary)')
        .in('id', propertyIds);

      const propMap = new Map(properties?.map(p => [p.id, p]) || []);
      return data.map(t => ({ ...t, properties: propMap.get(t.property_id) }));
    },
    enabled: !!user,
  });
}
