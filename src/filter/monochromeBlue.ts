/**
 * monochrome blue filter
 * set red and green to zero
 */
 export default function monochromeBlue(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    imgData.data[i] = imgData.data[i + 1] = 0
  }
  return imgData
}
