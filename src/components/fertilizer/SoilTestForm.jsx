import { FormField, TextInput } from '../ui/FormField'
import { useCropProfile } from '../../hooks/useCropProfile'
import { assessNutrientStatus } from '../../utils/soilTestParser'

const FIELDS = [
  // Section 1: Paddock info
  { section: 'Paddock Information (optional)', fields: [
    { key: 'fieldName', label: 'Paddock / Field Name', type: 'text', placeholder: 'e.g. North paddock' },
    { key: 'sampleDate', label: 'Sample Date', type: 'date' },
    { key: 'labReference', label: 'Lab Reference Number', type: 'text', placeholder: 'e.g. 2024-12345' },
  ]},
  // Section 2: Reaction
  { section: 'Reaction', fields: [
    { key: 'pH', label: 'pH', unit: '', placeholder: '6.0', min: 3.5, max: 9.0, nutrientKey: 'pH' },
  ]},
  // Section 3: Macronutrients
  { section: 'Macronutrients', fields: [
    { key: 'olsenP', label: 'Olsen P', unit: 'mg/L', placeholder: '25', min: 1, max: 300, nutrientKey: 'olsenP' },
    { key: 'K', label: 'Potassium (K)', unit: 'me/100g', placeholder: '6.0', nutrientKey: 'K' },
    { key: 'S', label: 'Sulphur (S)', unit: 'mg/kg', placeholder: '8', nutrientKey: 'S' },
    { key: 'Ca', label: 'Calcium (Ca)', unit: 'me/100g', placeholder: '4.5', nutrientKey: 'Ca' },
    { key: 'Mg', label: 'Magnesium (Mg)', unit: 'me/100g', placeholder: '0.5', nutrientKey: 'Mg' },
    { key: 'Na', label: 'Sodium (Na)', unit: 'me/100g', placeholder: '0.2', optional: true },
  ]},
  // Section 4: CEC
  { section: 'CEC & Base Saturations (optional)', fields: [
    { key: 'CEC', label: 'CEC', unit: 'me/100g', placeholder: '15', optional: true },
    { key: 'CaSat', label: 'Ca Saturation', unit: '%', placeholder: '65', optional: true },
    { key: 'MgSat', label: 'Mg Saturation', unit: '%', placeholder: '12', optional: true },
    { key: 'KSat', label: 'K Saturation', unit: '%', placeholder: '4', optional: true },
    { key: 'NaSat', label: 'Na Saturation', unit: '%', placeholder: '1', optional: true },
  ]},
  // Section 5: Trace elements
  { section: 'Trace Elements (optional)', fields: [
    { key: 'B', label: 'Boron (B)', unit: 'mg/kg', placeholder: '0.5', optional: true },
    { key: 'Cu', label: 'Copper (Cu)', unit: 'mg/kg', placeholder: '2.0', optional: true },
    { key: 'Zn', label: 'Zinc (Zn)', unit: 'mg/kg', placeholder: '1.5', optional: true },
    { key: 'Mn', label: 'Manganese (Mn)', unit: 'mg/kg', placeholder: '25', optional: true },
  ]},
]

function getStatusBadge(status) {
  if (!status || status === 'unknown') return null
  const map = {
    low: { label: '↓ Low', className: 'text-orange-600 bg-orange-50' },
    optimal: { label: '✓ Optimal', className: 'text-green-700 bg-green-50' },
    high: { label: '↑ High', className: 'text-blue-600 bg-blue-50' },
  }
  const cfg = map[status]
  if (!cfg) return null
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

export function SoilTestForm({ values, errors, onChange }) {
  const { activeCrop } = useCropProfile()

  function getHint(fieldConfig) {
    if (!activeCrop || !fieldConfig.nutrientKey) return null
    const targets = activeCrop.soilTestTargets?.[fieldConfig.nutrientKey]
    if (!targets) return null
    const parts = [`Optimum: ${targets.optimum}`]
    if (targets.units) parts.push(targets.units)
    return parts.join(' ')
  }

  function getStatus(fieldConfig) {
    if (!activeCrop || !fieldConfig.nutrientKey) return null
    const targets = activeCrop.soilTestTargets?.[fieldConfig.nutrientKey]
    const val = parseFloat(values[fieldConfig.key])
    if (isNaN(val)) return null
    return assessNutrientStatus(val, targets)
  }

  return (
    <div className="space-y-6">
      {FIELDS.map(({ section, fields }) => (
        <div key={section}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 mb-3">{section}</h3>
          <div className={`grid gap-3 ${fields.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {fields.map((field) => {
              const hint = getHint(field)
              const status = getStatus(field)
              return (
                <FormField
                  key={field.key}
                  label={field.label}
                  unit={field.unit}
                  hint={hint}
                  error={errors?.[field.key]}
                >
                  <div className="relative">
                    <TextInput
                      type={field.type || 'number'}
                      inputMode={field.type === 'text' ? 'text' : 'decimal'}
                      placeholder={field.placeholder}
                      value={values[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      error={errors?.[field.key]}
                    />
                    {status && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {getStatusBadge(status)}
                      </div>
                    )}
                  </div>
                </FormField>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
