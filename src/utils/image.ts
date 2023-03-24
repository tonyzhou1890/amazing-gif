import { ColorTableAndFramesType, Point, ToBuildFrameDataType, GifData } from '../types'
import Quantizer from './octreeColorQuantization'

/**
 * get pixel by point——x: col, y: row
 */
export function getPixelByPoint (imgData: ImageData, x: number, y: number): Uint8ClampedArray {
  const idx = (imgData.width * y + x) * 4
  return imgData.data.slice(idx, idx + 4)
}

/**
 * get max width and max height
 */
export function getMaxImageSize (...args: Array<ImageData>): Point {
  return {
    x: Math.max(...args.map(item => item.width)),
    y: Math.max(...args.map(item => item.height)),
  }
}

/**
 * copy image
 */
export function imageCopy (
  source: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): ImageData {
  width = Math.min(x + width, source.width) - x
  height = Math.min(y + height, source.height) - y

  if (x === 0 && width === source.width) {
    const idx = (y * source.width + x) * 4
    return new ImageData(source.data.slice(idx, idx + width * height * 4), width, height)
  } else {
    const data = new ImageData(width, height)
    for (let i = 0; i < height; i++) {
      data.data.set(
        source.data.slice(
          ((i + y) * source.width + x) * 4,
          ((i + y) * source.width + x + width) * 4
        ),
        width * i * 4
      )
    }
    return data
  }
}

/**
 * paste image
 */
export function imagePaste (source: ImageData, target: ImageData, x: number, y: number): ImageData {
  const width = Math.min(target.width, source.width + x) - x
  const height = Math.min(target.height, source.height + y) - y

  for (let i = 0; i < height; i++) {
    target.data.set(
      source.data.slice(i * source.width * 4, (i * source.width + width) * 4),
      (i * target.width + x) * 4
    )
  }

  return target
}

/**
 * adjust rgb channel value
 */
export function adjustRGBChannel (val: number): number {
  return typeof val === 'number' ? Math.max(0, Math.min(val, 255)) : 0
}

/**
 * colorStr to rgba array
 * from zrender
 */
export function parseColorStr (colorStr: string): Array<number> {
  const data = new Array(4).fill(0)
  data[3] = 1
  const str = colorStr.replace(/ /g, '')

  if (str) {
    if (str.startsWith('#')) {
      const iv = parseInt(str.substring(1), 16)
      if (str.length === 4) {
        if (!(iv >= 0 && iv <= 0xfff)) {
          return data
        }
        data[0] = ((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8)
        data[1] = (iv & 0xf0) | ((iv & 0xf0) >> 4)
        data[2] = (iv & 0xf) | ((iv & 0xf) << 4)
      } else if (str.length === 7) {
        if (!(iv >= 0 && iv <= 0xffffff)) {
          return data
        }
        data[0] = (iv & 0xff0000) >> 16
        data[1] = (iv & 0xff00) >> 8
        data[2] = iv & 0xff
      }
    } else {
      const op = str.indexOf('(')
      const ep = str.indexOf(')')
      if (op !== -1 && ep + 1 === str.length) {
        const fname = str.substring(0, op)
        const params = str.substring(op + 1, ep).split(',')
        let alpha = 1 // To allow case fallthrough.
        switch (fname) {
          case 'rgba':
            if (params.length === 4) {
              alpha = parseFloat(params.pop() as string) * 255
              alpha = adjustRGBChannel(alpha)
              data[3] = alpha
            }
          // Fall through.
          case 'rgb':
            if (params.length === 3) {
              data[0] = adjustRGBChannel(parseInt(params[0]))
              data[1] = adjustRGBChannel(parseInt(params[1]))
              data[2] = adjustRGBChannel(parseInt(params[2]))
            }
            break
        }
      }
    }
  }

  return data
}

/**
 * rgba2rgb
 */
export function rgba2rgb (
  color: Array<number> | Uint8ClampedArray,
  start = 0
): Array<number> | Uint8ClampedArray {
  if (color.length >= start + 4 && color[start + 3] > 0 && color[start + 3] < 255) {
    const alpha = color[start + 3] / 255
    color[start] = (color[start] * alpha) >> 0
    color[start + 1] = (color[start + 1] * alpha) >> 0
    color[start + 2] = (color[start + 2] * alpha) >> 0
    color[start + 3] = 255
  }
  return color
}

/**
 * color transform to indices
 */
export function colorTransform (frames: Array<ToBuildFrameDataType>): ColorTableAndFramesType {
  const data: ColorTableAndFramesType = {
    colorTable: [],
    frames: [],
  }

  if (!frames.length) {
    return data
  }

  const colorCache = new Map()
  const indicesCache = new Map()

  const quantizer = new Quantizer()

  let transparantColor = null
  let transparantColorIdx = -1

  // quantize
  for (let i = 0, len = frames.length; i < len; i++) {
    const imageData = frames[i].imageData

    for (let j = 0, len2 = imageData.width * imageData.height * 4; j < len2; j += 4) {
      // set transparant color
      if (imageData.data[j + 3] === 0) {
        if (transparantColor === null) {
          transparantColor = [imageData.data[j], imageData.data[j + 1], imageData.data[j + 2], 0]
        }
      } else {
        // rgba to rgb, change value in place
        rgba2rgb(imageData.data, j)
      }

      quantizer.addColor(imageData.data[j], imageData.data[j + 1], imageData.data[j + 2])
    }
  }

  console.log(quantizer)

  transparantColorIdx = quantizer.colorCount

  // set color and indices
  for (let i = 0, len = frames.length; i < len; i++) {
    const imageData = frames[i].imageData
    const indices = new Uint8Array(imageData.width * imageData.height)

    for (let j = 0, p = 0, len2 = imageData.width * imageData.height * 4; j < len2; j += 4, p++) {
      if (imageData.data[j + 3] !== 0) {
        let newColor = null
        let newColorKey = ''
        const key = [imageData.data[j], imageData.data[j + 1], imageData.data[j + 2]].join()

        if (colorCache.has(key)) {
          newColor = colorCache.get(key)
        } else {
          newColor = quantizer.getColor(
            imageData.data[j],
            imageData.data[j + 1],
            imageData.data[j + 2]
          )
          colorCache.set(key, newColor)

          // fill color table
          newColorKey = newColor.join()
          if (!indicesCache.has(newColorKey)) {
            indicesCache.set(newColorKey, data.colorTable.length)
            data.colorTable.push([newColor[0], newColor[1], newColor[2]])
          }
        }

        imageData.data[j] = newColor[0]
        imageData.data[j + 1] = newColor[1]
        imageData.data[j + 2] = newColor[2]

        indices[p] = indicesCache.get(newColorKey)
      } else {
        indices[p] = transparantColorIdx
      }
    }

    data.frames.push({
      imageData,
      indices,
    })
  }

  // push transparent color to color table
  console.log(data)
  transparantColor = transparantColor || data.colorTable[data.colorTable.length - 1]
  data.colorTable.push([transparantColor[0], transparantColor[1], transparantColor[1]])

  return data
}

/**
 * replace same indices in adjacent images to transparant indices
 */
export function replaceRepetedIndices (gifData: GifData) {
  console.log(gifData)
}
