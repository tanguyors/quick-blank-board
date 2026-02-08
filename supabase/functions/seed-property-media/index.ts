import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map property types to image paths (relative to app origin)
const TYPE_IMAGES: Record<string, string[]> = {
  villa: ['/properties/villa-1.jpg', '/properties/villa-2.jpg'],
  appartement: ['/properties/appartement-1.jpg'],
  studio: ['/properties/studio-1.jpg'],
  maison: ['/properties/maison-1.jpg'],
  bureau: ['/properties/bureau-1.jpg'],
  // Fallback for other types
  terrain: ['/properties/villa-2.jpg'],
  commerce: ['/properties/bureau-1.jpg'],
  entrepot: ['/properties/bureau-1.jpg'],
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Parse optional origin from request body (for absolute URLs)
    let appOrigin = ''
    try {
      const body = await req.json()
      appOrigin = body.origin || ''
    } catch {
      // No body, use relative paths
    }

    // Get all properties that have NO media
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, type')
      .eq('is_published', true)

    if (propError) throw propError

    // Check which already have media
    const { data: existingMedia } = await supabase
      .from('property_media')
      .select('property_id')

    const withMedia = new Set(existingMedia?.map(m => m.property_id) || [])
    const toSeed = properties?.filter(p => !withMedia.has(p.id)) || []

    if (toSeed.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'All properties already have media', seeded: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: any[] = []
    // Track how many times each type has been used so we can rotate images
    const typeCounter: Record<string, number> = {}

    for (const prop of toSeed) {
      const images = TYPE_IMAGES[prop.type] || TYPE_IMAGES.villa
      typeCounter[prop.type] = (typeCounter[prop.type] || 0)
      const imageIndex = typeCounter[prop.type] % images.length
      typeCounter[prop.type]++

      const imageUrl = appOrigin + images[imageIndex]

      const { error: insertError } = await supabase
        .from('property_media')
        .insert({
          property_id: prop.id,
          url: imageUrl,
          type: 'image',
          is_primary: true,
          position: 0,
        })

      if (insertError) {
        results.push({ id: prop.id, type: prop.type, status: 'error', error: insertError.message })
      } else {
        results.push({ id: prop.id, type: prop.type, status: 'seeded', url: imageUrl })
      }
    }

    return new Response(JSON.stringify({ success: true, seeded: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
