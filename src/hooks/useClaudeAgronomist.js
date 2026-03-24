import { useState, useCallback } from 'react'
import { getFertilizerRecommendations } from '../services/fertRecommendService'

export function useClaudeAgronomist() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getRecommendations = useCallback(async (soilTestData, crop) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await getFertilizerRecommendations(soilTestData, crop)
      setResult(data)
    } catch (err) {
      if (!navigator.onLine) {
        setError('You are offline. AI recommendations require an internet connection.')
      } else {
        setError(err.message || 'Failed to get recommendations. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, getRecommendations, reset }
}
