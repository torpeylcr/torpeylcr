/**
 * Validate and normalise a soil test form object.
 * Returns { valid: bool, errors: {fieldName: errorMsg}, data: normalised }
 */
export function parseSoilTest(raw) {
  const errors = {}
  const data = {}

  // pH — required
  const pH = parseFloat(raw.pH)
  if (isNaN(pH) || pH < 3.5 || pH > 9.0) {
    errors.pH = 'pH must be between 3.5 and 9.0'
  } else {
    data.pH = pH
  }

  // Olsen P — required
  const olsenP = parseFloat(raw.olsenP)
  if (isNaN(olsenP) || olsenP < 1 || olsenP > 300) {
    errors.olsenP = 'Olsen P must be between 1 and 300 mg/L'
  } else {
    data.olsenP = olsenP
  }

  // Optional macronutrients
  const optionalFields = [
    { key: 'K', label: 'K', min: 0, max: 30 },
    { key: 'S', label: 'S', min: 0, max: 200 },
    { key: 'Ca', label: 'Ca', min: 0, max: 30 },
    { key: 'Mg', label: 'Mg', min: 0, max: 10 },
    { key: 'Na', label: 'Na', min: 0, max: 10 },
    { key: 'CEC', label: 'CEC', min: 0, max: 100 },
  ]

  for (const field of optionalFields) {
    if (raw[field.key] !== undefined && raw[field.key] !== '') {
      const val = parseFloat(raw[field.key])
      if (!isNaN(val)) {
        if (val < field.min || val > field.max) {
          errors[field.key] = `${field.label} should be between ${field.min} and ${field.max}`
        } else {
          data[field.key] = val
        }
      }
    }
  }

  // Base saturations (%)
  const satFields = ['CaSat', 'MgSat', 'KSat', 'NaSat']
  for (const key of satFields) {
    if (raw[key] !== undefined && raw[key] !== '') {
      const val = parseFloat(raw[key])
      if (!isNaN(val) && val >= 0 && val <= 100) {
        data[key] = val
      }
    }
  }

  // Trace elements (optional, no strict validation)
  const traceFields = ['B', 'Cu', 'Zn', 'Mn']
  for (const key of traceFields) {
    if (raw[key] !== undefined && raw[key] !== '') {
      const val = parseFloat(raw[key])
      if (!isNaN(val) && val >= 0) {
        data[key] = val
      }
    }
  }

  // Metadata
  if (raw.fieldName) data.fieldName = String(raw.fieldName).trim()
  if (raw.sampleDate) data.sampleDate = String(raw.sampleDate)
  if (raw.labReference) data.labReference = String(raw.labReference).trim()

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data,
  }
}

/**
 * Compare a soil test value against a crop's target range.
 * Returns: 'low' | 'optimal' | 'high' | 'unknown'
 */
export function assessNutrientStatus(value, target) {
  if (value === undefined || value === null || !target) return 'unknown'
  if (value < target.min) return 'low'
  if (target.max && value > target.max) return 'high'
  return 'optimal'
}
