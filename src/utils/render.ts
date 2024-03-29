import { isFunc } from './helpers'
import { AnyFuncType, GifData, GifFrameData } from '../types'
import { defaultBgColor } from '../config'

/**
 * generate ImageData for canvas
 */
export function generateFullCanvasImageData (gifData: GifData, frameIndex: number): ImageData {
  const frameInfo = gifData.frames[frameIndex]
  // check cache
  if (frameInfo.canvasImageData instanceof ImageData) {
    return frameInfo.canvasImageData
  }
  // get last frame snapshot
  const lastFrameSnapshot = getLastFrameSnapshot(gifData, frameIndex)
  // color table
  const colorTable = frameInfo.lctFlag ? frameInfo.lctList : gifData.header.gctList
  // background color
  const bgColor = gifData.header.gctFlag
    ? [...gifData.header.gctList[gifData.header.bgIndex], 255]
    : [...defaultBgColor]
  // width and height
  const width = gifData.header.width
  const height = gifData.header.height

  // avoid affect raw data
  const frameImageCopy = getGifRawImageDataCopy(frameInfo)
  // fill color
  const frameImageData = new Uint8ClampedArray(width * height * 4)
  for (let i = 0, len = width * height; i < len; i++) {
    const x = i % width
    const y = (i / width) >> 0
    // first primary color index
    const pci = i << 2
    // whether current pixel in current frame image
    if (
      x >= frameInfo.left &&
      x < frameInfo.left + frameInfo.width &&
      y >= frameInfo.top &&
      y < frameInfo.top + frameInfo.height
    ) {
      // frameImageCopy index
      const ficidx = x - frameInfo.left + (y - frameInfo.top) * frameInfo.width
      // if this pixel is transparent, pixel will be filled with the color of previous frame at the same position
      if (frameInfo.transColorFlag && frameImageCopy[ficidx] === frameInfo.transColorIdx) {
        if (lastFrameSnapshot) {
          frameImageData[pci] = lastFrameSnapshot.data[pci]
          frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1]
          frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2]
          frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3]
        }
      } else {
        const color = colorTable[frameImageCopy[ficidx]]
        frameImageData[pci] = color[0]
        frameImageData[pci + 1] = color[1]
        frameImageData[pci + 2] = color[2]
        frameImageData[pci + 3] = 255
      }
    } else {
      if (lastFrameSnapshot) {
        frameImageData[pci] = lastFrameSnapshot.data[pci]
        frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1]
        frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2]
        frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3]
      } else {
        frameImageData[pci] = bgColor[0]
        frameImageData[pci + 1] = bgColor[1]
        frameImageData[pci + 2] = bgColor[2]
        frameImageData[pci + 3] = bgColor[3]
      }
    }
  }
  const frameImage = new ImageData(frameImageData, width, height)
  // cache
  frameInfo.canvasImageData = frameImage
  return frameImage
}

/**
 * generate ImageData
 * single frame, support transparent
 */
export function generateRawImageData (gifData: GifData, frameIndex: number): ImageData {
  const frameInfo = gifData.frames[frameIndex]
  // check cache
  if (frameInfo.rawImageData instanceof ImageData) {
    return frameInfo.rawImageData
  }
  // color table
  const colorTable = frameInfo.lctFlag ? frameInfo.lctList : gifData.header.gctList
  const frameImageCopy = getGifRawImageDataCopy(frameInfo)
  // fill color
  const frameImageData = new Uint8ClampedArray(frameInfo.width * frameInfo.height * 4)
  for (let i = 0; i < frameInfo.imageData.length; i++) {
    const idx = i << 2
    if (frameInfo.transColorFlag && frameImageCopy[i] === frameInfo.transColorIdx) {
      frameImageData[idx] = 0
      frameImageData[idx + 1] = 0
      frameImageData[idx + 2] = 0
      frameImageData[idx + 3] = 0
    } else {
      const color = colorTable[frameImageCopy[i]]
      frameImageData[idx] = color[0]
      frameImageData[idx + 1] = color[1]
      frameImageData[idx + 2] = color[2]
      frameImageData[idx + 3] = 255
    }
  }
  const rawImageData = new ImageData(frameInfo.width, frameInfo.height)
  rawImageData.data.set(frameImageData)
  // cache
  frameInfo.rawImageData = rawImageData
  return rawImageData
}

/**
 * get image data copy correctly (consider interlace)
 */
