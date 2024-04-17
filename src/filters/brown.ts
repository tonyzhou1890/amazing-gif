/**
 * brown filter
 * r: r * 0.393 + g * 0.769 + b * 0.189
 * g: r * 0.349 + g * 0.686 + b * 0.168
 * b: r * 0.272 + g * 0.534 + b * 0.131
 */
export default function brown (imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const r = imgData.data[i],
      g = imgData.data[i + 1],
      b = imgData.data[i + 2]
    const newR = r * 0.393 + g * 0.769 + b * 0.189,
      newG = r * 0.349 + g * 0.686 + b * 0.168,
      newB = r * 0.272 + g * 0.534 + b * 0.131
    imgData.data[i] = Math.min(255, Math.max(0, newR))
    imgData.data[i + 1] = Math.min(255, Math.max(0, newG))
    imgData.data[i + 2] = Math.min(255, Math.max(0, newB))
  }
  return imgData
}
