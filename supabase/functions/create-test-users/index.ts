import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const PROPERTY_DATA = [
  {
    adresse: 'Jl. Pantai Berawa No. 15, Canggu, Bali',
    type: 'villa' as const,
    operations: 'vente' as const,
    prix: 8500000000,
    prix_currency: 'IDR',
    chambres: 4,
    salles_bain: 3,
    surface: 320,
    secteur: 'Canggu',
    description: 'Luxurious villa with private pool in Canggu. 4 bedrooms, contemporary design, tropical garden.',
    latitude: -8.6478,
    longitude: 115.1385,
  },
  {
    adresse: 'Jl. Raya Seminyak No. 88, Seminyak, Bali',
    type: 'appartement' as const,
    operations: 'location' as const,
    prix: 25000000,
    prix_currency: 'IDR',
    chambres: 3,
    salles_bain: 2,
    surface: 180,
    secteur: 'Seminyak',
    description: 'High-end apartment in the heart of Seminyak. Panoramic view, secured parking.',
    latitude: -8.6905,
    longitude: 115.1685,
  },
  {
    adresse: 'Jl. Hanoman No. 42, Ubud, Bali',
    type: 'villa' as const,
    operations: 'vente' as const,
    prix: 12000000000,
    prix_currency: 'IDR',
    chambres: 5,
    salles_bain: 4,
    surface: 450,
    secteur: 'Ubud',
    description: 'Prestigious villa in Ubud. 5 bedrooms, infinity pool, rice field views, staff quarters.',
    latitude: -8.5069,
    longitude: 115.2625,
  },
  {
    adresse: 'Jl. Uluwatu No. 7, Pecatu, Bali',
    type: 'terrain' as const,
    operations: 'vente' as const,
    prix: 5000000000,
    prix_currency: 'IDR',
    chambres: 0,
    salles_bain: 0,
    surface: 500,
    secteur: 'Uluwatu',
    description: 'Prime clifftop land in Uluwatu. Freehold title. Perfect for luxury development project.',
    latitude: -8.8291,
    longitude: 115.0849,
    droit: 'freehold' as const,
  },
  {
    adresse: 'Jl. Drupadi No. 22, Seminyak, Bali',
    type: 'studio' as const,
    operations: 'location' as const,
    prix: 8000000,
    prix_currency: 'IDR',
    chambres: 1,
    salles_bain: 1,
    surface: 35,
    secteur: 'Seminyak',
    description: 'Modern furnished studio in Seminyak. Ideal for digital nomads. Fiber internet included.',
    latitude: -8.6870,
    longitude: 115.1680,
  },
  {
    adresse: 'Jl. Bypass Ngurah Rai No. 100, Sanur, Bali',
    type: 'bureau' as const,
    operations: 'location' as const,
    prix: 35000000,
    prix_currency: 'IDR',
    chambres: 0,
    salles_bain: 2,
    surface: 200,
    secteur: 'Sanur',
    description: 'Open space office in Sanur. Central AC, 6 parking spots, 24/7 secured access.',
    latitude: 5.3050,
    longitude: -3.9900,
  },
]

const TEST_USERS = [
  { email: 'acheteur@test.com', password: 'Test123!', full_name: 'Amadou Diallo', role: 'user' },
  { email: 'vendeur@test.com', password: 'Test123!', full_name: 'Fatou Sall', role: 'owner' },
  { email: 'admin@test.com', password: 'Test123!', full_name: 'Admin SomaGate', role: 'admin' },
  { email: 'buyer1@somagate.test', password: 'Test1234!', full_name: 'Moussa Konaté', role: 'user' },
  { email: 'buyer2@somagate.test', password: 'Test1234!', full_name: 'Awa Traoré', role: 'user' },
  { email: 'owner1@somagate.test', password: 'Test1234!', full_name: 'Ibrahim Ndiaye', role: 'owner' },
  { email: 'owner2@somagate.test', password: 'Test1234!', full_name: 'Mariama Bâ', role: 'owner' },
  { email: 'notaire1@somagate.test', password: 'Test1234!', full_name: 'Maître Ousmane Sy', role: 'notaire' },
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
      const names = u.full_name.split(' ')
      await supabase.from('profiles').update({
        full_name: u.full_name,
        first_name: names[0],
        last_name: names.slice(1).join(' '),
      }).eq('id', userId)

      // Initialize user score
      await supabase.from('wf_user_scores').insert({ user_id: userId }).select()

      results.push({ email: u.email, status: 'created', id: userId, role: u.role })
    }

    // 2. Create properties for owner accounts
    const ownerEmails = TEST_USERS.filter(u => u.role === 'owner').map(u => u.email)
    const ownerIds = ownerEmails.map(e => userIds[e]).filter(Boolean)

    if (ownerIds.length > 0) {
      const propertyIds: string[] = []

      for (let i = 0; i < PROPERTY_DATA.length; i++) {
        const ownerId = ownerIds[i % ownerIds.length]
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

      // 3. Create matches & transactions for buyer accounts
      const buyerEmails = TEST_USERS.filter(u => u.role === 'user').map(u => u.email)
      const buyerIds = buyerEmails.map(e => userIds[e]).filter(Boolean)

      if (buyerIds.length > 0 && propertyIds.length >= 2) {
        // First buyer: match with first 2 properties
        const buyer1Id = buyerIds[0]
        for (const pid of propertyIds.slice(0, 2)) {
          const propIndex = propertyIds.indexOf(pid)
          const ownerId = ownerIds[propIndex % ownerIds.length]

          await supabase.from('swipes').insert({ user_id: buyer1Id, property_id: pid, direction: 'right' })

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
        results.push({ action: 'matches_created', buyer: buyerEmails[0], count: 2 })

        // Second buyer if exists: match with properties 2-3
        if (buyerIds.length > 1 && propertyIds.length >= 4) {
          const buyer2Id = buyerIds[1]
          for (const pid of propertyIds.slice(2, 4)) {
            const propIndex = propertyIds.indexOf(pid)
            const ownerId = ownerIds[propIndex % ownerIds.length]

            await supabase.from('swipes').insert({ user_id: buyer2Id, property_id: pid, direction: 'right' })

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
          results.push({ action: 'matches_created', buyer: buyerEmails[1], count: 2 })
        }
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