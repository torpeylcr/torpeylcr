import { useState, useCallback } from 'react'
import { lsGet, lsSet, lsRemove } from '../utils/localStorageUtils'
import { getCropById } from '../data/nzCrops'

const LS_CROPS = 'nzagro_crops'
const LS_ACTIVE_ID = 'nzagro_activeCropId'
const MAX_SAVED = 5

export function useCropProfile() {
  const [savedCrops, setSavedCrops] = useState(() => lsGet(LS_CROPS, []))
  const [activeCropId, setActiveCropId] = useState(() => lsGet(LS_ACTIVE_ID, null))

  const activeCrop = activeCropId ? getCropById(activeCropId) : null

  const setActiveCrop = useCallback((cropId) => {
    setActiveCropId(cropId)
    lsSet(LS_ACTIVE_ID, cropId)
  }, [])

  const saveCropProfile = useCallback((cropId, paddockName = '') => {
    const crop = getCropById(cropId)
    if (!crop) return

    const profile = {
      id: `${cropId}-${Date.now()}`,
      cropId,
      paddockName,
      savedAt: new Date().toISOString(),
    }

    setSavedCrops((prev) => {
      const filtered = prev.filter((p) => p.cropId !== cropId)
      const updated = [profile, ...filtered].slice(0, MAX_SAVED)
      lsSet(LS_CROPS, updated)
      return updated
    })

    setActiveCrop(cropId)
  }, [setActiveCrop])

  const removeCropProfile = useCallback((profileId) => {
    setSavedCrops((prev) => {
      const updated = prev.filter((p) => p.id !== profileId)
      lsSet(LS_CROPS, updated)
      return updated
    })
  }, [])

  const clearActiveCrop = useCallback(() => {
    setActiveCropId(null)
    lsRemove(LS_ACTIVE_ID)
  }, [])

  return {
    activeCrop,
    activeCropId,
    savedCrops,
    setActiveCrop,
    saveCropProfile,
    removeCropProfile,
    clearActiveCrop,
  }
}
