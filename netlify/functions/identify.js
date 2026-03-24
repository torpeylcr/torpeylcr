// Netlify serverless function — Plant Identification proxy
// The Anthropic API key lives ONLY here, never in the browser bundle.
//
// Security measures implemented:
//   1. API key stored as a Netlify environment variable (never sent to browser)
//   2. Input validation — rejects oversized images and malformed requests
//   3. Rate limiting — simple per-IP limit to prevent abuse
//   4. CORS — only accepts requests from the app's own domain
//   5. HTTP method guard — only accepts POST
//   6. Error sanitisation — never leaks internal error details to the client

// ─── Rate limiting (in-memory, resets on cold start) ──────────
// Good enough for a community tool. For high traffic, use Netlify KV or Redis.
const rateLimitMap = new Map()
const RATE_LIMIT_REQUESTS = 30   // max requests per IP per window
const RATE_LIMIT_WINDOW_MS = 60_000  // 1 minute window

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false // not limited
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return true // limited
  }

  entry.count++
  return false
}

// ─── Condensed herbicide product list for AI matching ─────────
// Only includes fields the AI needs to match plant names to products.
// Full product details (rates, supplier, safety) are looked up client-side
// from the local data files after the AI returns matched product IDs.
const HERBICIDE_PRODUCTS = [
  { id: 'roundup-ultra', name: 'Roundup Ultra', targetWeeds: ['Californian thistle', 'Ragwort', 'Convolvulus', 'Browntop', 'Kikuyu', 'Docks', 'Ryegrass', 'Fathen'] },
  { id: 'gramoxone', name: 'Gramoxone', targetWeeds: ['Browntop', 'Ryegrass', 'Fathen', 'Chickweed', 'Amaranth'] },
  { id: 'mcpa-750', name: 'MCPA 750', targetWeeds: ['Californian thistle', 'Ragwort', 'Docks', 'Buttercup', 'Convolvulus', 'Capeweed'] },
  { id: '2-4-d-amine', name: '2,4-D Amine 500', targetWeeds: ['Californian thistle', 'Ragwort', 'Docks', 'Convolvulus', 'Capeweed', 'Buttercup'] },
  { id: 'tordon-brushkiller', name: 'Tordon Brushkiller', targetWeeds: ['Californian thistle', 'Ragwort', 'Gorse', 'Broom', 'Blackberry', 'Docks'] },
  { id: 'pasture-kleen', name: 'Pasture Kleen', targetWeeds: ['Californian thistle', 'Ragwort', 'Docks', 'Buttercup'] },
  { id: 'hussar-od', name: 'Hussar OD', targetWeeds: ['Wild oats', 'Ryegrass', 'Prickly lettuce', 'Chickweed'] },
  { id: 'ally', name: 'Ally', targetWeeds: ['Californian thistle', 'Ragwort', 'Docks', 'Capeweed', 'Chickweed'] },
  { id: 'atrazine-flowable', name: 'Atrazine 500 Flowable', targetWeeds: ['Fathen', 'Nightshade', 'Amaranth', 'Barnyard grass', 'Annual poa', 'Chickweed'] },
  { id: 'callisto', name: 'Callisto', targetWeeds: ['Fathen', 'Nightshade', 'Amaranth', 'Barnyard grass'] },
  { id: 'simazine-900', name: 'Simazine 900 WG', targetWeeds: ['Annual poa', 'Browntop', 'Chickweed', 'Capeweed', 'Annual ryegrass'] },
  { id: 'goal-2xl', name: 'Goal 2XL', targetWeeds: ['Kikuyu', 'Browntop', 'Annual poa', 'Chickweed', 'Oxalis'] },
  { id: 'devrinol-sc', name: 'Devrinol 45 SC', targetWeeds: ['Annual poa', 'Browntop', 'Barnyard grass', 'Chickweed', 'Annual ryegrass'] },
  { id: 'butisan-s', name: 'Butisan S', targetWeeds: ['Annual poa', 'Chickweed', 'Fathen', 'Nightshade', 'Annual ryegrass', 'Barnyard grass'] },
  { id: 'treflan-ec', name: 'Treflan 480 EC', targetWeeds: ['Annual poa', 'Barnyard grass', 'Fathen', 'Amaranth', 'Annual ryegrass'] },
  { id: 'speedway', name: 'Speedway 360', targetWeeds: ['Browntop', 'Kikuyu', 'Old pasture grasses', 'Ryegrass', 'Californian thistle'] },
  { id: 'select-ec', name: 'Select 120EC', targetWeeds: ['Ryegrass', 'Wild oats', 'Kikuyu', 'Browntop', 'Barnyard grass'] },
  { id: 'fusilade-forte', name: 'Fusilade Forte', targetWeeds: ['Ryegrass', 'Wild oats', 'Kikuyu', 'Browntop', 'Barnyard grass'] },
  { id: 'stomp-xtra', name: 'Stomp Xtra', targetWeeds: ['Annual poa', 'Barnyard grass', 'Fathen', 'Chickweed', 'Annual ryegrass'] },
]

