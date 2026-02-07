import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const PROPERTY_DATA = [
  {
    adresse: 'Jl. Raya Ubud No. 45, Ubud, Bali',
    type: 'villa' as const,
    operations: 'vente' as const,
    prix: 4500000000,
    prix_currency: 'IDR',
    chambres: 4,
    salles_bain: 3,
    surface: 320,
    secteur: 'Ubud',
    description: 'Villa tropicale avec piscine privée, entourée de rizières. 4 chambres, design balinais moderne.',
    latitude: -8.5069,
    longitude: 115.2624,
  },
  {
    adresse: 'Jl. Pantai Berawa No. 12, Canggu, Bali',
    type: 'villa' as const,
    operations: 'location' as const,
    prix: 85000000,
    prix_currency: 'IDR',
    chambres: 3,
    salles_bain: 2,
    surface: 200,
    secteur: 'Canggu',
    description: 'Villa moderne à 5 minutes de la plage de Berawa. Parfait pour les digital nomads.',
    latitude: -8.6478,
    longitude: 115.1385,
  },
  {
    adresse: 'Jl. Sunset Road No. 88, Seminyak, Bali',
    type: 'appartement' as const,
    operations: 'vente' as const,
    prix: 2200000000,
    prix_currency: 'IDR',
    chambres: 2,
    salles_bain: 2,
    surface: 120,
    secteur: 'Seminyak',
    description: 'Appartement de luxe dans un complexe premium avec rooftop pool et vue mer.',
    latitude: -8.6905,
    longitude: 115.1685,
  },
  {
    adresse: 'Jl. Bypass Ngurah Rai No. 200, Sanur, Bali',
    type: 'maison' as const,
    operations: 'vente' as const,
    prix: 3200000000,
    prix_currency: 'IDR',
    chambres: 3,
    salles_bain: 2,
    surface: 180,
    secteur: 'Sanur',
    description: 'Maison familiale dans quartier calme de Sanur. Jardin tropical, proche de la plage.',
    latitude: -8.6783,
    longitude: 115.2627,
  },
  {
    adresse: 'Jl. Raya Kuta No. 15, Kuta, Bali',
    type: 'studio' as const,
    operations: 'location' as const,
    prix: 25000000,
    prix_currency: 'IDR',
    chambres: 1,
    salles_bain: 1,
    surface: 45,
    secteur: 'Kuta',
    description: 'Studio meublé moderne, idéal pour expatriés. Centre-ville, proche aéroport.',
    latitude: -8.7220,
    longitude: 115.1697,
  },
  {
    adresse: 'Jl. Mertanadi No. 30, Kerobokan, Bali',
    type: 'villa' as const,
    operations: 'location' as const,
    prix: 120000000,
    prix_currency: 'IDR',
    chambres: 5,
    salles_bain: 4,
    surface: 450,
    secteur: 'Kerobokan',
    description: 'Grande villa familiale avec pool de 15m, jardin luxuriant et staff inclus.',
    latitude: -8.6605,
    longitude: 115.1555,
  },
]

