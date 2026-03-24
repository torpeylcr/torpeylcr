// Netlify serverless function — Fertilizer Recommendation proxy
// The Anthropic API key lives ONLY here, never in the browser bundle.

// ─── Rate limiting ─────────────────────────────────────────────
const rateLimitMap = new Map()
const RATE_LIMIT_REQUESTS = 20   // fertilizer calls are more expensive — lower limit
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return false
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) return true
  entry.count++
  return false
}

// ─── Condensed fertilizer product list for AI matching ────────
// Only includes fields needed for AI reasoning. Full product details
// (supplier, price, spread method) are looked up client-side after.
const FERTILIZER_PRODUCTS = [
  { id: 'ravensdown-superphosphate', name: 'Superphosphate', brand: 'Ravensdown', analysis: { N: 0, P: 9, S: 11, Ca: 20 }, targetNutrientDeficiency: ['P', 'S', 'Ca'], bestFor: ['pasture', 'lucerne', 'wheat', 'barley', 'oats', 'kiwifruit-green', 'kiwifruit-gold', 'apples'] },
  { id: 'ballance-superphosphate', name: 'Superphosphate', brand: 'Ballance', analysis: { N: 0, P: 9, S: 11, Ca: 20 }, targetNutrientDeficiency: ['P', 'S', 'Ca'], bestFor: ['pasture', 'lucerne', 'wheat', 'barley', 'oats'] },
  { id: 'serpentine-super', name: 'Serpentine Super', brand: 'Ravensdown', analysis: { N: 0, P: 7, S: 9, Ca: 17, Mg: 6 }, targetNutrientDeficiency: ['P', 'S', 'Mg', 'Ca'], bestFor: ['pasture', 'lucerne', 'wheat', 'barley'] },
  { id: 'ravensdown-urea', name: 'Urea 46N', brand: 'Ravensdown', analysis: { N: 46 }, targetNutrientDeficiency: ['N'], bestFor: ['pasture', 'wheat', 'barley', 'oats', 'maize', 'maize-silage', 'potatoes'] },
  { id: 'ballance-sustain-n', name: 'SustaiN', brand: 'Ballance', analysis: { N: 46 }, targetNutrientDeficiency: ['N'], bestFor: ['pasture', 'wheat', 'barley', 'maize', 'maize-silage', 'kiwifruit-green', 'kiwifruit-gold'] },
  { id: 'cropmaster-15', name: 'Cropmaster 15', brand: 'Ravensdown', analysis: { N: 15, P: 10, K: 10, S: 6 }, targetNutrientDeficiency: ['N', 'P', 'K', 'S'], bestFor: ['wheat', 'barley', 'oats', 'maize', 'maize-silage', 'potatoes', 'canola'] },
  { id: 'potassium-chloride', name: 'Potassium Chloride (MOP)', brand: 'Ravensdown', analysis: { K: 50 }, targetNutrientDeficiency: ['K'], bestFor: ['pasture', 'maize', 'maize-silage', 'potatoes', 'kiwifruit-green', 'kiwifruit-gold'] },
  { id: 'potassium-sulphate', name: 'Potassium Sulphate (SOP)', brand: 'Ballance', analysis: { K: 41, S: 18 }, targetNutrientDeficiency: ['K', 'S'], bestFor: ['potatoes', 'kiwifruit-green', 'kiwifruit-gold', 'apples', 'onions', 'garlic', 'squash'] },
  { id: 'dap', name: 'DAP', brand: 'Ravensdown', analysis: { N: 18, P: 20 }, targetNutrientDeficiency: ['N', 'P'], bestFor: ['wheat', 'barley', 'oats', 'maize', 'maize-silage', 'canola', 'potatoes'] },
  { id: 'agricultural-lime', name: 'Agricultural Lime', brand: 'Ravensdown', analysis: { Ca: 38, Mg: 1 }, targetNutrientDeficiency: ['Ca'], bestFor: ['pasture', 'lucerne', 'wheat', 'barley', 'oats', 'maize', 'maize-silage', 'canola'] },
  { id: 'dolomite', name: 'Dolomite', brand: 'Ravensdown', analysis: { Ca: 22, Mg: 12 }, targetNutrientDeficiency: ['Ca', 'Mg'], bestFor: ['pasture', 'lucerne', 'kiwifruit-green', 'kiwifruit-gold', 'apples'] },
  { id: 'wuxal-calcium', name: 'Wuxal Calcium', brand: 'Wuxal', analysis: { N: 7, Ca: 8 }, targetNutrientDeficiency: ['Ca'], bestFor: ['apples', 'kiwifruit-green', 'kiwifruit-gold'] },
  { id: 'wuxal-boron', name: 'Wuxal Boron', brand: 'Wuxal', analysis: { N: 7, B: 8 }, targetNutrientDeficiency: ['B'], bestFor: ['apples', 'kiwifruit-green', 'kiwifruit-gold', 'canola'] },
  { id: 'yaravita-zintrac', name: 'YaraVita Zintrac 700', brand: 'Yara', analysis: { Zn: 70 }, targetNutrientDeficiency: ['Zn'], bestFor: ['maize', 'maize-silage', 'wheat', 'barley', 'kiwifruit-green', 'kiwifruit-gold', 'apples'] },
  { id: 'yaravita-mantrac-pro', name: 'YaraVita Mantrac Pro', brand: 'Yara', analysis: { Mn: 50 }, targetNutrientDeficiency: ['Mn'], bestFor: ['wheat', 'barley', 'oats', 'potatoes', 'peas'] },
  { id: 'yaravita-brassitrel-pro', name: 'YaraVita Brassitrel Pro', brand: 'Yara', analysis: { N: 6, S: 18, Mg: 3, B: 0.4, Mn: 0.5 }, targetNutrientDeficiency: ['S', 'B', 'Mn'], bestFor: ['canola', 'broccoli', 'cabbage'] },
  { id: 'wuxal-maxi', name: 'Wuxal Maxi', brand: 'Wuxal', analysis: { N: 8, P: 3, K: 6, S: 1, Mg: 1 }, targetNutrientDeficiency: ['N', 'P', 'K'], bestFor: ['kiwifruit-green', 'kiwifruit-gold', 'apples', 'onions', 'garlic', 'squash'] },
  { id: 'ballance-pastoral-gold', name: 'PastureGold', brand: 'Ballance', analysis: { P: 6, K: 4, S: 9, Ca: 13, Mg: 4 }, targetNutrientDeficiency: ['P', 'K', 'S', 'Mg', 'Ca'], bestFor: ['pasture', 'lucerne'] },
  { id: 'ravensdown-seabird-guano', name: 'Seabird Guano', brand: 'Ravensdown', analysis: { N: 11, P: 10, K: 1, S: 2, Ca: 10 }, targetNutrientDeficiency: ['N', 'P', 'Ca'], bestFor: ['pasture', 'lucerne', 'kiwifruit-green', 'kiwifruit-gold', 'apples'] },
]

