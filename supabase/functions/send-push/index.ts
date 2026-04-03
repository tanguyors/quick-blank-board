import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { apnsConfigured, sendApnsAlert } from './apns.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { user_id, title, message, action_url, transaction_id, data } = await req.json()

    if (!user_id || !title || !message) {
      return new Response(JSON.stringify({ error: 'user_id, title and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: pushProfile } = await supabase
      .from('profiles')
      .select('apns_device_token, notif_push')
      .eq('id', user_id)
      .maybeSingle()

    const { data: notifRow, error: notifError } = await supabase
      .from('wf_notifications')
      .insert({
        user_id,
        title,
        message,
        type: 'push',
        action_url: action_url || null,
        transaction_id: transaction_id || null,
        data: data || null,
        push_sent: false,
        push_sent_at: null,
      })
      .select('id')
      .single()

    if (notifError) throw notifError

    let apnsDelivered = false
    let apnsDetail: Record<string, unknown> | null = null

    const canPush =
      pushProfile?.notif_push !== false &&
      Boolean(pushProfile?.apns_device_token?.trim()) &&
      apnsConfigured()

    if (canPush && pushProfile?.apns_device_token) {
      const custom: Record<string, unknown> = {}
      if (action_url) custom.action_url = action_url
      if (transaction_id) custom.transaction_id = transaction_id
      if (data && typeof data === 'object') Object.assign(custom, data as object)

      const result = await sendApnsAlert({
        deviceToken: pushProfile.apns_device_token,
        title,
        body: message,
        customData: Object.keys(custom).length ? custom : undefined,
      })

      if (result.ok) {
        apnsDelivered = true
        apnsDetail = { status: result.status, apns_id: result.apnsId }
        await supabase
          .from('wf_notifications')
          .update({
            push_sent: true,
            push_sent_at: new Date().toISOString(),
          })
          .eq('id', notifRow.id)
      } else {
        console.error('[PUSH] APNs error', result.status, result.reason, result.raw)
        apnsDetail = { status: result.status, reason: result.reason }
      }
    } else {
      if (pushProfile?.notif_push === false || !pushProfile?.apns_device_token) {
        console.log('[PUSH] Pas d’envoi APNs (préférences ou jeton manquant)')
      } else if (!apnsConfigured()) {
        console.log('[PUSH] Secrets APNs non configurés (APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY)')
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notifRow.id,
        apns: apnsDelivered
          ? { delivered: true, ...apnsDetail }
          : { delivered: false, ...(apnsDetail ?? {}) },
        note: apnsConfigured()
          ? undefined
          : 'Configurer APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY sur le projet pour activer la livraison APNs.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('send-push error:', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
