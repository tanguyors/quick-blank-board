import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useExchangeDocuments() {
  const { user } = useAuth();

  const documents = useQuery({
    queryKey: ['exchange-documents', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_documents')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const submitDocument = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      if (!user) throw new Error('Not authenticated');
      if (file.size > 10 * 1024 * 1024) throw new Error('File too large (max 10MB)');

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('exchange-documents')
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from('exchange-documents')
        .createSignedUrl(path, 365 * 24 * 60 * 60);

      const { error: dbError } = await supabase
        .from('exchange_documents')
        .insert({
          user_id: user.id,
          document_url: urlData?.signedUrl || path,
          document_type: documentType,
          status: 'pending',
        });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-documents'] });
    },
  });

  return { documents, submitDocument };
}

export function useExchangeAccess() {
  const { documents } = useExchangeDocuments();
  const docs = documents.data || [];
  const insuranceApproved = docs.some((d: any) => d.document_type === 'insurance' && d.status === 'approved');
  const exchangeApproved = docs.some((d: any) => d.document_type === 'exchange_authorization' && d.status === 'approved');
  const allApproved = insuranceApproved && exchangeApproved;
  const isLoading = documents.isLoading;
  return { allApproved, insuranceApproved, exchangeApproved, isLoading };
}

export function useAdminExchangeDocuments() {
  const { user } = useAuth();

  const documents = useQuery({
    queryKey: ['admin-exchange-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_documents')
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .order('submitted_at', { ascending: false });
      if (error) {
        // Fallback without join
        const { data: plain, error: e2 } = await supabase
          .from('exchange_documents')
          .select('*')
          .order('submitted_at', { ascending: false });
        if (e2) throw e2;
        return plain || [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const reviewDocument = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: 'approved' | 'rejected'; rejectionReason?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('exchange_documents')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          rejection_reason: rejectionReason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exchange-documents'] });
    },
  });

  return { documents, reviewDocument };
}
