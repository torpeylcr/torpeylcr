export function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function lsRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore
  }
}
