import { supabase } from '@/integrations/supabase/client';

export type EmailTemplate =
  | 'matched'
  | 'visit_confirmed'
  | 'visit_reminder'
  | 'offer_made'
  | 'deal_finalized'
  | 'generic';

interface SendEmailParams {
  to: string | string[];
  template: EmailTemplate;
  data?: Record<string, any>;
}

export class EmailService {
  /**
   * Send a transactional email via the send-email edge function.
   * Fails silently (logs error) so it never blocks the workflow.
   */
  static async send(params: SendEmailParams): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      });

      if (error) {
        console.error('[EmailService] Edge function error:', error);
        return false;
      }

      console.log('[EmailService] Email sent:', data);
      return true;
    } catch (e) {
      console.error('[EmailService] Failed to send email:', e);
      return false;
    }
  }

  /**
   * Send an email to a user by their profile ID.
   * Fetches the email from the profiles table.
   */
  static async sendToUser(
    userId: string,
    template: EmailTemplate,
    data?: Record<string, any>
  ): Promise<boolean> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, first_name')
      .eq('id', userId)
      .single();

    if (!profile?.email) {
      console.warn(`[EmailService] No email found for user ${userId}`);
      return false;
    }

    return this.send({
      to: profile.email,
      template,
      data: {
        ...data,
        recipient_name: profile.first_name || profile.full_name || undefined,
      },
    });
  }

  /**
   * Send emails to both buyer and seller of a transaction.
   */
  static async sendToTransactionParties(
    buyerId: string,
    sellerId: string,
    template: EmailTemplate,
    data?: Record<string, any>
  ): Promise<void> {
    await Promise.allSettled([
      this.sendToUser(buyerId, template, data),
      this.sendToUser(sellerId, template, data),
    ]);
  }
}
