/**
 * Compress and resize an image for the Claude API.
 * Input: base64 data URL (from canvas or file reader)
 * Output: base64 JPEG string (without data URL prefix)
 */
export async function compressImageForAPI(dataUrl, maxDimension = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const compressed = canvas.toDataURL('image/jpeg', 0.8)
      // Strip the data URL prefix to get raw base64
      const base64 = compressed.replace(/^data:image\/jpeg;base64,/, '')
      resolve(base64)
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Convert a File object to a base64 data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
