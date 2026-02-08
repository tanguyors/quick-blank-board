import { supabase } from '@/integrations/supabase/client';
import { TransactionStatus, VALID_TRANSITIONS } from '@/types/workflow';
import { DocumentGenerationService } from './documentGenerationService';

export class WorkflowService {
  static isValidTransition(from: TransactionStatus, to: TransactionStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static async createTransaction(propertyId: string, buyerId: string, sellerId: string) {
    const { data, error } = await supabase
      .from('wf_transactions')
      .insert({
        property_id: propertyId,
        buyer_id: buyerId,
        seller_id: sellerId,
        status: 'matched' as any,
        matched_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    // Create log entry
    await this.createLog(data.id, 'transaction_created', buyerId, 'buyer', null, 'matched');

    // Create notifications for both parties
    await this.createNotification(
      buyerId, data.id, 'matched',
      'Félicitations ! Nouveau match 🎉',
      'Vous avez matché avec un bien. Commencez par demander une visite !'
    );
    await this.createNotification(
      sellerId, data.id, 'matched',
      'Nouveau coup de cœur ! ❤️',
      'Votre bien vient de recevoir un coup de cœur. Un acheteur pourrait bientôt demander une visite.'
    );

    return data;
  }

  static async updateStatus(
    transactionId: string,
    newStatus: TransactionStatus,
    actorId: string,
    additionalData?: Record<string, any>
  ) {
    // Fetch current transaction
    const { data: tx, error: fetchError } = await supabase
      .from('wf_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    if (fetchError) throw fetchError;

    const currentStatus = tx.status as TransactionStatus;
    if (!this.isValidTransition(currentStatus, newStatus)) {
      throw new Error(`Transition invalide: ${currentStatus} → ${newStatus}`);
    }

    const updateData: Record<string, any> = {
      status: newStatus as any,
      previous_status: currentStatus as any,
      ...additionalData,
    };

    const { error } = await supabase
      .from('wf_transactions')
      .update(updateData)
      .eq('id', transactionId);
    if (error) throw error;

    const actorRole = actorId === tx.buyer_id ? 'buyer' : 'seller';
    await this.createLog(transactionId, `status_change_${newStatus}`, actorId, actorRole, currentStatus, newStatus);

    return { previousStatus: currentStatus, newStatus };
  }

  static async requestVisit(transactionId: string, buyerId: string) {
    return this.updateStatus(transactionId, 'visit_requested', buyerId, {
      visit_requested_at: new Date().toISOString(),
    });
  }

  static async proposeVisitDates(transactionId: string, sellerId: string, dates: { date: string; preference: number }[]) {
    return this.updateStatus(transactionId, 'visit_proposed', sellerId, {
      visit_proposed_dates: dates,
    });
  }

  static async refuseVisit(transactionId: string, sellerId: string, reason: string, details?: string) {
    const result = await this.updateStatus(transactionId, 'visit_cancelled', sellerId, {
      visit_refusal_reason: reason,
      visit_refusal_details: details || null,
    });
    // Penalize seller score
    await supabase.rpc('wf_calculate_user_score', { p_user_id: sellerId });
    return result;
  }

  static async confirmVisit(transactionId: string, userId: string, confirmedDate: string) {
    const { data: tx } = await supabase
      .from('wf_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    if (!tx) throw new Error('Transaction introuvable');

    const isBuyer = userId === tx.buyer_id;
    const updateData: Record<string, any> = {
      visit_confirmed_date: confirmedDate,
    };

    if (isBuyer) {
      updateData.visit_confirmed_by_buyer = true;
    } else {
      updateData.visit_confirmed_by_seller = true;
    }

    // Check if both confirmed
    const bothConfirmed = isBuyer
      ? tx.visit_confirmed_by_seller
      : tx.visit_confirmed_by_buyer;

    if (bothConfirmed) {
      const result = await this.updateStatus(transactionId, 'visit_confirmed', userId, updateData);

      // Create J-1 and H-2 reminders for both participants
      await this.createVisitReminders(transactionId, confirmedDate, tx.buyer_id, tx.seller_id);

      // Send enriched notifications with property details
      await this.sendVisitConfirmedNotifications(transactionId, confirmedDate, tx.buyer_id, tx.seller_id, tx.property_id);

      return result;
    } else {
      // Just update without status change
      await supabase
        .from('wf_transactions')
        .update(updateData)
        .eq('id', transactionId);
      return { partial: true };
    }
  }

  static async rescheduleVisit(transactionId: string, userId: string) {
    return this.updateStatus(transactionId, 'visit_rescheduled', userId, {
      visit_confirmed_date: null,
      visit_confirmed_by_buyer: false,
      visit_confirmed_by_seller: false,
      visit_proposed_dates: null,
    });
  }

  private static async createVisitReminders(
    transactionId: string, confirmedDate: string, buyerId: string, sellerId: string
  ) {
    const visitDate = new Date(confirmedDate);

    // J-1: 24 hours before
    const j1Date = new Date(visitDate.getTime() - 24 * 60 * 60 * 1000);
    // H-2: 2 hours before
    const h2Date = new Date(visitDate.getTime() - 2 * 60 * 60 * 1000);

    const now = new Date();
    const reminders: any[] = [];

    for (const userId of [buyerId, sellerId]) {
      if (j1Date > now) {
        reminders.push({
          transaction_id: transactionId,
          user_id: userId,
          reminder_type: 'visit_reminder',
          scheduled_at: j1Date.toISOString(),
          metadata: { type: 'j-1', visit_date: confirmedDate },
        });
      }
      if (h2Date > now) {
        reminders.push({
          transaction_id: transactionId,
          user_id: userId,
          reminder_type: 'visit_reminder',
          scheduled_at: h2Date.toISOString(),
          metadata: { type: 'h-2', visit_date: confirmedDate },
        });
      }
    }

    if (reminders.length > 0) {
      await supabase.from('wf_reminders').insert(reminders);
    }
  }

  static async completeVisit(transactionId: string, userId: string, wasPresent: boolean) {
    const { data: tx } = await supabase
      .from('wf_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    if (!tx) throw new Error('Transaction introuvable');

    const isBuyer = userId === tx.buyer_id;

    if (!wasPresent) {
      const noShowField = isBuyer ? 'seller_no_show' : 'buyer_no_show';
      await supabase
        .from('wf_transactions')
        .update({ [noShowField]: true })
        .eq('id', transactionId);
      // Penalize no-show user
      const noShowUserId = isBuyer ? tx.seller_id : tx.buyer_id;
      await supabase.rpc('wf_calculate_user_score', { p_user_id: noShowUserId });
    }

    return this.updateStatus(transactionId, 'visit_completed', userId, {
      visit_completed_at: new Date().toISOString(),
    });
  }

  static async expressIntention(
    transactionId: string, buyerId: string,
    intention: 'continue' | 'offer' | 'stop',
    reason?: string, details?: string
  ) {
    if (intention === 'stop') {
      return this.updateStatus(transactionId, 'deal_cancelled', buyerId, {
        buyer_intention: intention,
        rejection_reason: reason || null,
        rejection_details: details || null,
      });
    }
    return this.updateStatus(transactionId, 'intention_expressed', buyerId, {
      buyer_intention: intention,
    });
  }

  static async makeOffer(
    transactionId: string, buyerId: string,
    offerType: string, amount: number, details?: string
  ) {
    const result = await this.updateStatus(transactionId, 'offer_made', buyerId, {
      offer_type: offerType,
      offer_amount: amount,
      offer_details: details || null,
    });

    // Auto-generate documents after offer
    try {
      await DocumentGenerationService.generateDocumentsForOffer(transactionId);
    } catch (e) {
      console.error('Document generation failed:', e);
    }

    return result;
  }

  static async finalizeDeal(transactionId: string, userId: string) {
    const { data: tx } = await supabase
      .from('wf_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    if (!tx) throw new Error('Transaction introuvable');

    const isBuyer = userId === tx.buyer_id;
    const updateData: Record<string, any> = {};

    if (isBuyer) {
      updateData.buyer_validated = true;
      updateData.buyer_validated_at = new Date().toISOString();
    } else {
      updateData.seller_validated = true;
      updateData.seller_validated_at = new Date().toISOString();
    }

    // Check if both validated
    const bothValidated = isBuyer ? tx.seller_validated : tx.buyer_validated;

    if (bothValidated) {
      const result = await this.updateStatus(transactionId, 'deal_finalized', userId, {
        ...updateData,
        deal_finalized_at: new Date().toISOString(),
      });

      // Certify both users
      await Promise.all([
        supabase.from('wf_user_scores').update({
          certified: true,
          certified_at: new Date().toISOString(),
        }).eq('user_id', tx.buyer_id),
        supabase.from('wf_user_scores').update({
          certified: true,
          certified_at: new Date().toISOString(),
        }).eq('user_id', tx.seller_id),
        // Recalculate scores
        supabase.rpc('wf_calculate_user_score', { p_user_id: tx.buyer_id }),
        supabase.rpc('wf_calculate_user_score', { p_user_id: tx.seller_id }),
      ]);

      // Notify both
      await this.createNotification(
        tx.buyer_id, transactionId, 'deal_finalized',
        'Deal finalisé ! 🎉',
        'Félicitations ! Votre transaction a été finalisée avec succès. Vous êtes maintenant Client Certifié !'
      );
      await this.createNotification(
        tx.seller_id, transactionId, 'deal_finalized',
        'Deal finalisé ! 🎉',
        'Félicitations ! Votre transaction a été finalisée avec succès. Vous êtes maintenant Client Certifié !'
      );

      return result;
    } else {
      // Partial validation
      await supabase.from('wf_transactions').update(updateData).eq('id', transactionId);
      return { partial: true };
    }
  }

  static async submitFeedback(transactionId: string, userId: string, feedback: Record<string, any>) {
    await this.createLog(transactionId, 'feedback_submitted', userId, 'participant', 'deal_finalized', 'deal_finalized');
    // Store feedback in log details
    await supabase.from('wf_transaction_logs').insert({
      transaction_id: transactionId,
      action: 'feedback_submitted',
      actor_id: userId,
      actor_role: 'participant',
      details: feedback as any,
    });
  }

  // ------ Helpers ------

  private static async createLog(
    transactionId: string, action: string, actorId: string,
    actorRole: string, previousStatus: TransactionStatus | null,
    newStatus: TransactionStatus
  ) {
    await supabase.from('wf_transaction_logs').insert({
      transaction_id: transactionId,
      action,
      actor_id: actorId,
      actor_role: actorRole,
      previous_status: previousStatus as any,
      new_status: newStatus as any,
    });
  }

  private static async createNotification(
    userId: string, transactionId: string,
    type: string, title: string, message: string,
    data?: Record<string, any>
  ) {
    await supabase.from('wf_notifications').insert({
      user_id: userId,
      transaction_id: transactionId,
      type,
      title,
      message,
      action_url: `/transaction/${transactionId}`,
      data: data as any ?? null,
    });
  }

  private static async sendVisitConfirmedNotifications(
    transactionId: string, confirmedDate: string,
    buyerId: string, sellerId: string, propertyId: string
  ) {
    // Fetch property details for enriched notification
    const { data: property } = await supabase
      .from('properties')
      .select('type, adresse, prix, prix_currency')
      .eq('id', propertyId)
      .single();

    const dateStr = new Date(confirmedDate).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    });

    const propertyLabel = property
      ? `${property.type} — ${property.adresse}`
      : 'Bien immobilier';

    const enrichedData = {
      property_type: property?.type,
      property_address: property?.adresse,
      property_price: property?.prix,
      property_currency: property?.prix_currency,
      visit_date: confirmedDate,
      visit_date_formatted: dateStr,
    };

    const message = `📅 ${dateStr}\n📍 ${propertyLabel}\n\nCliquez pour voir les détails de votre visite.`;

    await Promise.all([
      this.createNotification(buyerId, transactionId, 'visit_confirmed',
        'Visite confirmée ! 📅', message, enrichedData),
      this.createNotification(sellerId, transactionId, 'visit_confirmed',
        'Visite confirmée ! 📅', message, enrichedData),
    ]);
  }
}
