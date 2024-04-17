/**
 * grayscale filter
 * Weighted average: 0.3R + 0.59G + 0.11*B
 */
export default function (imgData: ImageData): ImageData {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const avg =
      (imgData.data[i] * 0.3 + imgData.data[i + 1] * 0.59 + imgData.data[i + 2] * 0.11) >> 0
    imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg
  }
  return imgData
}
