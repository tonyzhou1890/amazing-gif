/**
 * black and white filter
 * r: |g – b + g + r| * r / 256
 * g: |b – g + b + r| * r / 256
 * b: |b – g + b + r| * g / 256
 */
export default function comic(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const r = imgData.data[i],
          g = imgData.data[i + 1],
          b = imgData.data[i + 2]
    imgData.data[i] = Math.abs(g - b + g + r) * r / 256
    imgData.data[i + 1] = Math.abs(b - g + b + r) * r / 256
    imgData.data[i + 2] = Math.abs(b - g + b + r) * g / 256
  }
  return imgData
}
