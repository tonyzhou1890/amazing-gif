import { isFunc } from "./helpers";
import { Config, GifData, GifFrameData } from "./types";

/**
 * generate ImageData for canvas
 */
export function generateImageData(gifData: GifData, frameInfo: GifFrameData, lastFrameSnapshot?: ImageData): ImageData {
  // check cache
  if (frameInfo.canvasImageData instanceof ImageData) {
    return frameInfo.canvasImageData
  }
  // color table
  const colorTable = frameInfo.lctFlag ? frameInfo.lctList : gifData.header.gctList
  // background color
  const bgColor = gifData.header.gctFlag ? [...gifData.header.gctList[gifData.header.bgIndex], 255] : null
  // width and height
  const width = gifData.header.width
  const height = gifData.header.height
  // if lastFrameSnapshot doesn't exist, then we will create it
  if (!lastFrameSnapshot) {
    const buf = new Uint8ClampedArray(width * height * 4)
    const tempBgColor = bgColor || [0, 0, 0, 255]
    for (let i = 0, len = width * height; i < len; i += 4) {
      buf[i] = tempBgColor[0]
      buf[i + 1] = tempBgColor[1]
      buf[i + 2] = tempBgColor[2]
      buf[i + 2] = tempBgColor[3]
    }
    lastFrameSnapshot = new ImageData(buf, width, height)
  }
  // avoid affect raw data
  const frameImageCopy = new Uint8Array(frameInfo.imageData.length)
  // interlace
  if (frameInfo.interlace) {
    let rowIdx = 0
    let idx = 0
    function rowCopy() {
      for (let i = 0; i < frameInfo.width; i++) {
        frameImageCopy[idx] = frameInfo.imageData[rowIdx * frameInfo.width + i]
        idx++
      }
    }
    // pass 1: row 0, row 8, row 16……
    while (rowIdx < frameInfo.height) {
      rowCopy()
      rowIdx += 8
    }
    // pass 2: row 4, row 12, row 20……
    rowIdx = 4
    while (rowIdx < frameInfo.height) {
      rowCopy()
      rowIdx += 8
    }
    // pass 3: row 2, row 6, row 10……
    rowIdx = 2
    while (rowIdx < frameInfo.height) {
      rowCopy()
      rowIdx += 4
    }
    // pass 4: row 1, row 3, row 5……
    rowIdx = 1
    while (rowIdx < frameInfo.height) {
      rowCopy()
      rowIdx += 2
    }
  } else {
    frameImageCopy.set(frameInfo.imageData)
  }
  // fill color
  const frameImageData = new Uint8ClampedArray(width * height * 4)
  for (let i = 0, len = width * height; i < len; i++) {
    let x = i % width
    let y = (i / width) >> 0
    // first primary color index
    let pci = i * 4
    // whether current pixel in current frame image
    if (
      x >= frameInfo.left &&
      x < (frameInfo.left + frameInfo.width) &&
      y >= frameInfo.top &&
      y < (frameInfo.top + frameInfo.height)
    ) {
      // frameImageCopy index
      const ficidx = x - frameInfo.left + (y - frameInfo.top) * frameInfo.width
      // if this pixel is transparent, pixel will be filled width the color of previous frame at the same position
      if (frameInfo.transColorFlag && frameImageCopy[ficidx] === frameInfo.transColorIdx) {
        frameImageData[pci] = lastFrameSnapshot.data[pci]
        frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1]
        frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2]
        frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3]
      } else {
        const color = colorTable[frameImageCopy[ficidx]]
        frameImageData[pci] = color[0]
        frameImageData[pci + 1] = color[0 + 1]
        frameImageData[pci + 2] = color[0 + 2]
        frameImageData[pci + 3] = 255
      }
    } else {
      frameImageData[pci] = lastFrameSnapshot.data[pci]
      frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1]
      frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2]
      frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3]
    }
  }
  const frameImage = new ImageData(frameImageData, width, height)
  // cache
  frameInfo.canvasImageData = frameImage
  return frameImage
}

/**
 * get correct lastFrameSnapshot
 */
export function getLastFrameSnapshot(gifData: GifData, frameIndex: number): undefined | ImageData {
  // first frame, dont need lastFrameSnapshot
  if (frameIndex <= 0) return undefined
  const lastFrame = gifData.frames[frameIndex - 1]
  // no dependency
  if (lastFrame.disposalMethod === 0 || lastFrame.disposalMethod === 2) {
    return undefined
  }
  // use last frame as background
  if ([1].includes(lastFrame.disposalMethod)) {
    if (lastFrame.canvasImageData) return lastFrame.canvasImageData
    return generateImageData(gifData, lastFrame, getLastFrameSnapshot(gifData, frameIndex - 1))
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
export function render(ctx: CanvasRenderingContext2D, offscreenCtx: CanvasRenderingContext2D, gifData: GifData, frameIndex: number, beforeDraw?: Function) {
  // current frame info
  const frameInfo = gifData.frames[frameIndex]
  // get last frame snapshot
  let lastFrameSnapshot = getLastFrameSnapshot(gifData, frameIndex)
  let currentFrameImage = generateImageData(gifData, frameInfo, lastFrameSnapshot)
  // if beforeDraw is Function, call it
  if (isFunc(beforeDraw)) {
    let tempFrameImage = new ImageData(currentFrameImage.width, currentFrameImage.height)
    tempFrameImage.data.set(currentFrameImage.data)
    tempFrameImage = (beforeDraw as Function)(tempFrameImage)
    currentFrameImage = tempFrameImage
  }
  offscreenCtx.putImageData(currentFrameImage, 0, 0)
  // drawImage can scale image, but doesn't support ImageData, so we use offscreen canvas
  ctx.drawImage(offscreenCtx.canvas, 0, 0, currentFrameImage.width, currentFrameImage.height, 0, 0, ctx.canvas.width, ctx.canvas.height)
  return currentFrameImage
}
