import { useState } from 'react';
import { useAdminExchangeDocuments } from '@/hooks/useExchangeDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function AdminExchangeDocsTab() {
  const { documents, reviewDocument } = useAdminExchangeDocuments();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const filtered = (documents.data || []).filter((d: any) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const counts = {
    all: (documents.data || []).length,
    pending: (documents.data || []).filter((d: any) => d.status === 'pending').length,
    approved: (documents.data || []).filter((d: any) => d.status === 'approved').length,
    rejected: (documents.data || []).filter((d: any) => d.status === 'rejected').length,
  };

  const handleApprove = async (id: string) => {
    try {
      await reviewDocument.mutateAsync({ id, status: 'approved' });
      toast.success('Document approuvé');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectionReasons[id];
    if (!reason?.trim()) {
      toast.error('Raison du refus requise');
      return;
    }
    try {
      await reviewDocument.mutateAsync({ id, status: 'rejected', rejectionReason: reason });
      toast.success('Document refusé');
      setRejectionReasons(prev => ({ ...prev, [id]: '' }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-foreground">Documents Exchange</h2>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Refusés'} ({counts[f]})
          </button>
        ))}
      </div>

      {/* List */}
      {documents.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun document</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc: any) => (
            <div key={doc.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {(doc as any).profiles?.full_name || (doc as any).profiles?.email || doc.user_id.slice(0, 8)}
                  </span>
                </div>
                <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {doc.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                  {doc.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {doc.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                  {doc.status}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Type : <span className="text-foreground">{doc.document_type === 'insurance' ? 'Assurance habitation' : 'Autorisation échange'}</span></p>
                <p>Soumis le : {new Date(doc.submitted_at).toLocaleDateString()}</p>
              </div>

              {doc.document_url && (
                <a
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Voir le document
                </a>
              )}

              {doc.status === 'pending' && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1" onClick={() => handleApprove(doc.id)} disabled={reviewDocument.isPending}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approuver
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => handleReject(doc.id)} disabled={reviewDocument.isPending}>
                      <XCircle className="h-3.5 w-3.5" /> Refuser
                    </Button>
                  </div>
                  <Input
                    placeholder="Raison du refus (obligatoire pour refuser)"
                    value={rejectionReasons[doc.id] || ''}
                    onChange={e => setRejectionReasons(prev => ({ ...prev, [doc.id]: e.target.value }))}
                    className="text-xs"
                  />
                </div>
              )}

              {doc.status === 'rejected' && doc.rejection_reason && (
                <p className="text-xs text-destructive">Raison : {doc.rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
