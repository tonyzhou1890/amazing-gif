import { fillBoxPixels, isOdd } from '../utils/helpers'
/**
 * box blur
 */
export default function boxBlur (imgData: ImageData, boxSize = 5) {
  const tempImgData = new ImageData(imgData.width, imgData.height)
  tempImgData.data.set(imgData.data)
  // boxSize need be odd
  boxSize = isOdd(boxSize) ? boxSize : boxSize + 1
  let x = 0
  let y = 0
  let box = new Uint8ClampedArray(boxSize * boxSize)
  let sum = 0
  let avg = 0
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    x = (i / 4) % imgData.width
    y = (i / 4 / imgData.width) >> 0
    // rgb channels
    for (let c = 0; c < 3; c++) {
      box = fillBoxPixels(imgData, x, y, box, boxSize, boxSize, c)
      // box average
      sum = 0
      for (let bi = 0, len = box.length; bi < len; bi++) {
        sum += box[bi]
      }
      avg = (sum / box.length) >> 0
      if (avg < 0) avg = 0
      else if (avg > 255) avg = 255
      tempImgData.data[i + c] = avg
    }
  }
  return tempImgData
}
