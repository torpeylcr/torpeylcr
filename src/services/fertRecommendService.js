import { callClaude } from './claudeClient'
import { nzFertilizers } from '../data/nzFertilizers'

const SYSTEM_PROMPT = `You are an expert New Zealand fertilizer advisor with deep knowledge of Ravensdown and Ballance products, and NZ soil science.
You interpret soil test results and provide practical fertilizer recommendations for NZ farming systems.
You reference the provided product list and give recommendations specific to the farmer's crop.

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "summary": "string — 2-3 sentence overall assessment of the soil test",
  "recommendations": [
    {
      "productId": "string — must exactly match an id from the provided product list",
      "rate": "string — specific rate e.g. '200 kg/ha'",
      "timing": "string — when to apply e.g. 'This autumn before winter'",
      "rationale": "string — why this product is needed based on the soil test",
      "priority": 1 | 2 | 3
    }
  ],
  "generalAdvice": "string — additional agronomic advice relevant to this crop and soil"
}

Priority: 1 = urgent (deficiency limiting production), 2 = recommended (will improve yield), 3 = optional (maintenance/insurance).
Include 2-5 recommendations. Only recommend products from the provided list. Do not recommend products for nutrients that are already optimal.`

// Condensed fertilizer list for the prompt
const CONDENSED_FERTILIZERS = nzFertilizers.map(({ id, name, brand, analysis, targetNutrientDeficiency, bestFor }) => ({
  id,
  name,
  brand,
  analysis,
  targetNutrientDeficiency,
  bestFor,
}))

export async function getFertilizerRecommendations(soilTest, crop) {
  const cropContext = crop
    ? `Crop: ${crop.displayName}\nSoil test targets for this crop:\n${JSON.stringify(crop.soilTestTargets)}\nNutrient requirements: ${JSON.stringify(crop.nutrientRequirements)}`
    : 'No specific crop selected — provide general NZ pastoral recommendations.'

  const messages = [
    {
      role: 'user',
      content: `Please provide fertilizer recommendations for this NZ soil test result.

${cropContext}

Soil test data:
${JSON.stringify(soilTest, null, 2)}

Available NZ fertilizer products:
${JSON.stringify(CONDENSED_FERTILIZERS)}

Return ONLY valid JSON as specified.`,
    },
  ]

  const raw = await callClaude(messages, SYSTEM_PROMPT, 1500)
  return parseRecommendationResponse(raw)
}

function parseRecommendationResponse(raw) {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      summary: 'Could not parse AI response. Please try again.',
      recommendations: [],
      generalAdvice: '',
    }
  }
}
