import { GifFrameData, GifData, GifEncodeData, GifHeaderInfo, AppExt } from './types'
import { bufferGrow, setBits, getBitsByNum } from './utils/helpers'
import worker from './utils/promiseWorker'

/**
 * encode gif data
 * @param gifData
 * @param errorCallback
 * @returns
 */
export default async function encode (gifData: GifData): Promise<Uint8Array> {
  const data = {
    buf: growGifBuffer(new Uint8Array(0)),
    ptr: 0,
  }
  // write header
  writeHeader(data, gifData.header)
  // write logical screen discriptor
  writeLSD(data, gifData.header)
  // write global color table
  gifData.header.gctFlag && writeCT(data, gifData.header.gctList)
  // write NETSCAPE application extension
  gifData.appExt && writeAppExt(data, gifData.appExt)
  // write frames
  await writeFrames(data, gifData.frames, gifData.header.gctSize)
  // write end
  if (data.ptr >= data.buf.length) {
    data.buf = growGifBuffer(data.buf)
  }
  data.buf[data.ptr] = 0x3b
  data.ptr++

  return data.buf.slice(0, data.ptr)
}

/**
 * write gif header info. just file type and gif version
 * this need 6 bytes
 * @param data
 * @param header
 */
function writeHeader (data: GifEncodeData, header: GifHeaderInfo) {
  data.buf[0] = header.type.charCodeAt(0)
  data.buf[1] = header.type.charCodeAt(1)
  data.buf[2] = header.type.charCodeAt(2)
  data.buf[3] = header.version.charCodeAt(0)
  data.buf[4] = header.version.charCodeAt(1)
  data.buf[5] = header.version.charCodeAt(2)
  data.ptr = 6
}

/**
 * writeLSD
 * 7 ~ 13 bytes is logical screen descriptor
 * @param data
 * @param header
 */
function writeLSD (data: GifEncodeData, header: GifHeaderInfo) {
  // image width and height--little endian
  data.buf[6] = header.width & 0xff
  data.buf[7] = header.width >> 8
  data.buf[8] = header.height & 0xff
  data.buf[9] = header.height >> 8
  // global color table flag--the highest bit of 11th byte
  data.buf[10] = setBits(data.buf[10], 7, 1, Number(header.gctFlag))
  // color resolution--2 ~ 4th bit
  data.buf[10] = setBits(data.buf[10], 4, 3, header.cr - 1)
  // sort flag--5th bit, if this is 1, color table is sorted by frequncy
  data.buf[10] = setBits(data.buf[10], 3, 1, Number(header.sortFlag))
  // global color table size--3 bits, getBitsByNum(size) - 1
  data.buf[10] = setBits(data.buf[10], 0, 3, getBitsByNum(header.gctSize) - 1)
  // background color index
  data.buf[11] = header.bgIndex
  // pixel aspect ratio
  data.buf[12] = header.pixelAspect

  data.ptr = 13
}

/**
 * write color table
 * @param data
 * @param ctList color table list
 */
function writeCT (data: GifEncodeData, ctList: Array<Array<number>>) {
  for (let i = 0, len = ctList.length; i < len; i++) {
    if (data.ptr + 3 >= data.buf.length) {
      data.buf = growGifBuffer(data.buf)
    }
    data.buf[data.ptr++] = ctList[i][0]
    data.buf[data.ptr++] = ctList[i][1]
    data.buf[data.ptr++] = ctList[i][2]
  }
}

/**
 * write application extension
 * @param data
 * @param appInfo
 */
function writeAppExt (data: GifEncodeData, appInfo: AppExt) {
  // for NETSCAPE extension, the number of bytes is 18
  if (data.ptr + 18 >= data.buf.length) {
    data.buf = growGifBuffer(data.buf)
  }
  // extension label
  data.buf[data.ptr++] = 0x21
  data.buf[data.ptr++] = 0xff
  // block size--app name and verification code
  data.buf[data.ptr++] = appInfo.appName.length + appInfo.verification.length
  // app name
  for (let i = 0, len = appInfo.appName.length; i < len; i++) {
    data.buf[data.ptr++] = appInfo.appName.charCodeAt(i)
  }
  // verification
  for (let i = 0, len = appInfo.verification.length; i < len; i++) {
    data.buf[data.ptr++] = appInfo.verification.charCodeAt(i)
  }
  // sub-block
  data.buf[data.ptr++] = 3
  data.buf[data.ptr++] = appInfo.blockIdx
  data.buf[data.ptr++] = appInfo.repetitionTimes & 0xff
  data.buf[data.ptr++] = appInfo.repetitionTimes >> 8
  // end
  data.buf[data.ptr++] = 0x00
}

/**
 * write frames
 * @param data
 * @param frames
 * @param gctSize global color table size
 */
