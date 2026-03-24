import { FUNCTIONS_BASE } from './claudeClient'

// Calls the Netlify serverless function which holds the API key.
// The browser never sees or sends the Anthropic API key.
export async function getFertilizerRecommendations(soilTest, crop) {
  // Send only the fields the server needs to build the prompt.
  // Full fertilizer product list lives server-side.
  const cropContext = crop
    ? {
        displayName: crop.displayName,
        soilTestTargets: crop.soilTestTargets,
        nutrientRequirements: crop.nutrientRequirements,
      }
    : null

  const response = await fetch(`${FUNCTIONS_BASE}/fertilizer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ soilTest, cropContext }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Server error (${response.status})`)
  }

  return response.json()
}
