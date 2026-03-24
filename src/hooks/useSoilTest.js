import { useState, useCallback } from 'react'
import { lsGet, lsSet } from '../utils/localStorageUtils'

const LS_KEY = 'nzagro_soiltest'

const EMPTY_FORM = {
  fieldName: '',
  sampleDate: '',
  labReference: '',
  pH: '',
  olsenP: '',
  K: '',
  S: '',
  Ca: '',
  Mg: '',
  Na: '',
  CEC: '',
  CaSat: '',
  MgSat: '',
  KSat: '',
  NaSat: '',
  B: '',
  Cu: '',
  Zn: '',
  Mn: '',
}

export function useSoilTest() {
  const [formValues, setFormValues] = useState(() => ({
    ...EMPTY_FORM,
    ...lsGet(LS_KEY, {}),
  }))

  const updateField = useCallback((field, value) => {
    setFormValues((prev) => {
      const updated = { ...prev, [field]: value }
      lsSet(LS_KEY, updated)
      return updated
    })
  }, [])

  const resetForm = useCallback(() => {
    setFormValues(EMPTY_FORM)
    lsSet(LS_KEY, {})
  }, [])

  return { formValues, updateField, resetForm }
}
