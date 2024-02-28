import decode from './decode'
import encode from './encode'
import build from './build'
import GifPlayer from './player'
import filter from './filter'
import SkinBase from './skin/base'
import { generateRawImageData, generateFullCanvasImageData } from './utils/render'
import { GifData } from './types'

function getFramesImageData (gifData: GifData): ImageData[] {
  return gifData.frames.map((_, index) => {
    return generateRawImageData(gifData, index)
  })
}

function getCompositedFramesImageData (gifData: GifData): ImageData[] {
  return gifData.frames.map((_, index) => {
    return generateFullCanvasImageData(gifData, index)
  })
}

export {
  /**
   * decode gif (ArrayBuffer)
   */
  decode,
  /**
   * encode gif
   */
  encode,
  /**
   * build image data list to gif
   */
  build,
  /**
   * get frame ImageData
   * single frame, support transparent, without regard to disposal method
   */
  generateRawImageData as getFrameImageData,
  /**
   * get frames ImageData[]
   * this will take a long time
   */
  getFramesImageData,
  /**
   * get composite ImageData of a frame
   * this may take a long time
   */
  generateFullCanvasImageData as getCompositedFrameImageData,
  /**
   * get composite ImageData of all frames
   * this will take a long time
   */
  getCompositedFramesImageData,
  /**
   * player
   */
  GifPlayer,
  /**
   * build-in filters
   */
  filter,
  /**
   * base skin. If you want customize your skin, you can
   */
  SkinBase,
}
