import { useState, useCallback } from 'react'
import { identifyPlant } from '../services/plantIdentService'
import { compressImageForAPI } from '../utils/imageUtils'

export function useClaudeVision() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const identify = useCallback(async (dataUrl, activeCrop) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const base64 = await compressImageForAPI(dataUrl)
      const data = await identifyPlant(base64, activeCrop)
      setResult(data)
    } catch (err) {
      if (!navigator.onLine) {
        setError('You are offline. AI identification requires an internet connection.')
      } else {
        setError(err.message || 'Failed to identify plant. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, identify, reset }
}
