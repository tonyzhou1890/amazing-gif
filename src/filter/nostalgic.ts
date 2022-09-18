/**
 * nostalgic filter
 * r: 0.393 * r + 0.769 * g + 0.189 * b
 * g: 0.349 * r + 0.686 * g + 0.168 * b
 * b: 0.272 * r + 0.534 * g + 0.131 * b
 */
export default function nostalgic(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const r = imgData.data[i],
          g = imgData.data[i + 1],
          b = imgData.data[i + 2]
    const newR = 0.393 * r + 0.769 * g + 0.189 * b,
          newG = 0.349 * r + 0.686 * g + 0.168 * b,
          newB = 0.272 * r + 0.534 * g + 0.131 * b
    imgData.data[i] = Math.min(255, Math.max(0, newR))
    imgData.data[i + 1] = Math.min(255, Math.max(0, newG))
    imgData.data[i + 2] = Math.min(255, Math.max(0, newB))
  }
  return imgData
}
