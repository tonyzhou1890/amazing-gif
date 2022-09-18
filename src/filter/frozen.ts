/**
 * black and white filter
 * r: (r - g -b) * 3 /2
 * g: (g - r -b) * 3 /2
 * b: (b - g -r) * 3 /2
 */
export default function frozen(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const r = imgData.data[i],
          g = imgData.data[i + 1],
          b = imgData.data[i + 2]
    const newR = (r - g -b) * 3 /2,
          newG = (g - r -b) * 3 /2,
          newB = (b - g -r) * 3 /2
    imgData.data[i] = Math.min(255, Math.max(0, newR))
    imgData.data[i + 1] = Math.min(255, Math.max(0, newG))
    imgData.data[i + 2] = Math.min(255, Math.max(0, newB))
  }
  return imgData
}
