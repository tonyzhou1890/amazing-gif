/**
 * black and white filter
 * r: r * 128 / (g + b + 1)
 * g: g * 128 / (r + b + 1)
 * b: b * 128 / (g + r + 1)
 */
export default function cast(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const r = imgData.data[i],
          g = imgData.data[i + 1],
          b = imgData.data[i + 2]
    const newR = r * 128 / (g + b + 1),
          newG = g * 128 / (r + b + 1),
          newB = b * 128 / (g + r + 1)
    imgData.data[i] = Math.min(255, Math.max(0, newR))
    imgData.data[i + 1] = Math.min(255, Math.max(0, newG))
    imgData.data[i + 2] = Math.min(255, Math.max(0, newB))
  }
  return imgData
}