function getGifRawImageDataCopy (frameInfo: GifFrameData) {
  const frameImageCopy = new Uint8Array(frameInfo.imageData.length)
  let idx = 0
  function rowCopy (rowIdx: number) {
    for (let i = 0; i < frameInfo.width; i++) {
      frameImageCopy[idx] = frameInfo.imageData[rowIdx * frameInfo.width + i]
      idx++
    }
  }
  // interlace
  if (frameInfo.interlace) {
    let rowIdx = 0
    // pass 1: row 0, row 8, row 16……
    while (rowIdx < frameInfo.height) {
      rowCopy(rowIdx)
      rowIdx += 8
    }
    // pass 2: row 4, row 12, row 20……
    rowIdx = 4
    while (rowIdx < frameInfo.height) {
      rowCopy(rowIdx)
      rowIdx += 8
    }
    // pass 3: row 2, row 6, row 10……
    rowIdx = 2
    while (rowIdx < frameInfo.height) {
      rowCopy(rowIdx)
      rowIdx += 4
    }
    // pass 4: row 1, row 3, row 5……
    rowIdx = 1
    while (rowIdx < frameInfo.height) {
      rowCopy(rowIdx)
      rowIdx += 2
    }
  } else {
    frameImageCopy.set(frameInfo.imageData)
  }
  return frameImageCopy
}

/**
 * get correct lastFrameSnapshot
 */
export function getLastFrameSnapshot (gifData: GifData, frameIndex: number): undefined | ImageData {
  // first frame, dont need lastFrameSnapshot
  if (frameIndex <= 0) return undefined
  const lastFrame = gifData.frames[frameIndex - 1]
  // no specified disposal method
  if (lastFrame.disposalMethod === 0) {
    return undefined
  }
  // set the area of image to background color
  if (lastFrame.disposalMethod === 2) {
    // background color
    const bgColor = gifData.header.gctFlag
      ? [...gifData.header.gctList[gifData.header.bgIndex], 255]
      : [...defaultBgColor]

    let lastCanvasImageData = lastFrame.canvasImageData
    if (!lastCanvasImageData) {
      lastCanvasImageData = generateFullCanvasImageData(gifData, frameIndex - 1)
    }
    const tempImageData = new ImageData(lastCanvasImageData.width, lastCanvasImageData.height)
    // copy data--new ImageData(data, width, height) will not copy data
    tempImageData.data.set(lastCanvasImageData.data)

    for (let y = lastFrame.top; y < lastFrame.top + lastFrame.height; y++) {
      for (let x = lastFrame.left; x < lastFrame.left + lastFrame.width; x++) {
        const idx = (y * gifData.header.width + x) << 2
        tempImageData.data[idx] = bgColor[0]
        tempImageData.data[idx + 1] = bgColor[1]
        tempImageData.data[idx + 2] = bgColor[2]
        tempImageData.data[idx + 3] = bgColor[3]
      }
    }
    return tempImageData
  }
  // use last frame as background
  if ([1].includes(lastFrame.disposalMethod)) {
    if (lastFrame.canvasImageData) return lastFrame.canvasImageData
    return generateFullCanvasImageData(gifData, frameIndex - 1)
  }
  // drop last frame, use last 2 frame
  if (lastFrame.disposalMethod === 3) {
    return getLastFrameSnapshot(gifData, frameIndex - 1)
  }
  return undefined
}

/**
 * render frame image data to canvas
 */
export function render (
  ctx: CanvasRenderingContext2D,
  offscreenCtx: CanvasRenderingContext2D,
  gifData: GifData,
  frameIndex: number,
  beforeDraw?: AnyFuncType
) {
  let currentFrameImage = generateFullCanvasImageData(gifData, frameIndex)
  // if beforeDraw is Function, call it
  if (isFunc(beforeDraw)) {
    let tempFrameImage = new ImageData(currentFrameImage.width, currentFrameImage.height)
    tempFrameImage.data.set(currentFrameImage.data)
    tempFrameImage = (beforeDraw as AnyFuncType)(tempFrameImage)
    currentFrameImage = tempFrameImage
  }
  offscreenCtx.putImageData(currentFrameImage, 0, 0)
  // drawImage can scale image, but doesn't support ImageData, so we use offscreen canvas
  ctx.drawImage(
    offscreenCtx.canvas,
    0,
    0,
    currentFrameImage.width,
    currentFrameImage.height,
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  )
  return currentFrameImage
}
