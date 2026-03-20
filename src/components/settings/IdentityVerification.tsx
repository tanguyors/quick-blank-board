import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIdentityVerification } from '@/hooks/useIdentityVerification';
import { toast } from 'sonner';
import { Upload, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

import iconVerifiedDoc from '@/assets/icons/verified_doc.png';

export function IdentityVerification() {
  const { verification, submitVerification } = useIdentityVerification();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const status = verification.data?.status;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 10 Mo');
      return;
    }

    setUploading(true);
    try {
      await submitVerification.mutateAsync(file);
      toast.success('Document soumis ! Vérification en cours.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <img src={iconVerifiedDoc} alt="" className="h-5 w-5 object-contain" />
        <h3 className="text-lg font-bold text-foreground">Vérification d'identité</h3>
      </div>

      {!status && (
        <>
          <p className="text-sm text-muted-foreground">
            Soumettez une pièce d'identité (carte d'identité, passeport) pour vérifier votre profil et renforcer la confiance.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full gap-2"
            variant="outline"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Envoi en cours...' : 'Envoyer ma pièce d\'identité'}
          </Button>
        </>
      )}

      {status === 'pending' && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">En attente de vérification</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Votre document a été soumis et est en cours d'examen par notre équipe.
            </p>
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Identité vérifiée ✅</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Votre identité a été confirmée. Votre profil bénéficie d'un badge de confiance.
            </p>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <>
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Vérification refusée</p>
              {verification.data?.rejection_reason && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Raison : {verification.data.rejection_reason}
                </p>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            {uploading ? 'Envoi en cours...' : 'Soumettre à nouveau'}
          </Button>
        </>
      )}
    </div>
  );
}
