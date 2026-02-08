import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_FROM = 'SOMA <notifications@app.somagate.com>'

// Email templates
const templates: Record<string, (data: Record<string, any>) => { subject: string; html: string }> = {
  matched: (data) => ({
    subject: '🎉 Nouveau match — Un acheteur s\'intéresse à votre bien !',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Nouveau Match !</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Bonjour <strong>${data.recipient_name || 'cher utilisateur'}</strong>,</p>
          <p style="font-size: 16px; color: #333;">${data.message || 'Vous avez un nouveau match sur SOMA !'}</p>
          ${data.property_type ? `
            <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #667eea;">
              <p style="margin: 4px 0; color: #555;"><strong>Bien :</strong> ${data.property_type}</p>
              ${data.property_address ? `<p style="margin: 4px 0; color: #555;"><strong>Adresse :</strong> ${data.property_address}</p>` : ''}
              ${data.property_price ? `<p style="margin: 4px 0; color: #555;"><strong>Prix :</strong> ${Number(data.property_price).toLocaleString('fr-FR')} ${data.property_currency || 'XOF'}</p>` : ''}
            </div>
          ` : ''}
          <div style="text-align: center; margin-top: 24px;">
            <a href="${data.action_url || 'https://app.somagate.com'}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Voir le détail</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f1f3f5; text-align: center; font-size: 12px; color: #888;">
          <p>SOMA — La plateforme immobilière intelligente</p>
        </div>
      </div>
    `,
  }),

  visit_confirmed: (data) => ({
    subject: '📅 Visite confirmée — Rendez-vous fixé !',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📅 Visite Confirmée</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Bonjour <strong>${data.recipient_name || 'cher utilisateur'}</strong>,</p>
          <p style="font-size: 16px; color: #333;">Votre visite a été confirmée !</p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #11998e;">
            ${data.visit_date_formatted ? `<p style="margin: 4px 0; color: #555;"><strong>📅 Date :</strong> ${data.visit_date_formatted}</p>` : ''}
            ${data.property_type ? `<p style="margin: 4px 0; color: #555;"><strong>🏠 Bien :</strong> ${data.property_type}</p>` : ''}
            ${data.property_address ? `<p style="margin: 4px 0; color: #555;"><strong>📍 Adresse :</strong> ${data.property_address}</p>` : ''}
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${data.action_url || 'https://app.somagate.com'}" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Détails de la visite</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f1f3f5; text-align: center; font-size: 12px; color: #888;">
          <p>SOMA — La plateforme immobilière intelligente</p>
        </div>
      </div>
    `,
  }),

  visit_reminder: (data) => ({
    subject: `⏰ Rappel : visite ${data.reminder_type === 'j-1' ? 'demain' : 'dans 2h'} !`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Rappel de Visite</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Bonjour <strong>${data.recipient_name || 'cher utilisateur'}</strong>,</p>
          <p style="font-size: 16px; color: #333;">
            ${data.reminder_type === 'j-1' ? 'Votre visite est prévue <strong>demain</strong> !' : 'Votre visite est dans <strong>2 heures</strong> !'}
          </p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f5576c;">
            ${data.visit_date_formatted ? `<p style="margin: 4px 0; color: #555;"><strong>📅</strong> ${data.visit_date_formatted}</p>` : ''}
            ${data.property_address ? `<p style="margin: 4px 0; color: #555;"><strong>📍</strong> ${data.property_address}</p>` : ''}
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${data.action_url || 'https://app.somagate.com'}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Voir la transaction</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f1f3f5; text-align: center; font-size: 12px; color: #888;">
          <p>SOMA — La plateforme immobilière intelligente</p>
        </div>
      </div>
    `,
  }),

  offer_made: (data) => ({
    subject: '💰 Nouvelle offre reçue !',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💰 Offre Reçue</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Bonjour <strong>${data.recipient_name || 'cher utilisateur'}</strong>,</p>
          <p style="font-size: 16px; color: #333;">Vous avez reçu une offre pour votre bien !</p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f2994a;">
            ${data.offer_amount ? `<p style="margin: 4px 0; color: #555; font-size: 20px;"><strong>${Number(data.offer_amount).toLocaleString('fr-FR')} ${data.property_currency || 'XOF'}</strong></p>` : ''}
            ${data.offer_type ? `<p style="margin: 4px 0; color: #555;"><strong>Type :</strong> ${data.offer_type}</p>` : ''}
            ${data.property_type ? `<p style="margin: 4px 0; color: #555;"><strong>Bien :</strong> ${data.property_type} — ${data.property_address || ''}</p>` : ''}
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${data.action_url || 'https://app.somagate.com'}" style="background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Voir l'offre</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f1f3f5; text-align: center; font-size: 12px; color: #888;">
          <p>SOMA — La plateforme immobilière intelligente</p>
        </div>
      </div>
    `,
  }),

  deal_finalized: (data) => ({
    subject: '🎊 Deal finalisé — Félicitations !',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎊 Deal Finalisé !</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Bonjour <strong>${data.recipient_name || 'cher utilisateur'}</strong>,</p>
          <p style="font-size: 16px; color: #333;">Félicitations ! Votre transaction a été finalisée avec succès. Vous êtes maintenant <strong>Client Certifié SOMA</strong> ! 🏆</p>
          <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #667eea;">
            ${data.property_type ? `<p style="margin: 4px 0; color: #555;"><strong>Bien :</strong> ${data.property_type}</p>` : ''}
            ${data.property_address ? `<p style="margin: 4px 0; color: #555;"><strong>Adresse :</strong> ${data.property_address}</p>` : ''}
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${data.action_url || 'https://app.somagate.com'}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Voir ma transaction</a>
          </div>
        </div>
        <div style="padding: 16px 32px; background: #f1f3f5; text-align: center; font-size: 12px; color: #888;">
          <p>SOMA — La plateforme immobilière intelligente</p>
        </div>
      </div>
    `,
  }),

  generic: (data) => ({
    subject: data.title || 'Notification SOMA',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${data.title || 'Notification'}</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Bonjour <strong>${data.recipient_name || 'cher utilisateur'}</strong>,</p>
          <p style="font-size: 16px; color: #333;">${data.message || ''}</p>
          ${data.action_url ? `
            <div style="text-align: center; margin-top: 24px;">
              <a href="${data.action_url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Voir les détails</a>
            </div>
          ` : ''}
        </div>
        <div style="padding: 16px 32px; background: #f1f3f5; text-align: center; font-size: 12px; color: #888;">
          <p>SOMA — La plateforme immobilière intelligente</p>
        </div>
      </div>
    `,
  }),
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const resend = new Resend(resendApiKey)

    const { to, template, data } = await req.json()

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: 'to and template are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const templateFn = templates[template] || templates.generic
    const { subject, html } = templateFn(data || {})

    const emailResponse = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    console.log(`[EMAIL] Template: ${template} | To: ${Array.isArray(to) ? to.join(', ') : to} | Subject: ${subject}`)

    // Optionally log email sent in notification
    if (data?.notification_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })

      await supabase
        .from('wf_notifications')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq('id', data.notification_id)
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('send-email error:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
