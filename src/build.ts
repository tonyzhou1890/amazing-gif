import {
  ToBuildDataType,
  ToBuildFrameDataType,
  GifData,
  ColorTableAndFramesType,
  GifFrameData,
} from './types'
import worker from './utils/promiseWorker'
import { getMaxImageSize, parseColorStr /* reorderIndices */ } from './utils/image'
import { getBitsByNum } from './utils/helpers'
import encode from './encode'

/**
 * build imageDatas to gif
 */
export default async function build (data: ToBuildDataType) {
  data = Object.assign(
    {
      repetition: 0,
      dithering: true,
    },
    data
  )

  const gifData: GifData = {
    header: {
      type: 'GIF',
      isGif: true,
      version: '89a',
      width: 0,
      height: 0,
      gctFlag: true,
      cr: 7,
      sortFlag: false,
      gctSize: 0,
      gctStartByte: 0,
      gctEndByte: 0,
      bgIndex: 0,
      pixelAspect: 0,
      gctList: [],
    },
    appExt: {
      appName: 'NETSCAPE',
      blockIdx: 1,
      startByte: 0,
      endByte: 0,
      verification: '2.0',
      repetitionTimes: 0,
    },
    frames: [],
  }

  // global transparant color indix
  let transparantColorIdx = 0

  // split frames into two groups--1. global color table, 2. local color table
  const frameGroups: Array<Array<{ frameIdx: number; frameData: ToBuildFrameDataType }>> = [[]]

  data.frames.map((frame, idx) => {
    if (frame.setLocalColorTable) {
      frameGroups.push([
        {
          frameIdx: idx,
          frameData: frame,
        },
      ])
    } else {
      frameGroups[0].push({
        frameIdx: idx,
        frameData: frame,
      })
    }
  })

  const quantizedFrames = await Promise.all(
    frameGroups.map(g => {
      return worker({
        action: 'colorTransform',
        param: [g.map(frame => frame.frameData), data.dithering],
      }) as Promise<ColorTableAndFramesType>
    })
  )

  console.log('quantizedFrames: ', quantizedFrames)

  frameGroups.map((g, gIdx) => {
    g.map((frame, fIdx) => {
      gifData.frames[frame.frameIdx] = {} as GifFrameData
      gifData.frames[frame.frameIdx].imageData = quantizedFrames[gIdx].frames[fIdx].indices
      // global color table frames
      if (gIdx === 0) {
        gifData.header.gctList = quantizedFrames[gIdx].colorTable
      } else {
        gifData.frames[frame.frameIdx].lctList = quantizedFrames[gIdx].colorTable
      }
    })
  })

  // header set
  // size
  const imageSize = getMaxImageSize(...data.frames.map(item => item.imageData))
  gifData.header.width = imageSize.x
  gifData.header.height = imageSize.y
  // color table pad
  let bgColor = [0, 0, 0]
  if (data.backgroundColor) {
    bgColor = parseColorStr(data.backgroundColor)
  }
  transparantColorIdx = gifData.header.gctList.length - 1
  gifData.header.bgIndex = gifData.header.gctList.length
  gifData.header.gctList.push([bgColor[0], bgColor[1], bgColor[2]])
  gifData.header.gctList = padColorTable(gifData.header.gctList)
  gifData.header.gctSize = gifData.header.gctList.length
  // app ext
  if (gifData.appExt && typeof data.repetition === 'number') {
    gifData.appExt.repetitionTimes = data.repetition
  }
  // frames
  gifData.frames.forEach((frame, idx) => {
    const cnf = data.frames[idx]
    frame.startByte = 0
    frame.endByte = 0
    frame.width = cnf.imageData.width
    frame.height = cnf.imageData.height
    frame.left = ((gifData.header.width - frame.width) / 2) >> 0
    frame.top = ((gifData.header.height - frame.height) / 2) >> 0
    frame.disposalMethod = cnf.disposalMethod || 1
    frame.userInputFlag = false
    frame.transColorFlag = true
    frame.delay = cnf.delay ?? 10
    frame.lctList = frame.lctList || []
    frame.lctFlag = !!frame.lctList.length
    frame.interlace = false
    frame.sortFlag = false
    frame.transColorIdx = frame.lctFlag ? frame.lctList.length - 1 : transparantColorIdx
    frame.lctList = frame.lctFlag ? padColorTable(frame.lctList) : []
    frame.lctSize = frame.lctList.length
    frame.codeSize = getBitsByNum(frame.lctSize)
    frame.imageStartByte = 0
    frame.imageEndByte = 0
  })

  // set transparant color
  let copyGifData: GifData | undefined

  if (data.optimizeFrames) {
    copyGifData = (await worker({
      action: 'replaceRepeatedIndices',
      param: [gifData],
    })) as GifData
  }

  // make nosense
  // reorderIndices(gifData)
  // reorderIndices(copyGifData)

  return new Promise((resolve: (data: Uint8Array) => void) => {
    Promise.all(
      [encode(gifData), copyGifData ? encode(copyGifData) : undefined].filter(v => v)
    ).then(res => {
      const e1 = res[0]
      const e2 = res[1]
      if (e2 && e1!.length > e2.length) {
        resolve(e2)
      } else {
        resolve(e1!)
      }
    })
  })
  // encode
  // return encode(gifData)
}

/**
 * pad color table
 */
function padColorTable (list: Array<Array<number>>): Array<Array<number>> {
  let bits = getBitsByNum(list.length)
  if (bits < 4) {
    bits = 4
  }
  const size = Math.pow(2, bits)
  for (let i = 0; i < size; i++) {
    if (!list[i]) {
      list[i] = [0, 0, 0]
    }
  }
  return list
}
