/**
 * monochrome green filter
 * set red and blue to zero
 */
 export default function monochromeGreen(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    imgData.data[i] = imgData.data[i + 2] = 0
  }
  return imgData
}
