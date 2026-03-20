import { useState } from 'react';
import { useAdminVerifications } from '@/hooks/useIdentityVerification';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export function AdminVerificationsTab() {
  const { user } = useAuth();
  const { verifications, reviewVerification } = useAdminVerifications();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filtered = verifications.data?.filter(v =>
    filter === 'all' ? true : v.status === filter
  ) || [];

  const pendingCount = verifications.data?.filter(v => v.status === 'pending').length || 0;

  const handleApprove = async (id: string) => {
    try {
      await reviewVerification.mutateAsync({ id, status: 'approved', reviewerId: user!.id });
      toast.success('Identité approuvée');
      setExpandedId(null);
    } catch {
      toast.error('Erreur');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez indiquer une raison de refus');
      return;
    }
    try {
      await reviewVerification.mutateAsync({ id, status: 'rejected', rejectionReason, reviewerId: user!.id });
      toast.success('Vérification refusée');
      setExpandedId(null);
      setRejectionReason('');
    } catch {
      toast.error('Erreur');
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'pending') return <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300"><Clock className="h-3 w-3" /> En attente</Badge>;
    if (status === 'approved') return <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300"><CheckCircle2 className="h-3 w-3" /> Approuvé</Badge>;
    return <Badge variant="outline" className="gap-1 text-destructive border-destructive/30"><XCircle className="h-3 w-3" /> Refusé</Badge>;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Vérifications d'identité</h2>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500 text-white">{pendingCount} en attente</Badge>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Refusés'}
            {f !== 'all' && verifications.data && (
              <span className="ml-1 opacity-70">({verifications.data.filter(v => v.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Aucune vérification</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(v => {
          const isExpanded = expandedId === v.id;
          return (
            <div key={v.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : v.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {v.profile?.full_name || v.profile?.first_name || v.profile?.email || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Soumis le {format(new Date(v.submitted_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(v.status)}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Document soumis :</p>
                    <a
                      href={v.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
                    >
                      <Eye className="h-4 w-4" /> Voir le document
                    </a>
                  </div>

                  {v.status === 'pending' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-1" onClick={() => handleApprove(v.id)} disabled={reviewVerification.isPending}>
                          <CheckCircle2 className="h-4 w-4" /> Approuver
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => {
                          if (rejectionReason.trim()) handleReject(v.id);
                          else toast.info('Indiquez d\'abord une raison de refus ci-dessous');
                        }} disabled={reviewVerification.isPending}>
                          <XCircle className="h-4 w-4" /> Refuser
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Raison du refus (obligatoire si refusé)..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  )}

                  {v.status === 'rejected' && v.rejection_reason && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Raison du refus :</p>
                      <p className="text-sm text-foreground mt-0.5">{v.rejection_reason}</p>
                    </div>
                  )}

                  {v.reviewed_at && (
                    <p className="text-xs text-muted-foreground">
                      Examiné le {format(new Date(v.reviewed_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
