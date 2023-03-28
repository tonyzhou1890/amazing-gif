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
 * get index by point
 */
export function getIndexByPoint (imgData: ImageData, x: number, y: number): number {
  return (y * imgData.width + x) * 4
}

/**
 * get point by index
 */
export function getPointByIndex (imgData: ImageData, index: number): Point {
  return {
    x: (index / 4) % imgData.width,
    y: (index / 4) >> 0,
  }
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
export function colorTransform (
  frames: Array<ToBuildFrameDataType>,
  dithering = false
): ColorTableAndFramesType {
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
    const imageData = new ImageData(frames[i].imageData.width, frames[i].imageData.height)
    imageData.data.set(frames[i].imageData.data)
    // const imageData = frames[i].imageData
    const indices = new Uint8Array(imageData.width * imageData.height)

    for (let j = 0, p = 0, len2 = imageData.width * imageData.height * 4; j < len2; j += 4, p++) {
      if (imageData.data[j + 3] !== 0) {
        let newColor = null
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
          if (!indicesCache.has(newColor.join())) {
            indicesCache.set(newColor.join(), data.colorTable.length)
            data.colorTable.push([newColor[0], newColor[1], newColor[2]])
          }
        }

        imageData.data[j] = newColor[0]
        imageData.data[j + 1] = newColor[1]
        imageData.data[j + 2] = newColor[2]

        indices[p] = indicesCache.get(newColor.join())
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

  if (dithering) {
    imageDithering(frames, data, indicesCache)
    // return colorTransform(frames.map((item, idx) => {
    //   return {
    //     ...item,
    //     imageData: data.frames[idx].imageData
    //   }
    // }),)
  }

  return data
}

/**
 * dithering
 * error diffusion matrix:
 *   [     ,    *, 7/16 ]
 *   [ 3/16, 5/16, 1/16 ]
 */
export function imageDithering (
  frames: Array<ToBuildFrameDataType>,
  data: ColorTableAndFramesType,
  indicesCache: Map<any, any>
): ColorTableAndFramesType {
  const matrix = [
    [1, 0, 7 / 16],
    [-1, 1, 3 / 16],
    [0, 1, 5 / 16],
    [1, 1, 1 / 16],
  ]

  const colorCache = new Map()

  // frame
  for (let i = 0, len = frames.length; i < len; i++) {
    const rawImageData = frames[i].imageData
    const imageData = data.frames[i].imageData
    const copyImageData = new ImageData(imageData.width, imageData.height)
    copyImageData.data.set(imageData.data)
    const indices = data.frames[i].indices

    // pixel
    for (let j = 0, len2 = rawImageData.width * rawImageData.height * 4; j < len2; j += 4) {
      // skip transparant pixel
      if (imageData.data[j + 3] === 0) {
        continue
      }
      const p1 = getPointByIndex(rawImageData, j)

      // position offset
      for (let k = 0; k < 4; k++) {
        const c = matrix[k]
        const p2 = {
          x: p1.x + c[0],
          y: p1.y + c[1],
        }

        if (p2.x >= 0 && p2.x < rawImageData.width && p2.y >= 0 && p2.y < rawImageData.height) {
          const index = getIndexByPoint(rawImageData, p2.x, p2.y)

          // skip transparant pixel
          if (imageData.data[index + 3] === 0) {
            continue
          }

          // channel
          for (let l = 0; l < 3; l++) {
            // const diff = rawImageData.data[j + l] - copyImageData.data[j + l]
            const diff = rawImageData.data[j + l] - imageData.data[j + l]
            imageData.data[index + l] += diff * c[2]
          }
        }
      }

      // set new color and index
      const color = [imageData.data[j], imageData.data[j + 1], imageData.data[j + 2]]
      const newColor = getClosestColor(color, data.colorTable, colorCache)
      imageData.data[j] = newColor[0]
      imageData.data[j + 1] = newColor[1]
      imageData.data[j + 2] = newColor[2]
      indices[(j / 4) >> 0] = indicesCache.get(newColor.join())
    }
    const temp = new ImageData(imageData.width, imageData.height)
    temp.data.set(imageData.data)
    // console.log(temp.data, indices, indicesCache)
  }

  return data
}

/**
 * get closest color
 */
export function getClosestColor (
  color: Array<number>,
  colorTable: Array<Array<number>>,
  colorCache: Map<any, any>
): Array<number> {
  const key = color.join()
  if (colorCache.has(key)) {
    return colorCache.get(key)
  } else {
    let res = [] as Array<number>
    let distance = Infinity
    let index = -1
    for (let i = 0, len = colorTable.length; i < len; i++) {
      // https://www.cnblogs.com/wxl845235800/p/11085802.html
      // current color
      const cc = colorTable[i]
      const r = (color[0] + cc[0]) / 2
      const deltaR = color[0] - cc[0]
      const deltaG = color[1] - cc[1]
      const deltaB = color[2] - cc[2]
      const deltaC = Math.sqrt(
        (2 + r / 256) * deltaR * deltaR +
          4 * deltaG * deltaG +
          (2 + (255 - r) / 256) * deltaB * deltaB
      )

      if (deltaC < distance) {
        distance = deltaC
        index = i
        if (distance < 1) {
          break
        }
      }
    }
    res = [...colorTable[index], 1]
    colorCache.set(key, res)
    return res
  }
}

/**
 * replace same indices in adjacent images to transparant indices
 */
export function replaceRepetedIndices (gifData: GifData): GifData {
  // if some frames have local color table, skip all
  if (gifData.frames.some(frame => frame.lctFlag)) {
    return gifData
  }

  const bgIndex = gifData.header.bgIndex
  const width = gifData.header.width
  const height = gifData.header.height
  let lastFullIndices = new Uint8Array(width * height).fill(bgIndex)

  for (let i = 0, len = gifData.frames.length; i < len; i++) {
    const frame = gifData.frames[i]
    const snapshot = new Uint8Array(lastFullIndices)

    for (let j = 0, len2 = snapshot.length; j < len2; j++) {
      const x = j % width
      const y = (j / width) >> 0

      if (
        x >= frame.left &&
        x < frame.left + frame.width &&
        y >= frame.top &&
        y < frame.top + frame.height
      ) {
        const fIdx = (y - frame.top) * frame.width + (x - frame.left)

        // set transparant index
        if (frame.transColorFlag) {
          if (
            frame.imageData[fIdx] !== frame.transColorIdx &&
            frame.imageData[fIdx] !== bgIndex &&
            frame.imageData[fIdx] === snapshot[j]
          ) {
            frame.imageData[fIdx] = frame.transColorIdx
          }
        }

        snapshot[j] = frame.imageData[fIdx]
      }
    }

    // keep this frame image
    if ([0, 1].includes(frame.disposalMethod)) {
      lastFullIndices = snapshot
    } else if (frame.disposalMethod === 2) {
      // reset area of this frame to background color
      for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < frame.width; x++) {
          const idx = (y + frame.top) * width + x + frame.left
          snapshot[idx] = bgIndex
        }
      }
      lastFullIndices = snapshot
    }
  }
  return gifData
}
