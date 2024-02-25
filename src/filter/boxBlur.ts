import { isOdd } from '../utils/helpers'
import { getIndexByPoint } from '../utils/image'

/**
 * box blur
 */
export default function boxBlur (imgData: ImageData, boxSize = 5) {
  const tempImgData = new ImageData(imgData.width, imgData.height)
  tempImgData.data.set(imgData.data)
  // boxSize need be odd
  boxSize = isOdd(boxSize) ? boxSize : boxSize + 1
  const halfBoxSize = boxSize >> 1
  const boxLen = boxSize * boxSize
  let x = 0
  let y = 0
  let bx = 0
  let by = 0
  let sum = 0
  let avg = 0
  // rbg sum cache
  const cache = [0, 0, 0]
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    x = (i / 4) % imgData.width
    y = (i / 4 / imgData.width) >> 0
    bx = x - halfBoxSize
    by = y - halfBoxSize
    // rgb channels
    for (let c = 0; c < 3; c++) {
      sum = cache[c]

      // if the cell is the first of each row, calc full box
      if (!x) {
        sum = 0
        // count all box columns
        for (let bxc = bx; bxc <= x + halfBoxSize; bxc++) {
          sum += getColumnSum(imgData, bxc, by, boxSize, c)
        }
      } else {
        sum -= getColumnSum(imgData, bx - 1, by, boxSize, c)
        sum += getColumnSum(imgData, x + halfBoxSize, by, boxSize, c)
      }

      cache[c] = sum
      avg = (sum / boxLen) >> 0
      if (avg < 0) avg = 0
      else if (avg > 255) avg = 255
      tempImgData.data[i + c] = avg
    }
  }
  return tempImgData
}

function getColumnSum (imgData: ImageData, x: number, y: number, height: number, channel: number) {
  let sum = 0
  for (let i = 0; i < height; i++) {
    // out of bounds
    if (x < 0 || y < 0 || x >= imgData.width || y >= imgData.height) {
      // fix x
      if (x < 0) {
        x = 0
      } else if (x >= imgData.width) {
        x = imgData.width - 1
      }
      // fix y
      if (y < 0) {
        y = 0
      } else if (y >= imgData.height) {
        y = imgData.height - 1
      }
    }
    sum += imgData.data[getIndexByPoint(imgData, x, y) + channel]
    y++
  }
  return sum
}
