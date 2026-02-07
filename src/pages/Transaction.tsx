import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransaction } from '@/hooks/useTransaction';
import { useAuth } from '@/hooks/useAuth';
import { TransactionStatusBadge, TransactionTimeline } from '@/components/workflow/TransactionStatus';
import { VisitManagement } from '@/components/workflow/VisitManagement';
import { SecureMessaging } from '@/components/workflow/SecureMessaging';
import { SecurityBanner } from '@/components/workflow/SecurityAlert';
import { ArrowLeft, FileText, MapPin, BedDouble, Bath, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TransactionStatus as TxStatus, WfTransaction } from '@/types/workflow';

type TabId = 'apercu' | 'visite' | 'messages' | 'documents';

export default function Transaction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('apercu');

  const {
    transaction, logs, messages, documents,
    requestVisit, proposeVisitDates, confirmVisit,
    completeVisit, expressIntention, makeOffer, sendMessage,
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
        <div className="text-center p-8 text-muted-foreground">Transaction introuvable</div>
      </AppLayout>
    );
  }

  const tx = transaction.data as WfTransaction;
  const property = tx.properties;
  const isBuyer = user?.id === tx.buyer_id;
  const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'visite', label: 'Visite' },
    { id: 'messages', label: 'Messages' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Transaction</h1>
            <TransactionStatusBadge status={tx.status as TxStatus} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
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
            <ApercuTab tx={tx} property={property} primaryMedia={primaryMedia} logs={logs.data} isBuyer={isBuyer} />
          )}
          {activeTab === 'visite' && (
            <VisitManagement
              transaction={tx}
              onRequestVisit={async () => requestVisit.mutateAsync()}
              onProposeVisitDates={async (dates) => proposeVisitDates.mutateAsync(dates)}
              onConfirmVisit={async (date) => confirmVisit.mutateAsync(date)}
              onCompleteVisit={async (p) => completeVisit.mutateAsync(p)}
              onExpressIntention={async (args) => expressIntention.mutateAsync(args)}
              isLoading={requestVisit.isPending || proposeVisitDates.isPending || confirmVisit.isPending || completeVisit.isPending || expressIntention.isPending}
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
            <DocumentsTab documents={documents.data || []} tx={tx} isBuyer={isBuyer} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ApercuTab({ tx, property, primaryMedia, logs, isBuyer }: {
  tx: WfTransaction; property: any; primaryMedia: any; logs: any; isBuyer: boolean;
}) {
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
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{property.adresse}</span>
            </div>
            <p className="text-primary font-bold text-xl mt-2">
              {property.prix?.toLocaleString()} {property.prix_currency}
            </p>
            <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.chambres}</span>
              <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.salles_bain}</span>
              {property.surface && <span className="flex items-center gap-1"><Maximize2 className="h-4 w-4" /> {property.surface}m²</span>}
            </div>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-2">
        <h3 className="font-semibold text-foreground text-sm">Participants</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Acheteur</span>
          <span className="text-foreground">{tx.buyer_profile?.full_name || tx.buyer_profile?.email || 'Acheteur'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Vendeur</span>
          <span className="text-foreground">{tx.seller_profile?.full_name || tx.seller_profile?.email || 'Vendeur'}</span>
        </div>
      </div>

      {/* Security */}
      <SecurityBanner type="anti_scam" />

      {/* Timeline */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-foreground text-sm mb-4">Progression</h3>
        <TransactionTimeline
          currentStatus={tx.status as TxStatus}
          logs={logs}
        />
      </div>
    </div>
  );
}

function DocumentsTab({ documents, tx, isBuyer }: { documents: any[]; tx: WfTransaction; isBuyer: boolean }) {
  if (documents.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="text-muted-foreground text-sm">Aucun document pour le moment</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Les documents seront générés après votre offre.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {documents.map(doc => (
        <div key={doc.id} className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-foreground text-sm">{doc.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{doc.type}</p>
            </div>
            <div className="flex gap-1">
              {doc.buyer_validated && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Acheteur ✓</span>}
              {doc.seller_validated && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Vendeur ✓</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
