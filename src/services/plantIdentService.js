import { callClaude } from './claudeClient'
import { nzHerbicides } from '../data/nzHerbicides'

const SYSTEM_PROMPT = `You are an expert New Zealand agronomist and weed identification specialist.
You identify plants and weeds commonly found in New Zealand agricultural and horticultural settings.
You have deep knowledge of NZ pastures, arable crops, orchards, and vegetable crops.

When identifying a plant, you MUST respond with ONLY valid JSON matching this exact schema:
{
  "commonName": "string — NZ common name",
  "scientificName": "string — latin name",
  "confidence": "high" | "medium" | "low",
  "isWeed": true | false,
  "description": "string — 1-2 sentences in NZ agricultural context",
  "controlMethods": ["string" — non-chemical cultural control methods, 2-4 items],
  "matchedProductIds": ["string" — product IDs from the provided list that target this plant],
  "cropSafetyNotes": "string — specific advice if crop context provided, else empty string"
}

Do not include any text outside the JSON. If the image is unclear or not a plant, return:
{ "commonName": "Unknown", "scientificName": "Unknown", "confidence": "low", "isWeed": false,
  "description": "Unable to identify plant from this image.", "controlMethods": [],
  "matchedProductIds": [], "cropSafetyNotes": "" }`

// Condensed product list for the API (only fields needed for matching)
const CONDENSED_PRODUCTS = nzHerbicides.map(({ id, name, targetWeeds, mode }) => ({
  id,
  name,
  targetWeeds,
  mode,
}))

export async function identifyPlant(base64Image, activeCrop) {
  const cropContext = activeCrop
    ? `The farmer is currently growing: ${activeCrop.displayName}. Their common weeds include: ${activeCrop.commonWeeds?.join(', ')}.`
    : 'No crop context provided.'

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          type: 'text',
          text: `Please identify this plant/weed photographed in New Zealand.

${cropContext}

Available NZ herbicide products to match against (only suggest products that actually target this plant):
${JSON.stringify(CONDENSED_PRODUCTS)}

Return ONLY valid JSON as specified.`,
        },
      ],
    },
  ]

  const raw = await callClaude(messages, SYSTEM_PROMPT, 1000)
  return parseIdentificationResponse(raw)
}

function parseIdentificationResponse(raw) {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      commonName: 'Parse error',
      scientificName: 'Unknown',
      confidence: 'low',
      isWeed: false,
      description: 'Could not parse AI response. Please try again.',
      controlMethods: [],
      matchedProductIds: [],
      cropSafetyNotes: '',
    }
  }
}