const SYSTEM_PROMPT = `You are an expert New Zealand agronomist and weed identification specialist.
You identify plants and weeds found in New Zealand agricultural and horticultural settings.

When identifying a plant, respond ONLY with valid JSON matching this exact schema:
{
  "commonName": "string — NZ common name",
  "scientificName": "string — latin name",
  "confidence": "high" | "medium" | "low",
  "isWeed": true | false,
  "description": "string — 1-2 sentences in NZ agricultural context",
  "controlMethods": ["string — non-chemical cultural control methods, 2-4 items"],
  "matchedProductIds": ["string — product IDs from the provided list that target this plant"],
  "cropSafetyNotes": "string — specific advice if crop context provided, else empty string"
}

Do not include any text outside the JSON. If the image is unclear or not a plant, return:
{"commonName":"Unknown","scientificName":"Unknown","confidence":"low","isWeed":false,"description":"Unable to identify plant from this image.","controlMethods":[],"matchedProductIds":[],"cropSafetyNotes":""}`

export const handler = async (event) => {
  // ── CORS ──────────────────────────────────────────────────────
  // Only allow requests from the same deployed domain (set by Netlify) or localhost
  const allowedOrigin = process.env.URL || 'http://localhost:8888'
  const requestOrigin = event.headers.origin || ''
  const isAllowedOrigin = requestOrigin === allowedOrigin ||
    requestOrigin.startsWith('http://localhost:') ||
    requestOrigin.startsWith('http://127.0.0.1:')

  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? requestOrigin : allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // ── Rate limiting ─────────────────────────────────────────────
  const clientIp = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
  if (checkRateLimit(clientIp)) {
    return { statusCode: 429, headers: corsHeaders, body: JSON.stringify({ error: 'Too many requests. Please wait a minute and try again.' }) }
  }

  // ── Parse and validate request body ──────────────────────────
  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid request format' }) }
  }

  const { image, cropContext } = body

  if (!image || typeof image !== 'string') {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Image is required' }) }
  }

  // Reject oversized images (base64 ~4MB ≈ ~3MB original — well above what's needed)
  if (image.length > 4_000_000) {
    return { statusCode: 413, headers: corsHeaders, body: JSON.stringify({ error: 'Image is too large. Please use a smaller photo.' }) }
  }

  // Basic base64 character validation
  if (!/^[A-Za-z0-9+/]+=*$/.test(image.slice(0, 100))) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid image format' }) }
  }

  // ── Check API key is configured ───────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY environment variable is not set')
    return { statusCode: 503, headers: corsHeaders, body: JSON.stringify({ error: 'Service not configured. Contact the site administrator.' }) }
  }

  // ── Build crop context string ─────────────────────────────────
  let cropText = 'No crop context provided.'
  if (cropContext && typeof cropContext === 'object') {
    const name = String(cropContext.displayName || '').slice(0, 100)
    const weeds = Array.isArray(cropContext.commonWeeds)
      ? cropContext.commonWeeds.slice(0, 10).map(w => String(w).slice(0, 50)).join(', ')
      : ''
    if (name) cropText = `The farmer is growing: ${name}.${weeds ? ` Common weeds: ${weeds}.` : ''}`
  }

  // ── Call Anthropic API ────────────────────────────────────────
  let anthropicResponse
  try {
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: image },
              },
              {
                type: 'text',
                text: `Identify this plant/weed photographed in New Zealand.\n\n${cropText}\n\nAvailable NZ herbicide products to match against (only match products that actually target this plant):\n${JSON.stringify(HERBICIDE_PRODUCTS)}\n\nReturn ONLY valid JSON.`,
              },
            ],
          },
        ],
      }),
    })
  } catch (networkError) {
    console.error('Network error calling Anthropic:', networkError.message)
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'Could not reach AI service. Check your connection and try again.' }) }
  }

  if (!anthropicResponse.ok) {
    const status = anthropicResponse.status
    console.error('Anthropic API error:', status)
    // Don't expose Anthropic error details to the client
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'AI service returned an error. Please try again.' }) }
  }

  // ── Parse Claude response ─────────────────────────────────────
  let aiData
  try {
    aiData = await anthropicResponse.json()
  } catch {
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'Could not parse AI response. Please try again.' }) }
  }

  const rawText = aiData.content?.[0]?.text || ''
  let result
  try {
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    result = JSON.parse(cleaned)
  } catch {
    result = {
      commonName: 'Unknown',
      scientificName: 'Unknown',
      confidence: 'low',
      isWeed: false,
      description: 'Could not parse AI response. Please try again.',
      controlMethods: [],
      matchedProductIds: [],
      cropSafetyNotes: '',
    }
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(result),
  }
}
