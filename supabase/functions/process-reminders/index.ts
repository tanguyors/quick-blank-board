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

    // Fetch pending reminders that are past their scheduled time
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
        
        // Create in-app notification based on reminder type
        let title = 'Rappel'
        let message = ''

        switch (reminder.reminder_type) {
          case 'visit_reminder':
            title = 'Rappel de visite'
            message = 'Vous avez une visite programmée bientôt. N\'oubliez pas de vous préparer !'
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
          default:
            title = 'Rappel SomaGate'
            message = `Rappel: ${reminder.reminder_type}`
        }

        // Create notification
        await supabase.from('wf_notifications').insert({
          user_id: reminder.user_id,
          transaction_id: reminder.transaction_id,
          type: 'reminder',
          title,
          message,
          action_url: transaction ? `/transaction/${transaction.id}` : null,
          data: reminder.metadata,
        })

        // Mark reminder as sent
        await supabase
          .from('wf_reminders')
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq('id', reminder.id)

        processed.push(reminder.id)
      } catch (e) {
        errors.push({ id: reminder.id, error: (e as Error).message })
      }
    }

    console.log(`Processed ${processed.length} reminders, ${errors.length} errors`)

    return new Response(JSON.stringify({
      success: true,
      processed: processed.length,
      errors: errors.length,
      details: { processed, errors },
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
