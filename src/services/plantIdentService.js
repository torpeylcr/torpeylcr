import { FUNCTIONS_BASE } from './claudeClient'

// Calls the Netlify serverless function which holds the API key.
// The browser never sees or sends the Anthropic API key.
export async function identifyPlant(base64Image, activeCrop) {
  // Send only the minimal context the server needs to build the prompt.
  // Do NOT send the full herbicide database — that lives server-side.
  const cropContext = activeCrop
    ? { displayName: activeCrop.displayName, commonWeeds: activeCrop.commonWeeds }
    : null

  const response = await fetch(`${FUNCTIONS_BASE}/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, cropContext }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Server error (${response.status})`)
  }

  return response.json()
}
