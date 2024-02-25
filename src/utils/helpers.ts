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
