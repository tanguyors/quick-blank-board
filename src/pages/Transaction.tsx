import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransaction } from '@/hooks/useTransaction';
import { useAuth } from '@/hooks/useAuth';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { TransactionStatusBadge, TransactionTimeline } from '@/components/workflow/TransactionStatus';
import { VisitManagement } from '@/components/workflow/VisitManagement';
import { SecureMessaging } from '@/components/workflow/SecureMessaging';
import { SecurityBanner } from '@/components/workflow/SecurityAlert';
import { OfferForm } from '@/components/workflow/OfferForm';
import { DealFinalization } from '@/components/workflow/DealFinalization';
import { FeedbackQuestionnaire } from '@/components/workflow/FeedbackQuestionnaire';
import { ArrowLeft, FileText, CheckCircle, Loader2, Download, DollarSign, Archive } from 'lucide-react';
import { LanguageButtons } from '@/components/ui/LanguageButtons';
import { useTranslation } from 'react-i18next';
import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/lit.png';
import iconSearch from '@/assets/icons/search.png';
import { Button } from '@/components/ui/button';
import { DocumentGenerationService } from '@/services/documentGenerationService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TransactionExportService } from '@/services/transactionExportService';
import { WorkflowService } from '@/services/workflowService';
import type { TransactionStatus as TxStatus, WfTransaction } from '@/types/workflow';

type TabId = 'apercu' | 'visite' | 'messages' | 'documents';
type ValidatingDoc = string | null;

