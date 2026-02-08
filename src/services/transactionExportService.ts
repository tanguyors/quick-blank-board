import { supabase } from '@/integrations/supabase/client';
import type { WfTransaction } from '@/types/workflow';

export class TransactionExportService {
  static async exportTransaction(transactionId: string): Promise<void> {
    // Fetch all transaction data in parallel
    const [txRes, logsRes, docsRes, msgsRes] = await Promise.all([
      supabase
        .from('wf_transactions')
        .select('*')
        .eq('id', transactionId)
        .single(),
      supabase
        .from('wf_transaction_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true }),
      supabase
        .from('wf_documents')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true }),
      supabase
        .from('wf_messages')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true }),
    ]);

    if (txRes.error) throw txRes.error;

    const tx = txRes.data;

    // Fetch property + profiles
    const [propRes, buyerRes, sellerRes] = await Promise.all([
      supabase.from('properties').select('type, adresse, prix, prix_currency, surface, chambres, salles_bain').eq('id', tx.property_id).single(),
      supabase.from('profiles').select('full_name, email').eq('id', tx.buyer_id).single(),
      supabase.from('profiles').select('full_name, email').eq('id', tx.seller_id).single(),
    ]);

    const property = propRes.data;
    const buyer = buyerRes.data;
    const seller = sellerRes.data;

    // Build readable export
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('           DOSSIER DE TRANSACTION — SOMAGATE');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Date d'export : ${new Date().toLocaleString('fr-FR')}`);
    lines.push(`ID Transaction : ${transactionId}`);
    lines.push(`Statut : ${tx.status}`);
    lines.push('');

    // Property
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('  BIEN IMMOBILIER');
    lines.push('───────────────────────────────────────────────────────────');
    if (property) {
      lines.push(`  Type : ${property.type}`);
      lines.push(`  Adresse : ${property.adresse}`);
      lines.push(`  Prix : ${property.prix?.toLocaleString('fr-FR')} ${property.prix_currency}`);
      if (property.surface) lines.push(`  Surface : ${property.surface} m²`);
      if (property.chambres) lines.push(`  Chambres : ${property.chambres}`);
      if (property.salles_bain) lines.push(`  Salles de bain : ${property.salles_bain}`);
    }
    lines.push('');

    // Participants
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('  PARTICIPANTS');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`  Acheteur : ${buyer?.full_name || buyer?.email || tx.buyer_id}`);
    lines.push(`  Vendeur  : ${seller?.full_name || seller?.email || tx.seller_id}`);
    lines.push('');

    // Timeline key dates
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('  DATES CLÉS');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`  Match : ${formatDate(tx.matched_at)}`);
    if (tx.visit_requested_at) lines.push(`  Visite demandée : ${formatDate(tx.visit_requested_at)}`);
    if (tx.visit_confirmed_date) lines.push(`  Visite confirmée : ${formatDate(tx.visit_confirmed_date)}`);
    if (tx.visit_completed_at) lines.push(`  Visite effectuée : ${formatDate(tx.visit_completed_at)}`);
    if (tx.deal_finalized_at) lines.push(`  Deal finalisé : ${formatDate(tx.deal_finalized_at)}`);
    lines.push('');

    // Offer
    if (tx.offer_amount) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('  OFFRE');
      lines.push('───────────────────────────────────────────────────────────');
      lines.push(`  Type : ${tx.offer_type || 'N/A'}`);
      lines.push(`  Montant : ${tx.offer_amount?.toLocaleString('fr-FR')} ${property?.prix_currency || 'XOF'}`);
      if (tx.offer_details) lines.push(`  Détails : ${tx.offer_details}`);
      lines.push('');
    }

    // Documents
    const docs = docsRes.data || [];
    if (docs.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('  DOCUMENTS');
      lines.push('───────────────────────────────────────────────────────────');
      for (const doc of docs) {
        lines.push(`  [${doc.type}] ${doc.title}`);
        lines.push(`    Créé le : ${formatDate(doc.created_at)}`);
        lines.push(`    Acheteur validé : ${doc.buyer_validated ? `Oui (${formatDate(doc.buyer_validated_at)})` : 'Non'}`);
        lines.push(`    Vendeur validé : ${doc.seller_validated ? `Oui (${formatDate(doc.seller_validated_at)})` : 'Non'}`);
        lines.push('');
      }
    }

    // Messages
    const msgs = msgsRes.data || [];
    if (msgs.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push(`  MESSAGES (${msgs.length} échanges)`);
      lines.push('───────────────────────────────────────────────────────────');
      for (const msg of msgs) {
        const sender = msg.sender_id === tx.buyer_id ? 'Acheteur' : 'Vendeur';
        const flags: string[] = [];
        if (msg.contains_phone_number) flags.push('📞 Numéro détecté');
        if (msg.flagged_suspicious) flags.push('⚠️ Suspect');
        const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
        lines.push(`  ${formatDate(msg.created_at)} — ${sender}${flagStr}`);
        lines.push(`    ${msg.content}`);
        lines.push('');
      }
    }

    // Logs
    const logs = logsRes.data || [];
    if (logs.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push(`  HISTORIQUE (${logs.length} événements)`);
      lines.push('───────────────────────────────────────────────────────────');
      for (const log of logs) {
        lines.push(`  ${formatDate(log.created_at)} — ${log.action} (${log.actor_role || 'système'})`);
        if (log.previous_status && log.new_status) {
          lines.push(`    ${log.previous_status} → ${log.new_status}`);
        }
      }
      lines.push('');
    }

    // Security footer
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('  En cas de litige, SomaGate conserve l\'historique');
    lines.push('  complet du projet. Ce document fait foi.');
    lines.push('═══════════════════════════════════════════════════════════');

    // Download
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `somagate-dossier-${transactionId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