async function writeFrames (data: GifEncodeData, frames: Array<GifFrameData>, gctSize: number) {
  // compress imageData in workers
  const framesMinCodeSize: Array<number> = []
  const s = window.performance.now()
  const compressedImageData = await Promise.all(
    frames.map((frame, idx) => {
      framesMinCodeSize[idx] = frame.lctFlag ? getBitsByNum(frame.lctSize) : getBitsByNum(gctSize)
      return worker({
        action: 'gifLzwEncode',
        param: [framesMinCodeSize[idx], frame.imageData],
        // there is no need of transferable in here, transferable buffer will cause detached buffer error when you call encode twice in a gifData
      })
    })
  )
  console.log('encode frames buffer: ', window.performance.now() - s)

  for (let i = 0, len = frames.length; i < len; i++) {
    const frame = frames[i]
    // write graphic control extension
    writeGCE(data, frame)
    // write image descriptor
    writeID(data, frame)
    // write local table flag
    frame.lctFlag && writeCT(data, frame.lctList)
    // write image data
    const compressedBuf = compressedImageData[i] as Uint8Array

    // console.log(i, compressedBuf)

    const subBlockSize = compressedBuf.length + Math.ceil(compressedBuf.length / 255)

    while (data.ptr + 1 + subBlockSize >= data.buf.length) {
      data.buf = growGifBuffer(data.buf)
    }

    data.buf[data.ptr++] = framesMinCodeSize[i]

    let bolckSizeIdx = data.ptr
    for (let i = 0, len = compressedBuf.length; i < len; i++) {
      if (bolckSizeIdx === data.ptr) {
        data.ptr++
      }
      data.buf[data.ptr] = compressedBuf[i]
      if (data.ptr - bolckSizeIdx === 255 || i + 1 === len) {
        data.buf[bolckSizeIdx] = data.ptr - bolckSizeIdx
        bolckSizeIdx = data.ptr + 1
      }
      data.ptr++
    }

    data.buf[data.ptr++] = 0x0
  }
}

/**
 * write graphic control extension
 * @param data
 * @param frame
 */
function writeGCE (data: GifEncodeData, frame: GifFrameData) {
  // number of bytes in GCE
  if (data.ptr + 8 >= data.buf.length) {
    data.buf = growGifBuffer(data.buf)
  }
  // extension label
  data.buf[data.ptr++] = 0x21
  data.buf[data.ptr++] = 0xf9
  // block size
  data.buf[data.ptr++] = 4
  // disposal method
  data.buf[data.ptr] = setBits(data.buf[data.ptr], 2, 3, frame.disposalMethod)
  // user input flag
  data.buf[data.ptr] = setBits(data.buf[data.ptr], 1, 1, Number(frame.userInputFlag))
  // transparent color flag
  data.buf[data.ptr] = setBits(data.buf[data.ptr], 0, 1, Number(frame.transColorFlag))
  // delay
  data.ptr++

  data.buf[data.ptr++] = (frame.delay / 10) & 0xff
  data.buf[data.ptr++] = (frame.delay / 10) >> 8
  // transparent color index
  data.buf[data.ptr++] = frame.transColorIdx

  data.buf[data.ptr++] = 0x00
}

/**
 * write image descriptor
 * @param data
 * @param frame
 */
function writeID (data: GifEncodeData, frame: GifFrameData) {
  // number of bytes in this block
  if (data.ptr + 10 >= data.buf.length) {
    data.buf = growGifBuffer(data.buf)
  }
  // label
  data.buf[data.ptr++] = 0x2c
  // left-top coordinates
  data.buf[data.ptr++] = frame.left & 0xff
  data.buf[data.ptr++] = frame.left >> 8
  data.buf[data.ptr++] = frame.top & 0xff
  data.buf[data.ptr++] = frame.top >> 8
  // width and height
  data.buf[data.ptr++] = frame.width & 0xff
  data.buf[data.ptr++] = frame.width >> 8
  data.buf[data.ptr++] = frame.height & 0xff
  data.buf[data.ptr++] = frame.height >> 8
  // local color table flag
  data.buf[data.ptr] = setBits(data.buf[data.ptr], 7, 1, Number(frame.lctFlag))
  // interlace flag
  data.buf[data.ptr] = setBits(data.buf[data.ptr], 6, 1, Number(frame.interlace))
  // sort flag
  data.buf[data.ptr] = setBits(data.buf[data.ptr], 2, 1, Number(frame.sortFlag))
  // local color table size
  data.buf[data.ptr] = setBits(data.buf[data.ptr], 0, 3, getBitsByNum(frame.lctSize) - 1)
  data.ptr++
}

/**
 * grow gif buffer
 * @param buf
 * @returns
 */
function growGifBuffer (buf: Uint8Array): Uint8Array {
  return bufferGrow(buf, 1024 * 1024) as Uint8Array
}
