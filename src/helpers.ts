/**
 * @module helpers
 */

/**
 * @name noop
 * @description empty function
 */
export function noop() {}

/**
 * @name isFunc
 */
export function isFunc(f: any) {
  return typeof f === 'function'
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
  skinContainerIsSmall: '空间不足以显示皮肤'
}