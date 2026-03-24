import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { SoilTestForm } from '../components/fertilizer/SoilTestForm'
import { FertilizerRecommendationList } from '../components/fertilizer/FertilizerRecommendationList'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { WarningBanner } from '../components/ui/WarningBanner'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useSoilTest } from '../hooks/useSoilTest'
import { useClaudeAgronomist } from '../hooks/useClaudeAgronomist'
import { useCropProfile } from '../hooks/useCropProfile'
import { parseSoilTest } from '../utils/soilTestParser'

export function FertilizerPage() {
  const { formValues, updateField, resetForm } = useSoilTest()
  const { result, loading, error, getRecommendations, reset } = useClaudeAgronomist()
  const { activeCrop } = useCropProfile()
  const [validationErrors, setValidationErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const { valid, errors, data } = parseSoilTest(formValues)

    if (!valid) {
      setValidationErrors(errors)
      // Scroll to first error
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setValidationErrors({})
    getRecommendations(data, activeCrop)
  }

  function handleReset() {
    resetForm()
    reset()
    setValidationErrors({})
  }

  return (
    <div className="px-4 py-2 space-y-4 pb-6">
      <PageHeader
        title="Fertilizer Advisor"
        subtitle={activeCrop ? `Crop: ${activeCrop.displayName}` : 'No crop selected'}
      />

      {!activeCrop && (
        <WarningBanner level="info">
          No crop selected. Go to <strong>My Crops</strong> to set your crop for tailored recommendations.
        </WarningBanner>
      )}

      {/* Soil test form */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4">
            <SoilTestForm
              values={formValues}
              errors={validationErrors}
              onChange={updateField}
            />
          </Card>

          {error && <WarningBanner level="danger">{error}</WarningBanner>}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={handleReset} className="flex-1">
              Clear
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Getting recommendations…' : 'Get Recommendations'}
            </Button>
          </div>
        </form>
      )}

      {loading && (
        <LoadingSpinner message="Analysing soil test with AI agronomist…" />
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          <FertilizerRecommendationList result={result} />
          <Button variant="secondary" onClick={() => { reset() }} className="w-full">
            Edit Soil Test
          </Button>
        </div>
      )}
    </div>
  )
}
