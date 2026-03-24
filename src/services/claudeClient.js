// This file is intentionally minimal.
// All Anthropic API calls go through Netlify serverless functions
// (netlify/functions/identify.js and netlify/functions/fertilizer.js)
// so the API key NEVER appears in the browser bundle.
//
// See plantIdentService.js and fertRecommendService.js for the actual calls.

// Base URL for the serverless functions — same origin, no CORS issues
export const FUNCTIONS_BASE = '/.netlify/functions'
