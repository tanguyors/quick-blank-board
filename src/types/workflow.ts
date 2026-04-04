export type TransactionStatus =
  | 'matched'
  | 'visit_requested'
  | 'visit_proposed'
  | 'visit_confirmed'
  | 'visit_completed'
  | 'visit_cancelled'
  | 'visit_rescheduled'
  | 'intention_expressed'
  | 'offer_made'
  | 'documents_generated'
  | 'in_validation'
  | 'deal_finalized'
  | 'deal_cancelled'
  | 'archived';

export const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  matched: ['visit_requested'],
  visit_requested: ['visit_proposed', 'visit_cancelled'],
  visit_proposed: ['visit_confirmed', 'visit_cancelled', 'visit_rescheduled'],
  visit_confirmed: ['visit_completed', 'visit_cancelled', 'visit_rescheduled'],
  visit_completed: ['intention_expressed', 'deal_cancelled'],
  visit_cancelled: ['visit_requested', 'archived'],
  visit_rescheduled: ['visit_confirmed', 'visit_cancelled'],
  intention_expressed: ['intention_expressed', 'offer_made', 'deal_cancelled'],
  offer_made: ['documents_generated', 'intention_expressed', 'deal_cancelled'],
  documents_generated: ['in_validation'],
  in_validation: ['deal_finalized', 'documents_generated'],
  deal_finalized: ['archived'],
  deal_cancelled: ['archived'],
  archived: [],
};

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  matched: 'Match établi',
  visit_requested: 'Visite demandée',
  visit_proposed: 'Dates proposées',
  visit_confirmed: 'Visite confirmée',
  visit_completed: 'Visite effectuée',
  visit_cancelled: 'Visite annulée',
  visit_rescheduled: 'Visite reportée',
  intention_expressed: 'Intention exprimée',
  offer_made: 'Offre en attente',
  documents_generated: 'Documents générés',
  in_validation: 'En validation',
  deal_finalized: 'Deal finalisé',
  deal_cancelled: 'Deal annulé',
  archived: 'Archivé',
};

export const STATUS_COLORS: Record<TransactionStatus, string> = {
  matched: 'bg-blue-500/20 text-blue-400',
  visit_requested: 'bg-amber-500/20 text-amber-400',
  visit_proposed: 'bg-orange-500/20 text-orange-400',
  visit_confirmed: 'bg-green-500/20 text-green-400',
  visit_completed: 'bg-emerald-500/20 text-emerald-400',
  visit_cancelled: 'bg-red-500/20 text-red-400',
  visit_rescheduled: 'bg-yellow-500/20 text-yellow-400',
  intention_expressed: 'bg-purple-500/20 text-purple-400',
  offer_made: 'bg-indigo-500/20 text-indigo-400',
  documents_generated: 'bg-cyan-500/20 text-cyan-400',
  in_validation: 'bg-teal-500/20 text-teal-400',
  deal_finalized: 'bg-green-600/20 text-green-300',
  deal_cancelled: 'bg-red-600/20 text-red-300',
  archived: 'bg-zinc-500/20 text-zinc-400',
};

export const SECURITY_MESSAGES = {
  anti_scam: "De nombreuses escroqueries existent dans la location et l'immobilier. En utilisant SOMA GATE à chaque étape, vous conservez des preuves claires et datées. Nous vous recommandons vivement de tout effectuer au sein de la plateforme.",
  no_phone_exchange: "SomaGate a été conçu pour centraliser et conserver l'ensemble des échanges liés à votre projet immobilier. En échangeant en dehors de SomaGate, vous renoncez volontairement aux avantages de la plateforme ainsi qu'à toute protection liée à la centralisation des preuves.",
  no_show_warning: "Les biens proposés sur SomaGate sont publiés par des propriétaires pour qui la vente ou la location n'est pas forcément leur activité professionnelle. Par respect pour leur temps, il est indispensable de prévenir en cas d'empêchement. Les rendez-vous non honorés impactent négativement votre score de confiance.",
  visit_refusal_warning: "Les refus de visites peuvent diminuer votre score SomaGate.",
  litigation_protection: "En cas de litige ou de doute, SOMA GATE conserve l'historique complet du projet.",
} as const;

export type SecurityMessageType = keyof typeof SECURITY_MESSAGES;

export interface WfTransaction {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  status: TransactionStatus;
  previous_status: TransactionStatus | null;
  matched_at: string;
  visit_requested_at: string | null;
  visit_proposed_dates: any;
  visit_confirmed_date: string | null;
  visit_confirmed_by_buyer: boolean;
  visit_confirmed_by_seller: boolean;
  visit_refusal_reason: string | null;
  visit_refusal_details: string | null;
  visit_completed_at: string | null;
  buyer_intention: string | null;
  rejection_reason: string | null;
  rejection_details: string | null;
  offer_type: string | null;
  offer_amount: number | null;
  offer_details: string | null;
  buyer_validated: boolean;
  seller_validated: boolean;
  buyer_validated_at: string | null;
  seller_validated_at: string | null;
  deal_finalized_at: string | null;
  buyer_no_show: boolean;
  seller_no_show: boolean;
  deposit_paid: boolean;
  deposit_amount: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  properties?: any;
  buyer_profile?: any;
  seller_profile?: any;
}

export interface WfMessage {
  id: string;
  transaction_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  contains_phone_number: boolean;
  flagged_suspicious: boolean;
  read_at: string | null;
  created_at: string;
}

export interface WfDocument {
  id: string;
  transaction_id: string;
  type: string;
  title: string;
  content: any;
  pdf_url: string | null;
  buyer_validated: boolean;
  seller_validated: boolean;
  buyer_validated_at: string | null;
  seller_validated_at: string | null;
  version: number;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}

export interface WfNotification {
  id: string;
  user_id: string;
  transaction_id: string | null;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  action_url: string | null;
  data: any;
  created_at: string;
}
