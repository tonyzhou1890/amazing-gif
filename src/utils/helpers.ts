/**
 * @module helpers
 */

/**
 * @name noop
 * @description empty function
 */
export function noop () {
  /* noop */
}

/**
 * @name isFunc
 */
export function isFunc (f: any) {
  return typeof f === 'function'
}

/**
 * isOdd
 */
export function isOdd (a: number) {
  return !!(a % 2)
}

export const errMsgs = {
  notReady: '数据未就绪',
  wrongParam: '参数错误',
  noGifUrl: '未指定 gif 图片地址',
  gifEmpty: 'gif 不存在',
  gifDataTypeError: 'gif 数据类型错误',
  notGif: '文件非 gif',
  noConfigEl: '未指定 img 元素',
  noImg: '未找到 img 元素',
  notImg: (el: string) => `元素 ${el} 不是图片`,
  isRendering: 'isRendering',
  skinError: '皮肤出错',
  skinContainerIsSmall: '空间不足以显示皮肤',
  errData: '数据格式错误',
}

/**
 * @name fillBoxPixels
 * fill box pixels
 */
export function fillBoxPixels (
  imgData: ImageData,
  x: number,
  y: number,
  box: Uint8ClampedArray,
  boxWidth: number,
  boxHeight: number,
  pixelChannel: number
): Uint8ClampedArray {
  let xOver = false
  let yOver = false
  let xDis = 0
  let yDis = 0
  const boxCenter = [(boxWidth / 2) >> 0, (boxHeight / 2) >> 0]
  let pixelStartIdx = 0
  for (let i = 0; i < boxWidth; i++) {
    for (let j = 0; j < boxHeight; j++) {
      xOver = false
      yOver = false
      // whether x direction overflow
      xDis = boxCenter[0] - i
      if (xDis > 0) {
        if (xDis > x) {
          xOver = true
        }
      } else {
        if (x - xDis >= imgData.width) {
          xOver = true
        }
      }
      // whether y direction overflow
      yDis = boxCenter[1] - j
      if (j < boxCenter[1]) {
        if (yDis > y) {
          yOver = true
        }
      } else {
        if (y - yDis >= imgData.height) {
          yOver = true
        }
      }
      // Out-of-bounds processing
      // corner
      if (xOver && yOver) {
        // left-top corner
        if (xDis > 0 && yDis > 0) {
          pixelStartIdx = 0
        } else if (xDis < 0 && yDis < 0) {
          // right-bottom corner
          pixelStartIdx = (imgData.width * imgData.height - 1) * 4
        } else if (xDis > 0) {
          // left-bottom corner
          pixelStartIdx = imgData.width * (imgData.height - 1) * 4
        } else {
          // right-top corner
          pixelStartIdx = (imgData.width - 1) * 4
        }
      } else if (xOver) {
        // left
        if (xDis < 0) {
          pixelStartIdx = (y - yDis) * imgData.width * 4
        } else {
          // right
          pixelStartIdx = ((y - yDis) * imgData.width - 1) * 4
        }
      } else if (yOver) {
        // top
        if (yDis < 0) {
          pixelStartIdx = (x - xDis) * 4
        } else {
          // bottom
          pixelStartIdx = ((imgData.height - 1) * imgData.width + x - xDis) * 4
        }
      }
      // common processing
      pixelStartIdx = ((y - yDis) * imgData.width + (x - xDis)) * 4
      box[i + boxWidth * j] = imgData.data[pixelStartIdx + pixelChannel]
    }
  }
  return box
}

/**
 * get bit depth of a num
 * @param num
 * @returns
 */
export function getBitsByNum (num: number): number {
  let exp = 1
  while (num > 2 ** exp) {
    exp++
  }
  return exp
}

/**
 * getBits
 * @param num 1 byte
 * @param bitIdx bit index(from right to left)
 * @param length required bits length
 */
export function getBits (num: number, bitIdx: number, length: number): number {
  return (num >> bitIdx) & ((1 << length) - 1)
}

/**
 * setBits
 * @param targetNum 1 byte
 * @param bitIdx bit index (from right to left)
 * @param length required bits length
 * @param sourceNum
 * @returns
 */
export function setBits (
  targetNum: number,
  bitIdx: number,
  length: number,
  sourceNum: number
): number {
  return ((((1 << length) - 1) & sourceNum) << bitIdx) | targetNum
}

/**
 * increase buffer capacity
 * @param buf
 * @param num
 * @returns
 */
export function bufferGrow (buf: ArrayBuffer, num?: number): ArrayBuffer | undefined {
  if (!num) {
    num = 256
  }
  if (buf instanceof Uint8Array) {
    const temp = new Uint8Array(buf.length + num)
    temp.set(buf)
    return temp
  }
  return undefined
}
