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

    const { user_id, title, message, action_url, transaction_id, data } = await req.json()

    if (!user_id || !title || !message) {
      return new Response(JSON.stringify({ error: 'user_id, title and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create in-app notification
    const { error: notifError } = await supabase.from('wf_notifications').insert({
      user_id,
      title,
      message,
      type: 'push',
      action_url: action_url || null,
      transaction_id: transaction_id || null,
      data: data || null,
      push_sent: true,
      push_sent_at: new Date().toISOString(),
    })

    if (notifError) throw notifError

    // TODO: Integrate with Firebase Cloud Messaging or OneSignal for actual push
    // For now, we log the push notification
    console.log(`[PUSH] To: ${user_id} | Title: ${title} | Message: ${message}`)

    return new Response(JSON.stringify({
      success: true,
      message: 'Push notification logged and in-app notification created',
      note: 'Real push delivery will be enabled with FCM/OneSignal integration',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('send-push error:', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
