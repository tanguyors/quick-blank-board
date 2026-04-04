import { useRef, useState } from 'react';
import { useExchangeDocuments } from '@/hooks/useExchangeDocuments';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import iconShield from '@/assets/icons/shield_check.png';

const DOC_TYPES = [
  { value: 'insurance', labelKey: 'homeExchange.insuranceConfirm' },
  { value: 'exchange_authorization', labelKey: 'homeExchange.exchangeAllowedConfirm' },
];

export function ExchangeDocumentUpload() {
  const { t } = useTranslation();
  const { documents, submitDocument } = useExchangeDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    try {
      await submitDocument.mutateAsync({ file, documentType: selectedType });
      toast.success('Document soumis avec succès');
      setSelectedType('');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getDocStatus = (type: string) => {
    const doc = (documents.data || []).find((d: any) => d.document_type === type);
    return doc || null;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <img src={iconShield} alt="" className="h-6 w-6 object-contain" />
        <div>
          <h3 className="font-semibold text-foreground text-sm">Documents obligatoires — Home Exchange</h3>
          <p className="text-xs text-muted-foreground">Ces documents doivent être validés pour accéder à Home Exchange</p>
        </div>
      </div>

      <div className="space-y-3">
        {DOC_TYPES.map(docType => {
          const status = getDocStatus(docType.value);
          return (
            <div key={docType.value} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {!status && <FileText className="h-5 w-5 text-muted-foreground" />}
                {status?.status === 'pending' && <Clock className="h-5 w-5 text-amber-500" />}
                {status?.status === 'approved' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                {status?.status === 'rejected' && <XCircle className="h-5 w-5 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-tight">{t(docType.labelKey)}</p>
                {!status && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1.5"
                    onClick={() => {
                      setSelectedType(docType.value);
                      fileInputRef.current?.click();
                    }}
                    disabled={submitDocument.isPending}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Envoyer le document
                  </Button>
                )}
                {status?.status === 'pending' && (
                  <p className="text-xs text-amber-500 mt-1">En attente de validation</p>
                )}
                {status?.status === 'approved' && (
                  <p className="text-xs text-emerald-500 mt-1">Document validé</p>
                )}
                {status?.status === 'rejected' && (
                  <>
                    <p className="text-xs text-destructive mt-1">
                      Refusé{status.rejection_reason ? ` : ${status.rejection_reason}` : ''}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 gap-1.5"
                      onClick={() => {
                        setSelectedType(docType.value);
                        fileInputRef.current?.click();
                      }}
                      disabled={submitDocument.isPending}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Renvoyer
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
