import { supabase } from '@/integrations/supabase/client';

const PHONE_PATTERNS = [
  /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}/g,
  /\b\d{10}\b/g,
  /\b0[67]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b/g,
  /\+\d{1,3}\s?\d{1,2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g,
];

const SUSPICIOUS_KEYWORDS = [
  'whatsapp', 'telegram', 'signal', 'viber',
  'appelle-moi', 'appel', 'telephone', 'téléphone',
  'virement', 'western union', 'moneygram', 'money gram',
  'bitcoin', 'crypto', 'usdt', 'binance',
  'cash', 'espèces', 'especes', 'liquide',
  'iban', 'rib', 'compte bancaire', 'numéro de compte',
  'hors plateforme', 'directement', 'en direct',
  'mon numéro', 'mon numero', 'contacte-moi', 'contactez-moi',
];

export class MessageDetectionService {
  static detectPhoneNumber(content: string): boolean {
    const cleaned = content.replace(/\s+/g, ' ');
    return PHONE_PATTERNS.some(pattern => {
      pattern.lastIndex = 0;
      const matches = cleaned.match(pattern);
      if (!matches) return false;
      // Filter out short numbers that aren't phone numbers
      return matches.some(m => m.replace(/\D/g, '').length >= 8);
    });
  }

  static detectSuspiciousBehavior(content: string): { isSuspicious: boolean; matchedKeywords: string[] } {
    const lower = content.toLowerCase();
    const matchedKeywords = SUSPICIOUS_KEYWORDS.filter(kw => lower.includes(kw));
    return {
      isSuspicious: matchedKeywords.length > 0,
      matchedKeywords,
    };
  }

  static async analyzeAndSaveMessage(
    transactionId: string,
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<{ success: boolean; blocked?: boolean; reason?: string; suspicious?: boolean; matchedKeywords?: string[] }> {
    const hasPhoneNumber = this.detectPhoneNumber(content);
    const { isSuspicious, matchedKeywords } = this.detectSuspiciousBehavior(content);

    // Block if phone number detected
    if (hasPhoneNumber) {
      return {
        success: false,
        blocked: true,
        reason: 'Votre message contient un numéro de téléphone. Pour votre sécurité, les échanges de coordonnées personnelles ne sont pas autorisés sur SomaGate.',
      };
    }

    // Save message
    const { error } = await supabase.from('wf_messages').insert({
      transaction_id: transactionId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      contains_phone_number: false,
      flagged_suspicious: isSuspicious,
    });

    if (error) throw error;

    // Send warning if suspicious
    if (isSuspicious) {
      await supabase.from('wf_notifications').insert({
        user_id: senderId,
        transaction_id: transactionId,
        type: 'security_warning',
        title: '⚠️ Message suspect détecté',
        message: `Votre message contient des termes suspects (${matchedKeywords.join(', ')}). Nous vous rappelons que tous les échanges doivent rester sur la plateforme SomaGate pour votre protection.`,
        action_url: `/transaction/${transactionId}`,
      });
    }

    return {
      success: true,
      suspicious: isSuspicious,
      matchedKeywords: isSuspicious ? matchedKeywords : undefined,
    };
  }

  static async getTransactionMessages(transactionId: string) {
    const { data, error } = await supabase
      .from('wf_messages')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  static async markAsRead(transactionId: string, userId: string) {
    await supabase
      .from('wf_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('transaction_id', transactionId)
      .eq('receiver_id', userId)
      .is('read_at', null);
  }
}
