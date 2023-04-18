import decode from './decoder'
import encode from './encoder'
import build from './builder'
import { generateRawImageData, generateFullCanvasImageData } from './render'
import { GifData, ToBuildDataType } from './types'

const kit = {
  /**
   * decode gif (ArrayBuffer)
   */
  async decode (
    buf: ArrayBuffer,
    errorCallback?: (msg: string) => undefined
  ): Promise<GifData | undefined> {
    return decode(buf, (msg: string) => {
      return errorCallback?.(msg)
    })
  },

  /**
   * encode gif
   */
  async encode (gifData: GifData): Promise<Uint8Array> {
    return encode(gifData)
  },

  /**
   * build image data list to gif
   */
  async build (data: ToBuildDataType): Promise<Uint8Array> {
    return build(data)
  },

  /**
   * get frame ImageData
   * single frame, support transparent, without regard to disposal method
   */
  getFrameImageData: generateRawImageData,

  /**
   * get frames ImageData[]
   * this will take a long time
   */
  getFramesImageData (gifData: GifData): ImageData[] {
    return gifData.frames.map((_, index) => {
      return generateRawImageData(gifData, index)
    })
  },

  /**
   * get composite ImageData of a frame
   * this may take a long time
   */
  getCompositeFrameImageData: generateFullCanvasImageData,

  /**
   * get composite ImageData of all frames
   * this will take a long time
   */
  getCompositeFramesImageData (gifData: GifData): ImageData[] {
    return gifData.frames.map((_, index) => {
      return generateFullCanvasImageData(gifData, index)
    })
  },
}

export default kit