export default function Transaction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { displayPrice } = useDisplayPrice();
  const [activeTab, setActiveTab] = useState<TabId>('apercu');
  const [validatingDoc, setValidatingDoc] = useState<ValidatingDoc>(null);
  const {
    transaction, logs, messages, documents,
    requestVisit, proposeVisitDates, refuseVisit, confirmVisit,
    completeVisit, rescheduleVisit, expressIntention, makeOffer,
    acceptOffer, rejectOffer, finalizeDeal,
    submitFeedback, sendMessage,
  } = useTransaction(id!);

  if (transaction.isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!transaction.data) {
    return (
      <AppLayout>
        <div className="text-center p-8 text-muted-foreground">{t('txPage.notFound')}</div>
      </AppLayout>
    );
  }

  const tx = transaction.data as WfTransaction;
  const property = tx.properties;
  const isBuyer = user?.id === tx.buyer_id;
  const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'apercu', label: t('txPage.overview') },
    { id: 'visite', label: t('txPage.visit') },
    { id: 'messages', label: t('txPage.messages') },
    { id: 'documents', label: t('txPage.documents') },
  ];

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button onClick={() => navigate('/matches')} className="text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground">{t('txPage.title')}</h1>
              <TransactionStatusBadge status={tx.status as TxStatus} />
            </div>
            {['deal_finalized', 'archived', 'deal_cancelled'].includes(tx.status) && (
              <div className="flex shrink-0 gap-1">
                {['deal_finalized', 'deal_cancelled'].includes(tx.status) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await WorkflowService.updateStatus(tx.id, 'archived', user!.id);
                        toast.success(t('txPage.archivedSuccess'));
                        transaction.refetch();
                      } catch (err) {
                        toast.error(t('txPage.archiveError'));
                      }
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await TransactionExportService.exportTransaction(tx.id);
                      toast.success(t('txPage.downloadSuccess'));
                    } catch (err) {
                      toast.error(t('txPage.downloadError'));
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-1" /> {t('txPage.dossier')}
                </Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto px-4 pb-2">
            <LanguageButtons dense className="flex-nowrap" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'apercu' && (
            <ApercuTab
              tx={tx}
              property={property}
              primaryMedia={primaryMedia}
              logs={logs.data}
              isBuyer={isBuyer}
              displayPrice={displayPrice}
              onMakeOffer={async (args) => makeOffer.mutateAsync(args)}
              onAcceptOffer={async () => acceptOffer.mutateAsync()}
              onRejectOffer={async (args) => rejectOffer.mutateAsync(args)}
              onFinalizeDeal={async () => finalizeDeal.mutateAsync()}
              onSubmitFeedback={async (fb) => submitFeedback.mutateAsync(fb)}
              isMakingOffer={makeOffer.isPending}
              isAcceptingOffer={acceptOffer.isPending}
              isRejectingOffer={rejectOffer.isPending}
              isFinalizing={finalizeDeal.isPending}
              isSubmittingFeedback={submitFeedback.isPending}
            />
          )}
          {activeTab === 'visite' && (
            <VisitManagement
              transaction={tx}
              onRequestVisit={async () => requestVisit.mutateAsync()}
              onProposeVisitDates={async (dates) => proposeVisitDates.mutateAsync(dates)}
              onRefuseVisit={async (reason, details) => refuseVisit.mutateAsync({ reason, details })}
              onConfirmVisit={async (date) => confirmVisit.mutateAsync(date)}
              onCompleteVisit={async (p) => completeVisit.mutateAsync(p)}
              onRescheduleVisit={async () => rescheduleVisit.mutateAsync()}
              onExpressIntention={async (args) => expressIntention.mutateAsync(args)}
              isLoading={requestVisit.isPending || proposeVisitDates.isPending || confirmVisit.isPending || completeVisit.isPending || expressIntention.isPending || refuseVisit.isPending || rescheduleVisit.isPending}
            />
          )}
          {activeTab === 'messages' && (
            <SecureMessaging
              messages={messages.data || []}
              onSendMessage={async (content) => sendMessage.mutateAsync(content)}
              isSending={sendMessage.isPending}
            />
          )}
          {activeTab === 'documents' && (
            <DocumentsTab
              documents={documents.data || []}
              tx={tx}
              isBuyer={isBuyer}
              validatingDoc={validatingDoc}
              onValidate={async (docId) => {
                setValidatingDoc(docId);
                try {
                  await DocumentGenerationService.validateDocument(
                    docId,
                    user!.id,
                    isBuyer ? 'buyer' : 'seller'
                  );
                  toast.success(t('txPage.documentValidated'));
                  documents.refetch();
                  transaction.refetch();
                } catch (err: any) {
                  toast.error(err.message || t('txPage.validationError'));
                } finally {
                  setValidatingDoc(null);
                }
              }}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ApercuTab({ tx, property, primaryMedia, logs, isBuyer, displayPrice, onMakeOffer, onAcceptOffer, onRejectOffer, onFinalizeDeal, onSubmitFeedback, isMakingOffer, isAcceptingOffer, isRejectingOffer, isFinalizing, isSubmittingFeedback }: {
  tx: WfTransaction; property: any; primaryMedia: any; logs: any; isBuyer: boolean;
  displayPrice: (amount: number, fromCurrency: string) => string;
  onMakeOffer: (args: { offerType: string; amount: number; details?: string }) => Promise<any>;
  onAcceptOffer: () => Promise<any>;
  onRejectOffer: (args: { reason?: string; counterAmount?: number }) => Promise<any>;
  onFinalizeDeal: () => Promise<any>;
  onSubmitFeedback: (fb: Record<string, any>) => Promise<any>;
  isMakingOffer: boolean;
  isAcceptingOffer: boolean;
  isRejectingOffer: boolean;
  isFinalizing: boolean;
  isSubmittingFeedback: boolean;
}) {
  const { t } = useTranslation();
  const status = tx.status as TxStatus;

  return (
    <div className="space-y-4 p-4">
      {/* Property card */}
      {property && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {primaryMedia && (
            <img src={primaryMedia.url} alt="" className="w-full h-40 object-cover" />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg text-foreground capitalize">{property.type}</h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <img src={iconMap} alt="" className="h-4 w-4 object-contain" />
              <span className="text-sm">{property.adresse}</span>
            </div>
            <p className="text-primary font-bold text-xl mt-2">
              {property.prix ? displayPrice(property.prix, property.prix_currency) : ''}
            </p>
            <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
              {property.chambres > 0 && (
                <span className="flex items-center gap-1"><img src={iconHome} alt="" className="h-4 w-4 object-contain" /> {property.chambres}</span>
              )}
              {property.salles_bain > 0 && (
                <span className="flex items-center gap-1">🚿 {property.salles_bain}</span>
              )}
              {property.surface && <span className="flex items-center gap-1"><img src={iconSearch} alt="" className="h-4 w-4 object-contain" /> {property.surface}m²</span>}
            </div>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-2">
        <h3 className="font-semibold text-foreground text-sm">{t('transaction.participants')}</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('dashboard.buyer')}</span>
          <span className="text-foreground">{tx.buyer_profile?.full_name || tx.buyer_profile?.email || t('dashboard.buyer')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('dashboard.seller')}</span>
          <span className="text-foreground">{tx.seller_profile?.full_name || tx.seller_profile?.email || t('dashboard.seller')}</span>
        </div>
      </div>

      {/* Security */}
      <SecurityBanner type="anti_scam" />

      {/* Offer form - shown when intention is 'offer' */}
      {status === 'intention_expressed' && isBuyer && tx.buyer_intention === 'offer' && (
        <OfferForm
          transaction={tx}
          onMakeOffer={onMakeOffer}
          isLoading={isMakingOffer}
        />
      )}

      {/* Seller: accept/reject offer */}
      {status === 'offer_made' && !isBuyer && (tx.offer_type === 'home_exchange' || !!tx.offer_amount) && (
        <OfferResponse
          tx={tx}
          displayPrice={displayPrice}
          onAccept={onAcceptOffer}
          onReject={onRejectOffer}
          isAccepting={isAcceptingOffer}
          isRejecting={isRejectingOffer}
        />
      )}

      {/* Buyer: waiting for seller response */}
      {status === 'offer_made' && isBuyer && (tx.offer_type === 'home_exchange' ? (
        <div className="bg-card rounded-xl p-4 border border-border space-y-2">
          <h3 className="font-semibold text-foreground text-sm">{t('txPage.exchangeProposed')}</h3>
          {tx.offer_details && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tx.offer_details}</p>}
          <p className="text-sm text-muted-foreground mt-2">{t('txPage.waitingOwnerResponse')}</p>
        </div>
      ) : !!tx.offer_amount && (
        <div className="bg-card rounded-xl p-4 border border-border space-y-2">
          <h3 className="font-semibold text-foreground text-sm">{t('txPage.offerSent')}</h3>
          <p className="text-primary font-bold text-lg">{displayPrice(tx.offer_amount, property?.prix_currency || 'IDR')}</p>
          {tx.offer_type && <p className="text-xs text-muted-foreground capitalize">Type: {tx.offer_type.replace('_', ' ')}</p>}
          <p className="text-sm text-muted-foreground mt-2">{t('txPage.waitingSellerResponse')}</p>
        </div>
      ))}

      {/* Offer rejected message - shown when back to intention_expressed after rejection */}
      {status === 'intention_expressed' && isBuyer && tx.offer_details && tx.offer_details.startsWith('Offre refusée') && (
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 space-y-2">
          <h3 className="font-semibold text-red-400 text-sm">{t('txPage.offerRejected')}</h3>
          <p className="text-sm text-muted-foreground">{tx.offer_details}</p>
          <p className="text-sm text-muted-foreground">{t('txPage.canReformulate')}</p>
        </div>
      )}

      {/* Offer summary */}
      {(status === 'documents_generated' || status === 'in_validation') && tx.offer_amount && (
        <div className="bg-card rounded-xl p-4 border border-border space-y-2">
          <h3 className="font-semibold text-foreground text-sm">{t('timeline.offer')}</h3>
          <p className="text-primary font-bold text-lg">{displayPrice(tx.offer_amount, property?.prix_currency || 'IDR')}</p>
          {tx.offer_type && <p className="text-xs text-muted-foreground capitalize">Type: {tx.offer_type.replace('_', ' ')}</p>}
          {tx.offer_details && <p className="text-xs text-muted-foreground">{tx.offer_details}</p>}
        </div>
      )}

      {/* Deal finalization */}
      {status === 'in_validation' && (
        <DealFinalization
          transaction={tx}
          onFinalize={onFinalizeDeal}
          isLoading={isFinalizing}
        />
      )}

      {/* Deal finalized celebration + Feedback */}
      {status === 'deal_finalized' && (
        <>
          <DealFinalization
            transaction={tx}
            onFinalize={onFinalizeDeal}
            isLoading={false}
          />
          <FeedbackQuestionnaire
            onSubmit={onSubmitFeedback}
            isLoading={isSubmittingFeedback}
            alreadySubmitted={logs?.some((l: any) => l.action === 'feedback_submitted' && l.actor_id === (isBuyer ? tx.buyer_id : tx.seller_id))}
          />
        </>
      )}

      {/* Timeline */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-foreground text-sm mb-4">{t('transaction.progression')}</h3>
        <TransactionTimeline
          currentStatus={tx.status as TxStatus}
          logs={logs}
        />
      </div>
    </div>
  );
}

function DocumentsTab({
  documents, tx, isBuyer, validatingDoc, onValidate,
}: {
  documents: any[];
  tx: WfTransaction;
  isBuyer: boolean;
  validatingDoc: ValidatingDoc;
  onValidate: (docId: string) => void;
}) {
  const { t } = useTranslation();

  if (documents.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="text-muted-foreground text-sm">{t('txPage.noDocuments')}</p>
        <p className="text-muted-foreground/60 text-xs mt-1">{t('txPage.docsWillGenerate')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <SecurityBanner type="litigation_protection" />
      {documents.map(doc => {
        const myValidated = isBuyer ? doc.buyer_validated : doc.seller_validated;
        const otherValidated = isBuyer ? doc.seller_validated : doc.buyer_validated;
        const isValidating = validatingDoc === doc.id;

        return (
          <div key={doc.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-foreground text-sm">{doc.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{doc.type.replace('_', ' ')}</p>
              </div>
              <div className="flex gap-1">
                {doc.buyer_validated && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {t('txPage.buyer')}
                  </span>
                )}
                {doc.seller_validated && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {t('txPage.seller')}
                  </span>
                )}
              </div>
            </div>

            {/* Document content preview */}
            {doc.content && (
              <div className="mt-3 bg-secondary/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                {doc.content.reference && <p>{t('txPage.ref')}: {doc.content.reference}</p>}
                {doc.content.conditions?.prix_offert && (
                  <p>Montant: {doc.content.conditions.prix_offert.toLocaleString()} {doc.content.conditions?.devise}</p>
                )}
                {doc.content.prix_et_paiement?.prix_vente && (
                  <p>Prix: {doc.content.prix_et_paiement.prix_vente.toLocaleString()} {doc.content.prix_et_paiement?.devise}</p>
                )}
                {doc.content.conditions_financieres?.loyer_mensuel && (
                  <p>Loyer: {doc.content.conditions_financieres.loyer_mensuel.toLocaleString()} {doc.content.conditions_financieres?.devise}/mois</p>
                )}
              </div>
            )}

            {/* Validate button */}
            {!myValidated && (
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={() => onValidate(doc.id)}
                disabled={isValidating}
              >
                {isValidating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('txPage.validation')}</>
                ) : (
                  <><CheckCircle className="h-4 w-4 mr-2" /> {t('txPage.validateDocument')}</>
                )}
              </Button>
            )}

            {myValidated && !otherValidated && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {isBuyer ? t('txPage.waitingOtherValidation') : t('txPage.waitingBuyerValidation')}
              </p>
            )}

            {myValidated && otherValidated && (
              <p className="text-xs text-primary mt-3 text-center font-medium">
                ✓ {t('txPage.documentValidatedBoth')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OfferResponse({ tx, displayPrice, onAccept, onReject, isAccepting, isRejecting }: {
  tx: WfTransaction;
  displayPrice: (amount: number, fromCurrency: string) => string;
  onAccept: () => Promise<any>;
  onReject: (args: { reason?: string; counterAmount?: number }) => Promise<any>;
  isAccepting: boolean;
  isRejecting: boolean;
}) {
  const { t } = useTranslation();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [counterAmount, setCounterAmount] = useState('');
  const property = tx.properties;
  const currency = property?.prix_currency || 'IDR';

  return (
    <div className="bg-card rounded-xl p-4 border border-primary/30 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('txPage.offerReceived')}</h3>
      </div>

      <div className="bg-primary/10 rounded-lg p-3 space-y-1">
        <p className="text-primary font-bold text-xl">
          {tx.offer_amount ? displayPrice(tx.offer_amount, currency) : ''}
        </p>
        {property?.prix && (
          <p className="text-xs text-muted-foreground">
            {t('txPage.listedPrice')} : {displayPrice(property.prix, currency)}
          </p>
        )}
        {tx.offer_type && (
          <p className="text-xs text-muted-foreground capitalize">Type : {tx.offer_type.replace('_', ' ')}</p>
        )}
        {tx.offer_details && (
          <p className="text-sm text-muted-foreground mt-2">{tx.offer_details}</p>
        )}
      </div>

      {!showRejectForm ? (
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={async () => {
              await onAccept();
              toast.success(t('txPage.offerAccepted'));
            }}
            disabled={isAccepting || isRejecting}
          >
            {isAccepting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('txPage.accepting')}</> : t('txPage.accept')}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setShowRejectForm(true)}
            disabled={isAccepting || isRejecting}
          >
            {t('txPage.reject')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('txPage.rejectReason')}</label>
            <Textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder={t('txPage.rejectPlaceholder')}
              rows={2}
              className="bg-secondary/30 border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('txPage.counterOffer')} ({currency}) (optionnel)</label>
            <Input
              type="number"
              value={counterAmount}
              onChange={e => setCounterAmount(e.target.value)}
              placeholder={t('txPage.desiredAmount')}
              className="bg-secondary/30 border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => {
                await onReject({
                  reason: rejectReason || undefined,
                  counterAmount: counterAmount ? Number(counterAmount) : undefined,
                });
                toast.success(t('txPage.offerRejectedToast'));
              }}
              disabled={isRejecting}
            >
              {isRejecting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('txPage.sending')}</> : t('txPage.confirmReject')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectForm(false)}
              disabled={isRejecting}
            >
              {t('profile.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
