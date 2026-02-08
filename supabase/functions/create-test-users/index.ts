import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const PROPERTY_DATA = [
  {
    adresse: 'Rue des Almadies, Dakar',
    type: 'villa' as const,
    operations: 'vente' as const,
    prix: 320000000,
    prix_currency: 'XOF',
    chambres: 4,
    salles_bain: 3,
    surface: 320,
    secteur: 'Almadies',
    description: 'Villa luxueuse avec piscine privée aux Almadies. 4 chambres, design contemporain, jardin tropical.',
    latitude: 14.7410,
    longitude: -17.5130,
  },
  {
    adresse: 'Boulevard du Plateau, Abidjan',
    type: 'appartement' as const,
    operations: 'location' as const,
    prix: 850000,
    prix_currency: 'XOF',
    chambres: 3,
    salles_bain: 2,
    surface: 180,
    secteur: 'Plateau',
    description: 'Appartement haut standing au cœur du Plateau. Vue panoramique, parking sécurisé.',
    latitude: 5.3200,
    longitude: -4.0200,
  },
  {
    adresse: 'Cocody Riviera Golf, Abidjan',
    type: 'villa' as const,
    operations: 'vente' as const,
    prix: 550000000,
    prix_currency: 'XOF',
    chambres: 5,
    salles_bain: 4,
    surface: 450,
    secteur: 'Cocody',
    description: 'Villa de prestige à Riviera Golf. 5 chambres, piscine, staff house, jardin arboré.',
    latitude: 5.3550,
    longitude: -3.9750,
  },
  {
    adresse: 'Quartier Ngor, Dakar',
    type: 'terrain' as const,
    operations: 'vente' as const,
    prix: 180000000,
    prix_currency: 'XOF',
    chambres: 0,
    salles_bain: 0,
    surface: 500,
    secteur: 'Ngor',
    description: 'Terrain viabilisé à Ngor, proche plage. Titre foncier en règle. Idéal pour projet immobilier.',
    latitude: 14.7510,
    longitude: -17.5180,
    droit: 'titre_foncier' as const,
  },
  {
    adresse: 'Mermoz Sacré-Cœur, Dakar',
    type: 'studio' as const,
    operations: 'location' as const,
    prix: 350000,
    prix_currency: 'XOF',
    chambres: 1,
    salles_bain: 1,
    surface: 35,
    secteur: 'Mermoz',
    description: 'Studio meublé moderne à Mermoz. Idéal expatriés et jeunes actifs. Internet fibre inclus.',
    latitude: 14.7050,
    longitude: -17.4680,
  },
  {
    adresse: 'Zone 4, Marcory, Abidjan',
    type: 'bureau' as const,
    operations: 'location' as const,
    prix: 1200000,
    prix_currency: 'XOF',
    chambres: 0,
    salles_bain: 2,
    surface: 200,
    secteur: 'Marcory',
    description: 'Bureau open space en Zone 4. Climatisation centrale, 6 places parking, accès sécurisé 24/7.',
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