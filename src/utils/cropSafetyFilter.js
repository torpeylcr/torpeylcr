import { nzHerbicides } from '../data/nzHerbicides'

// Safety levels
export const SAFETY = {
  SAFE: 'safe',
  CAUTION: 'caution',
  DAMAGE: 'damage',
  UNKNOWN: 'unknown',
}

/**
 * Determine crop safety level for a single herbicide product.
 * This is deterministic local code — never delegated to AI.
 */
export function getProductSafety(herbicide, cropId) {
  if (!cropId) return SAFETY.UNKNOWN

  if (herbicide.damageCrops.includes(cropId)) return SAFETY.DAMAGE
  if (herbicide.safeCrops.includes(cropId)) return SAFETY.SAFE
  if (herbicide.cautionCrops && herbicide.cautionCrops.includes(cropId)) return SAFETY.CAUTION

  // Non-selective products with no safe crops are always damage
  if (herbicide.mode === 'non-selective') return SAFETY.DAMAGE

  // Not explicitly listed — treat as unknown/caution
  return SAFETY.CAUTION
}

/**
 * Filter and group all herbicides by crop safety for a given cropId.
 * Returns { safe: [], caution: [], damage: [] }
 */
export function groupHerbicidesByCropSafety(cropId) {
  const safe = []
  const caution = []
  const damage = []

  for (const herbicide of nzHerbicides) {
    const level = getProductSafety(herbicide, cropId)
    if (level === SAFETY.SAFE) safe.push({ ...herbicide, safetyLevel: SAFETY.SAFE })
    else if (level === SAFETY.CAUTION) caution.push({ ...herbicide, safetyLevel: SAFETY.CAUTION })
    else if (level === SAFETY.DAMAGE) damage.push({ ...herbicide, safetyLevel: SAFETY.DAMAGE })
  }

  return { safe, caution, damage }
}

/**
 * Filter herbicides that target a specific weed name.
 * Used to filter spray recommendations after plant identification.
 */
export function filterHerbicidesByWeed(weedName) {
  if (!weedName) return nzHerbicides
  const lower = weedName.toLowerCase()
  return nzHerbicides.filter((h) =>
    h.targetWeeds.some((w) => w.toLowerCase().includes(lower) || lower.includes(w.toLowerCase()))
  )
}

/**
 * Get herbicides relevant to a weed, grouped by crop safety.
 */
export function getRelevantHerbicides(weedName, cropId) {
  const relevant = filterHerbicidesByWeed(weedName)

  if (!cropId) return { safe: [], caution: [], damage: [], all: relevant }

  const safe = []
  const caution = []
  const damage = []

  for (const herbicide of relevant) {
    const level = getProductSafety(herbicide, cropId)
    if (level === SAFETY.SAFE) safe.push({ ...herbicide, safetyLevel: SAFETY.SAFE })
    else if (level === SAFETY.CAUTION) caution.push({ ...herbicide, safetyLevel: SAFETY.CAUTION })
    else if (level === SAFETY.DAMAGE) damage.push({ ...herbicide, safetyLevel: SAFETY.DAMAGE })
  }

  return { safe, caution, damage, all: relevant }
}