const TEST_USERS = [
  { email: 'buyer1@somagate.test', password: 'Test1234!', full_name: 'Adi Pratama', role: 'user' },
  { email: 'buyer2@somagate.test', password: 'Test1234!', full_name: 'Sari Dewi', role: 'user' },
  { email: 'owner1@somagate.test', password: 'Test1234!', full_name: 'Wayan Sudhana', role: 'owner' },
  { email: 'owner2@somagate.test', password: 'Test1234!', full_name: 'Ketut Agung', role: 'owner' },
  { email: 'notaire1@somagate.test', password: 'Test1234!', full_name: 'Notaris Budi', role: 'notaire' },
  { email: 'admin1@somagate.test', password: 'Test1234!', full_name: 'Admin SomaGate', role: 'admin' },
]

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

    const results: any[] = []
    const userIds: Record<string, string> = {}

    // 1. Create test users
    for (const u of TEST_USERS) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      })

      if (authError) {
        // User might already exist
        if (authError.message.includes('already been registered')) {
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existing = existingUsers?.users?.find((eu: any) => eu.email === u.email)
          if (existing) {
            userIds[u.email] = existing.id
            results.push({ email: u.email, status: 'already_exists', id: existing.id })
          }
          continue
        }
        results.push({ email: u.email, status: 'error', error: authError.message })
        continue
      }

      const userId = authData.user!.id
      userIds[u.email] = userId

      // Assign role
      await supabase.from('user_roles').insert({ user_id: userId, role: u.role })

      // Update profile
      await supabase.from('profiles').update({
        full_name: u.full_name,
        first_name: u.full_name.split(' ')[0],
        last_name: u.full_name.split(' ').slice(1).join(' '),
      }).eq('id', userId)

      results.push({ email: u.email, status: 'created', id: userId, role: u.role })
    }

    // 2. Create properties for owners
    const owner1Id = userIds['owner1@somagate.test']
    const owner2Id = userIds['owner2@somagate.test']

    if (owner1Id && owner2Id) {
      const propertyIds: string[] = []

      for (let i = 0; i < PROPERTY_DATA.length; i++) {
        const ownerId = i % 2 === 0 ? owner1Id : owner2Id
        const { data: prop, error: propError } = await supabase
          .from('properties')
          .insert({ ...PROPERTY_DATA[i], owner_id: ownerId, is_published: true, status: 'available' })
          .select()
          .single()

        if (propError) {
          results.push({ property: PROPERTY_DATA[i].adresse, status: 'error', error: propError.message })
          continue
        }
        propertyIds.push(prop.id)
        results.push({ property: PROPERTY_DATA[i].adresse, status: 'created', id: prop.id })
      }

      // 3. Create some swipes, matches and transactions
      const buyer1Id = userIds['buyer1@somagate.test']
      const buyer2Id = userIds['buyer2@somagate.test']

      if (buyer1Id && propertyIds.length >= 2) {
        // buyer1 likes property 0 and 1
        for (const pid of propertyIds.slice(0, 2)) {
          await supabase.from('swipes').insert({ user_id: buyer1Id, property_id: pid, direction: 'right' })
          
          const ownerId = PROPERTY_DATA[propertyIds.indexOf(pid)] ? 
            (propertyIds.indexOf(pid) % 2 === 0 ? owner1Id : owner2Id) : owner1Id

          const { data: match } = await supabase
            .from('matches')
            .insert({ user_id: buyer1Id, property_id: pid, owner_id: ownerId })
            .select()
            .single()

          if (match) {
            await supabase.from('conversations').insert({
              buyer_id: buyer1Id,
              owner_id: ownerId,
              property_id: pid,
              match_id: match.id,
            })

            await supabase.from('wf_transactions').insert({
              property_id: pid,
              buyer_id: buyer1Id,
              seller_id: ownerId,
              status: 'matched',
              matched_at: new Date().toISOString(),
            })
          }
        }
        results.push({ action: 'matches_created', buyer: 'buyer1', count: 2 })
      }

      if (buyer2Id && propertyIds.length >= 4) {
        // buyer2 likes property 2 and 3
        for (const pid of propertyIds.slice(2, 4)) {
          await supabase.from('swipes').insert({ user_id: buyer2Id, property_id: pid, direction: 'right' })

          const ownerId = propertyIds.indexOf(pid) % 2 === 0 ? owner1Id : owner2Id

          const { data: match } = await supabase
            .from('matches')
            .insert({ user_id: buyer2Id, property_id: pid, owner_id: ownerId })
            .select()
            .single()

          if (match) {
            await supabase.from('conversations').insert({
              buyer_id: buyer2Id,
              owner_id: ownerId,
              property_id: pid,
              match_id: match.id,
            })

            await supabase.from('wf_transactions').insert({
              property_id: pid,
              buyer_id: buyer2Id,
              seller_id: ownerId,
              status: 'visit_requested',
              matched_at: new Date().toISOString(),
              visit_requested_at: new Date().toISOString(),
            })
          }
        }
        results.push({ action: 'matches_created', buyer: 'buyer2', count: 2 })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
