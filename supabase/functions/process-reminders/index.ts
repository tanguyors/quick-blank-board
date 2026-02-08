import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // ── 1. Process pending reminders ──────────────────────────────────────
    const { data: reminders, error: fetchError } = await supabase
      .from('wf_reminders')
      .select('*, wf_transactions(id, status, property_id, buyer_id, seller_id)')
      .eq('sent', false)
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(50)

    if (fetchError) throw fetchError

    const processed: string[] = []
    const errors: any[] = []

    for (const reminder of reminders || []) {
      try {
        const transaction = reminder.wf_transactions as any
        
        let title = 'Rappel'
        let message = ''

        switch (reminder.reminder_type) {
          case 'visit_reminder':
            title = 'Rappel de visite'
            message = reminder.metadata?.type === 'j-1'
              ? 'Votre visite est prévue demain. Préparez-vous !'
              : reminder.metadata?.type === 'h-2'
              ? 'Votre visite est dans 2 heures. N\'oubliez pas !'
              : 'Vous avez une visite programmée bientôt. N\'oubliez pas de vous préparer !'
            break
          case 'document_pending':
            title = 'Documents en attente'
            message = 'Des documents attendent votre validation. Veuillez les consulter.'
            break
          case 'offer_follow_up':
            title = 'Suivi d\'offre'
            message = 'Une offre attend une réponse. Consultez votre transaction.'
            break
          case 'score_update':
            title = 'Mise à jour du score'
            message = 'Votre score de confiance a été recalculé.'
            break
          case 'inactivity_12h':
            title = 'Action requise'
            message = 'Une transaction attend votre réponse depuis plus de 12h. Ne manquez pas cette opportunité !'
            break
          default:
            title = 'Rappel SomaGate'
            message = `Rappel: ${reminder.reminder_type}`
        }

        await supabase.from('wf_notifications').insert({
          user_id: reminder.user_id,
          transaction_id: reminder.transaction_id,
          type: 'reminder',
          title,
          message,
          action_url: transaction ? `/transaction/${transaction.id}` : null,
          data: reminder.metadata,
        })

        await supabase
          .from('wf_reminders')
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq('id', reminder.id)

        processed.push(reminder.id)
      } catch (e) {
        errors.push({ id: reminder.id, error: (e as Error).message })
      }
    }

    // ── 2. Detect 12h inactivity & create auto-reminders ─────────────────
    const inactivityCreated: string[] = []
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()

    const { data: staleTransactions } = await supabase
      .from('wf_transactions')
      .select('id, status, buyer_id, seller_id, updated_at')
      .in('status', ['visit_requested', 'visit_proposed', 'documents_generated'])
      .lt('updated_at', twelveHoursAgo)
      .limit(50)

    for (const tx of staleTransactions || []) {
      // Determine who needs to act
      let targetUserId: string
      if (tx.status === 'visit_requested') {
        targetUserId = tx.seller_id // Seller needs to propose dates
      } else if (tx.status === 'visit_proposed') {
        targetUserId = tx.buyer_id // Buyer needs to confirm
      } else {
        targetUserId = tx.buyer_id // Buyer needs to validate documents
      }

      // Check if we already sent an inactivity reminder for this transaction recently
      const { data: existingReminder } = await supabase
        .from('wf_reminders')
        .select('id')
        .eq('transaction_id', tx.id)
        .eq('user_id', targetUserId)
        .eq('reminder_type', 'inactivity_12h')
        .eq('sent', false)
        .limit(1)

      if (existingReminder && existingReminder.length > 0) continue

      // Check if one was sent in the last 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: recentSent } = await supabase
        .from('wf_reminders')
        .select('id')
        .eq('transaction_id', tx.id)
        .eq('user_id', targetUserId)
        .eq('reminder_type', 'inactivity_12h')
        .gte('sent_at', oneDayAgo)
        .limit(1)

      if (recentSent && recentSent.length > 0) continue

      // Create an immediate reminder
      await supabase.from('wf_reminders').insert({
        transaction_id: tx.id,
        user_id: targetUserId,
        reminder_type: 'inactivity_12h',
        scheduled_at: new Date().toISOString(),
        metadata: { status: tx.status, stale_since: tx.updated_at },
      })

      inactivityCreated.push(tx.id)
    }

    console.log(`Processed ${processed.length} reminders, ${errors.length} errors, ${inactivityCreated.length} inactivity reminders created`)

    return new Response(JSON.stringify({
      success: true,
      processed: processed.length,
      errors: errors.length,
      inactivity_created: inactivityCreated.length,
      details: { processed, errors, inactivityCreated },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('process-reminders error:', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
