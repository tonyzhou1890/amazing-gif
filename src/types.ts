type CallbackFunc = (message: string) => void

export type httpGifRequest = (src: string) => Blob

export type AnyFuncType = (...args: any) => any

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
  // need loop? this will overwrite GIF's inner value
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
  onPause?: CallbackFunc
  filter?: (imgData: ImageData) => ImageData
}

/**
 * event func name type
 */
export type EventFuncNameType = 'onLoad' | 'onError' | 'onLoadError' | 'onDataError'

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
  type: string // e.g. 'GIF'
  isGif: boolean
  version: string // e.g. '89a'
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
  startByte: number
  endByte: number
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
  codeSize: number
  // pixel indices
  imageData: Uint8Array
  imageStartByte: number
  imageEndByte: number
  canvasImageData?: ImageData
  rawImageData?: ImageData
}

/**
 * application extension data type
 */
export interface AppExt {
  appName: string
  verification: string
  blockIdx: number
  repetitionTimes: number
  startByte: number
  endByte: number
}

/**
 * gif data obj type
 */
export interface GifData {
  header: GifHeaderInfo
  appExt?: AppExt
  frames: Array<GifFrameData>
}

/**
 * gif encoded data type
 */
export interface GifEncodeData {
  buf: Uint8Array
  ptr: number
}

/**
 * value change type
 */
export interface ValueChangeType {
  key: string
  oldValue: any
  newValue: any
}

/**
 * string key object
 */
export interface StringKeyObjType {
  [x: string]: any
}

/**
 * worker job type
 */
export interface WorkerJobType {
  action: string
  param?: Array<any>
  transferable?: Transferable[]
}

/**
 * worker job wrap type
 */
export interface WorkerJobWrapType {
  _sign: number
  job: WorkerJobType
  p: {
    resolve: (value: unknown) => void
    reject: (value: unknown) => void
  }
}

/**
 * to build frame data type
 */
export interface ToBuildFrameDataType {
  // what you see in this frame
  imageData: ImageData
  // xx ms, must be multiple of 10, default 10
  delay?: number
  // disposal method--Indicates the way in which the graphic is to be treated after being displayed.
  // 1 -   Do not dispose. The graphic is to be left in place.
  // 2 -   Restore to background color. The area used by the graphic must be restored to the background color.
  // 3 -   Restore to previous. The decoder is required to restore the area overwritten by the graphic with what was there prior to rendering the graphic.
  // default 1
  disposalMethod?: number
  // local color table, default false
  setLocalColorTable?: boolean
}

/**
 * quantized frame data
 */
export interface QuantizedFrameType {
  imageData: ImageData
  indices: Uint8Array
}

/**
 * build data type
 */
export interface ToBuildDataType {
  // background color, rgb(128, 128, 128) or xffffff
  backgroundColor?: string
  // repetition, 0 represents infinite
  repetition?: number
  // dithering, default true
  dithering?: boolean
  // frames
  frames: Array<ToBuildFrameDataType>
}

/**
 * point
 * [col, row], just like [x, y]
 */
export type Point = { x: number; y: number }

/**
 * rgba map
 */
export interface RGBAMAPType {
  r: number
  g: number
  b: number
  a: number
}

/**
 * color table and frames
 */
export interface ColorTableAndFramesType {
  colorTable: Array<Array<number>>
  frames: Array<QuantizedFrameType>
}

/**
 * color and index
 */
export interface ColorAndIndexType {
  color: Array<number>
  index: number
}
