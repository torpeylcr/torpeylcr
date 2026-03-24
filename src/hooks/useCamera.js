import { useState, useRef, useCallback, useEffect } from 'react'

export function useCamera() {
  const [hasPermission, setHasPermission] = useState(null) // null = not asked, true/false
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const streamRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    setIsSupported(
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    )
    return () => stopStream()
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setHasPermission(true)
      return stream
    } catch (err) {
      setHasPermission(false)
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else {
        setError(`Camera error: ${err.message}`)
      }
      return null
    }
  }, [])

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  return {
    videoRef,
    hasPermission,
    isSupported,
    error,
    startCamera,
    stopStream,
    captureFrame,
  }
}
