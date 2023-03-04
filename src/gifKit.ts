import decode from "./decoder"
import encode from './encoder'
import { generateIndependentImageData, generateFullCanvasImageData } from './render'
import { GifData } from "./types"

const kit = {
  /**
   * decode gif (ArrayBuffer)
   */
  decode(buf: ArrayBuffer, errorCallback: Function): GifData | undefined {
    return decode(buf, (msg: string, ev: string) => {
      return errorCallback(msg)
    })
  },

  /**
   * encode gif
   */
  encode(gifData: GifData): Uint8Array {
    return encode(gifData)
  },

  /**
   * get frame ImageData
   * single frame, support transparent, without regard to disposal method
   */
  getFrameImageData: generateIndependentImageData,

  /**
   * get frames ImageData[]
   * this will take a long time
   */
  getFramesImageData(gifData: GifData): ImageData[] {
    return gifData.frames.map((_, index) => {
      return generateIndependentImageData(gifData, index)
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
  getCompositeFramesImageData(gifData: GifData): ImageData[] {
    return gifData.frames.map((_, index) => {
      return generateFullCanvasImageData(gifData, index)
    })
  }
}

export default kit