const SYSTEM_PROMPT = `You are an expert New Zealand fertilizer advisor with deep knowledge of Ravensdown and Ballance products, and NZ soil science (Hill Laboratories / Eurofins NZ soil test format).
You interpret soil test results and provide practical fertilizer recommendations for NZ farming systems.

Respond ONLY with valid JSON matching this exact schema:
{
  "summary": "string — 2-3 sentence overall assessment of the soil test",
  "recommendations": [
    {
      "productId": "string — must exactly match an id from the provided product list",
      "rate": "string — specific rate e.g. '200 kg/ha'",
      "timing": "string — when to apply",
      "rationale": "string — why this product is needed based on the soil test values",
      "priority": 1 | 2 | 3
    }
  ],
  "generalAdvice": "string — additional agronomic advice relevant to this crop and soil"
}

Priority: 1 = urgent (deficiency limiting production), 2 = recommended, 3 = optional (maintenance).
Include 2-5 recommendations. Only recommend products from the provided list. Do not recommend products for nutrients that are already at optimal levels.`

export const handler = async (event) => {
  // ── CORS ──────────────────────────────────────────────────────
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

  const { soilTest, cropContext } = body

  if (!soilTest || typeof soilTest !== 'object') {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Soil test data is required' }) }
  }

  // Validate soil test has the minimum required fields
  if (typeof soilTest.pH !== 'number' || typeof soilTest.olsenP !== 'number') {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Soil test must include at least pH and Olsen P' }) }
  }

  // Reject unreasonably large payloads
  if (JSON.stringify(body).length > 20_000) {
    return { statusCode: 413, headers: corsHeaders, body: JSON.stringify({ error: 'Request payload too large' }) }
  }

  // ── Check API key ─────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY environment variable is not set')
    return { statusCode: 503, headers: corsHeaders, body: JSON.stringify({ error: 'Service not configured. Contact the site administrator.' }) }
  }

  // ── Build crop context string ─────────────────────────────────
  let cropText = 'No specific crop selected — provide general NZ pastoral recommendations.'
  if (cropContext && typeof cropContext === 'object') {
    const name = String(cropContext.displayName || '').slice(0, 100)
    if (name) {
      cropText = `Crop: ${name}`
      if (cropContext.soilTestTargets) {
        cropText += `\nSoil test targets for this crop:\n${JSON.stringify(cropContext.soilTestTargets)}`
      }
      if (cropContext.nutrientRequirements) {
        cropText += `\nNutrient requirements: ${JSON.stringify(cropContext.nutrientRequirements)}`
      }
    }
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
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Please provide fertilizer recommendations for this NZ soil test result.

${cropText}

Soil test data:
${JSON.stringify(soilTest, null, 2)}

Available NZ fertilizer products:
${JSON.stringify(FERTILIZER_PRODUCTS)}

Return ONLY valid JSON.`,
          },
        ],
      }),
    })
  } catch (networkError) {
    console.error('Network error calling Anthropic:', networkError.message)
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'Could not reach AI service. Check your connection and try again.' }) }
  }

  if (!anthropicResponse.ok) {
    console.error('Anthropic API error:', anthropicResponse.status)
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
      summary: 'Could not parse AI response. Please try again.',
      recommendations: [],
      generalAdvice: '',
    }
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(result),
  }
}
