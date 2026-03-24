import { useEffect, useRef, useState } from 'react'
import { useCamera } from '../../hooks/useCamera'
import { fileToDataUrl } from '../../utils/imageUtils'
import { Button } from '../ui/Button'

export function CameraCapture({ onCapture }) {
  const { videoRef, hasPermission, isSupported, error, startCamera, stopStream, captureFrame } = useCamera()
  const [cameraActive, setCameraActive] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isSupported && !cameraActive) {
      handleStartCamera()
    }
    return () => stopStream()
  }, [isSupported])

  async function handleStartCamera() {
    const stream = await startCamera()
    if (stream) setCameraActive(true)
  }

  function handleCapture() {
    const dataUrl = captureFrame()
    if (dataUrl) {
      stopStream()
      setCameraActive(false)
      onCapture(dataUrl)
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    onCapture(dataUrl)
  }

  if (!isSupported || hasPermission === false) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-green-50 rounded-2xl border-2 border-dashed border-green-200">
        {error && <p className="text-sm text-red-700 text-center">{error}</p>}
        {!isSupported && (
          <p className="text-sm text-green-700 text-center">
            Camera not available — upload a photo instead
          </p>
        )}
        <Button onClick={() => fileInputRef.current?.click()}>
          📁 Choose Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] w-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {cameraActive && (
        <>
          {/* Crosshair guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 border-2 border-white/60 rounded-xl" />
          </div>

          {/* Capture button */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white shadow-lg border-4 border-green-600 active:scale-90 transition-transform"
              aria-label="Capture photo"
            />
          </div>

          {/* File fallback */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-3 right-3 bg-black/40 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm"
          >
            📁 Upload
          </button>
        </>
      )}

      {!cameraActive && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
