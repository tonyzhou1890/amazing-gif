type CallbackFunc = (message: string) => void

export type httpGifRequest = (src: string) => Blob

/**
 * @interface Config
 * @description
 * AMZGif param
 */
export interface Config {
  // image element or id of image element
  el: HTMLImageElement | string
  // gif address
  src?: string
  // function used to get gif data
  httpRequest?: httpGifRequest
  // need loop?
  loop?: boolean
  auto?: boolean
  // element width. this will be img's width by default
  width?: number
  // element height. this will be img's height by default
  height?: number
  // if interactive is false, you can't stop and play gif by click the image
  interactive?: boolean
  // skin--'basic'
  skin?: string
  // speed--0.5/1.0/1.5/2.0
  speed: number
  onLoad?: CallbackFunc
  onLoadError?: CallbackFunc
  onDataError?: CallbackFunc
  onError?: CallbackFunc
  // (can be Promise,) if result is false, will not play
  onBeforePlay?: CallbackFunc
  onPlay?: CallbackFunc
  onEnd?: CallbackFunc
  // (can be Promise,) if result if false, will not stop
  onBeforePause: CallbackFunc
  onPause?: CallbackFunc,
  filter?: (imgData: ImageData) => ImageData
}

/**
 * read ctrl type
 */
export interface ReadCtrlType {
  ptr: number
}

/**
 * gif header info type
 */
export interface GifHeaderInfo {
  type: string
  isGif: boolean
  version: string
  width: number
  height: number
  gctFlag: boolean
  cr: number
  sortFlag: boolean
  gctSize: number
  gctStartByte: number
  gctEndByte: number
  bgIndex: number
  pixelAspect: number
  gctList: Array<Array<number>>
}

/**
 * gif frame data
 */
export interface GifFrameData {
  startByte: number,
  endByte: number,
  width: number
  height: number
  left: number
  top: number
  disposalMethod: number
  userInputFlag: boolean
  transColorFlag: boolean
  delay: number
  transColorIdx: number
  lctFlag: boolean
  interlace: boolean
  sortFlag: boolean
  lctSize: number
  lctStartByte: number
  lctEndByte: number
  lctList: Array<Array<number>>
  imageData: Uint8Array
  imageStartByte: number
  imageEndByte: number
  canvasImageData?: ImageData
}

/**
 * gif data obj type
 */
export interface GifData {
  header: GifHeaderInfo
  appExt?: {
    appName: string
    repetitionTimes: number
    startByte: number
    endByte: number
  }
  frames: Array<GifFrameData>
}

/**
 * value change type
 */
export interface ValueChangeType {
  key: string
  oldValue: any
  newValue: any
}