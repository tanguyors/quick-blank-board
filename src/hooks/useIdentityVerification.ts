import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface IdentityVerification {
  id: string;
  user_id: string;
  document_url: string;
  document_type: string;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

export function useIdentityVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const verification = useQuery({
    queryKey: ['identity-verification', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as IdentityVerification | null;
    },
    enabled: !!user,
  });

  const submitVerification = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('identity-documents')
        .upload(path, file);
      if (uploadError) throw uploadError;

      // We need the signed URL since bucket is private
      const { data: signedData } = await supabase.storage
        .from('identity-documents')
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

      const documentUrl = signedData?.signedUrl || path;

      // Upsert verification record
      const existing = verification.data;
      if (existing) {
        const { error } = await supabase
          .from('identity_verifications')
          .update({
            document_url: documentUrl,
            status: 'pending' as any,
            submitted_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            rejection_reason: null,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('identity_verifications')
          .insert({
            user_id: user!.id,
            document_url: documentUrl,
            document_type: 'id_card',
            status: 'pending' as any,
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-verification'] });
    },
  });

  return { verification, submitVerification };
}

export function useAdminVerifications() {
  const queryClient = useQueryClient();

  const verifications = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;

      // Fetch profiles for user names
      const userIds = data?.map((v: any) => v.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, email, avatar_url')
        .in('id', userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      return (data || []).map((v: any) => ({
        ...v,
        profile: profileMap[v.user_id] || null,
      }));
    },
  });

  const reviewVerification = useMutation({
    mutationFn: async ({ id, status, rejectionReason, reviewerId }: {
      id: string;
      status: 'approved' | 'rejected';
      rejectionReason?: string;
      reviewerId: string;
    }) => {
      const { error } = await supabase
        .from('identity_verifications')
        .update({
          status: status as any,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          rejection_reason: rejectionReason || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
    },
  });

  return { verifications, reviewVerification };
}
