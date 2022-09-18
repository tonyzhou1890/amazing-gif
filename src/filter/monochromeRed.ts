/**
 * monochrome red filter
 * set green and blue to zero
 */
 export default function monochromeRed(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    imgData.data[i + 1] = imgData.data[i + 2] = 0
  }
  return imgData
}
