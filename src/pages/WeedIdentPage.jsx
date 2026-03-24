import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { CameraCapture } from '../components/camera/CameraCapture'
import { PhotoPreview } from '../components/camera/PhotoPreview'
import { PlantIdentificationResult } from '../components/weed/PlantIdentificationResult'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { WarningBanner } from '../components/ui/WarningBanner'
import { Button } from '../components/ui/Button'
import { useClaudeVision } from '../hooks/useClaudeVision'
import { useCropProfile } from '../hooks/useCropProfile'

export function WeedIdentPage() {
  const [capturedImage, setCapturedImage] = useState(null)
  const { result, loading, error, identify, reset } = useClaudeVision()
  const { activeCrop } = useCropProfile()

  function handleCapture(dataUrl) {
    setCapturedImage(dataUrl)
    reset()
  }

  function handleRetake() {
    setCapturedImage(null)
    reset()
  }

  function handleIdentify() {
    identify(capturedImage, activeCrop)
  }

  return (
    <div className="px-4 py-2 space-y-4 pb-6">
      <PageHeader
        title="Weed Identification"
        subtitle={activeCrop ? `Crop: ${activeCrop.displayName}` : 'No crop selected'}
      />

      {!import.meta.env.VITE_ANTHROPIC_API_KEY && (
        <WarningBanner level="warning">
          <strong>API key not configured.</strong> Add <code>VITE_ANTHROPIC_API_KEY</code> to your{' '}
          <code>.env</code> file to enable AI identification.
        </WarningBanner>
      )}

      {!activeCrop && (
        <WarningBanner level="info">
          No crop selected. Go to <strong>My Crops</strong> to set your current crop for
          crop-safe spray recommendations.
        </WarningBanner>
      )}

      {/* Camera / photo section */}
      {!capturedImage && !result && (
        <div className="space-y-2">
          <p className="text-sm text-green-700 px-1">
            Point your camera at a weed or plant and tap the capture button.
          </p>
          <CameraCapture onCapture={handleCapture} />
        </div>
      )}

      {/* Preview before submitting */}
      {capturedImage && !result && !loading && (
        <PhotoPreview
          dataUrl={capturedImage}
          onRetake={handleRetake}
          onConfirm={handleIdentify}
          loading={loading}
        />
      )}

      {/* Loading */}
      {loading && (
        <LoadingSpinner message="Identifying plant with AI… this may take a few seconds" />
      )}

      {/* Error */}
      {error && (
        <div className="space-y-3">
          <WarningBanner level="danger">{error}</WarningBanner>
          <Button variant="secondary" onClick={handleRetake} className="w-full">
            Try Again
          </Button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <PlantIdentificationResult
            result={result}
            activeCrop={activeCrop}
            capturedImage={capturedImage}
          />
          <Button variant="secondary" onClick={handleRetake} className="w-full">
            Identify Another Plant
          </Button>
        </div>
      )}
    </div>
  )
}
