import { ReadCtrlType, GifHeaderInfo, GifFrameData, GifData } from "./types";
import { errMsgs, isFunc } from "./helpers";
import { GifLZW } from "./lzw";

/**
 * parse gif buffer
 * @param gifBuffer 
 * @param errorCallback 
 */
export default function parser(gifBuffer: ArrayBuffer, errorCallback: Function) {
  if (!(gifBuffer instanceof ArrayBuffer)) {
    if (isFunc(errorCallback)) {
      return errorCallback(errMsgs.gifDataTypeError, 'onDataError')
    } else {
      throw new Error(errMsgs.gifDataTypeError)
    }
  }

  // read gifBuffer as Uint8Array
  const buf = new Uint8Array(gifBuffer)
  // control steps of processing.
  const readCtrl = {
    // current byte index
    ptr: 0
  }
  const gifData: GifData = {
    header: {
      type: '',
      isGif: false,
      version: '',
      width: 0,
      height: 0,
      gctFlag: false,
      cr: 0,
      sortFlag: false,
      gctSize: 0,
      gctStartByte: 0,
      gctEndByte: 0,
      bgIndex: 0,
      pixelAspect: 0,
      gctList: []
    },
    frames: []
  }
  while (readCtrl.ptr < buf.length) {
    if (readCtrl.ptr === 0) {
      // read header
      const header = readHeader(buf, readCtrl)
      if (!header.isGif) {
        return errorCallback(errMsgs.notGif, 'onDataError')
      }
      Object.assign(gifData.header, header)
    } else if (readCtrl.ptr === 6) {
      // read logical screen descriptor
      const LSD = readLSD(buf, readCtrl)
      Object.assign(gifData.header, LSD)
      // global color table list
      const gctList = LSD.gctFlag ? (++readCtrl.ptr, readGCT(buf, LSD.gctSize, readCtrl)) : []
      gifData.header.gctList = gctList
    } else if ( // extention flag is 0x21, application flag is 0xff
      (readCtrl.ptr + 1 < buf.length) &&
      buf[readCtrl.ptr] === 0x21 &&
      buf[readCtrl.ptr + 1] === 0xff &&
      !gifData.appExt // 0x21 0xff will matched times
    ) {
      const appExt = readAppExt(buf, readCtrl)
      gifData.appExt = appExt
    } else if ( // Graphic Control Extension
      readCtrl.ptr + 1 < buf.length &&
      buf[readCtrl.ptr] === 0x21 &&
      buf[readCtrl.ptr + 1] === 0xf9
    ) {
      gifData.frames.push(readFrame(buf, readCtrl))
    } else if (buf[readCtrl.ptr] === 0x2c) { // Image Descriptor
      let frame = readFrame(buf, readCtrl)
      // Graphic Control Extension may not be followed by Image Descriptor, i.e. last frame may not contain real image data
      const lastFrame = gifData.frames[gifData.frames.length - 1]
      if (!lastFrame.endByte) {
        frame.startByte = lastFrame.startByte
        frame.disposalMethod = lastFrame.disposalMethod
        frame.userInputFlag = lastFrame.userInputFlag
        frame.transColorFlag = lastFrame.transColorFlag
        frame.delay = lastFrame.delay
        frame.transColorIdx = lastFrame.transColorIdx
        gifData.frames[gifData.frames.length - 1] = frame
      } else {
        gifData.frames.push(frame)
      }
    } else if ( // Plain Text Extension
      readCtrl.ptr + 1 < buf.length &&
      buf[readCtrl.ptr] === 0x21 &&
      buf[readCtrl.ptr + 1] === 0x01
    ) {
      gifData.frames.push(readFrame(buf, readCtrl))
    } else if (buf[readCtrl.ptr] === 0x3b) { // file end
      break
    }
    // if (gifData.frames.length >= 2) break
    readCtrl.ptr++
  }
  console.log(gifData)
  return gifData
}

/**
 * read gif header info
 * the first 6 bytes of gif file indicates file type and gif
 * version. e.g. GIF89a
 * @param buf 
 */
function readHeader(buf: Uint8Array, readCtrl: ReadCtrlType) {
  const info = {
    type: '',
    isGif: false,
    version: ''
  }
  // file type
  for (let i = 0; i < 3; i++) {
    info.type += String.fromCharCode(buf[i])
  }
  info.isGif = info.type === 'GIF'
  if (!info.isGif) return info
  // gif version
  for (let i = 3; i < 6; i++) {
    info.version += String.fromCharCode(buf[i])
  }
  // set ptr with header end index
  readCtrl.ptr = 5
  return info
}

/**
 * readLSD
 * 7 ~ 13 bytes is logical screen descriptor which contains width, height and others
 */
function readLSD(buf: Uint8Array, readCtrl: ReadCtrlType) {
  const info = {
    width: 0,
    height: 0,
    gctFlag: false,
    cr: 0,
    sortFlag: false,
    gctSize: 0,
    gctStartByte: 0,
    gctEndByte: 0,
    bgIndex: 0,
    pixelAspect: 0
  }
  // image width and height--little endian
  info.width = buf[6] + (buf[7] << 8)
  info.height = buf[8] + (buf[9] << 8)
  // global color table flag.
  // the highest bit of 11th byte indicates the present of global color table
  info.gctFlag = Boolean(buf[10] >> 7)
  // color resolution. color depth is cr + 1
  // 2 ~ 4 bits represent the bits of primary color(rgb)
  // this is useless.
  // https://stackoverflow.com/questions/7128265/purpose-of-color-resolution-bits-in-a-gif
  info.cr = buf[10] & 0x70
  // sort flag, if this is 1, color table is sorted by frequncy
  // 5th bit indicates this
  // now, this is useless
  info.sortFlag = Boolean(buf[10] & 0x08)
  // global color table size, (2^n)+1
  info.gctSize = Math.pow(2, (buf[10] & 0x07) + 1)
  if (info.gctFlag) {
    info.gctStartByte = 13
    info.gctEndByte = 13 + info.gctSize * 3 - 1
  }
  // background color index
  info.bgIndex = buf[11]
  // pixel aspect ratio--now, this is useless
  info.pixelAspect = buf[12]
  readCtrl.ptr = 12
  return info
}

/**
 * readGCT
 */
function readGCT(buf: Uint8Array, gctSize: number, readCtrl: ReadCtrlType) {
  const bytes = gctSize * 3
  const start = 13
  const end = bytes + start
  const gctList = []
  for (let i = start; i < end; i += 3) {
    gctList.push([buf[i], buf[i + 1], buf[i + 2]])
  }
  readCtrl.ptr = end - 1
  return gctList
}

/**
 * read application extention
 */
function readAppExt(buf: Uint8Array, readCtrl: ReadCtrlType) {
  const info = {
    appName: '',
    repetitionTimes: 0,
    startByte: 0,
    endByte: 0
  }
  info.startByte = readCtrl.ptr
  let idx = info.startByte
  // app name and verification bytes(3 bytes)
  const blockSize = buf[idx += 2]
  idx++
  for (let i = 0; i < blockSize - 3; i++) {
    info.appName += String.fromCharCode(buf[idx + i])
  }
  idx += blockSize
  // Number of bytes in the following sub-block
  const subBlockSize = buf[idx]
  info.endByte = idx + subBlockSize
  // Unsigned number of repetitions
  info.repetitionTimes = buf[idx += 2]
  readCtrl.ptr = info.endByte
  return info
}

/**
 * read frame
 */
function readFrame(buf: Uint8Array, readCtrl: ReadCtrlType) {
  const frameData:GifFrameData = {
    startByte: readCtrl.ptr,
    endByte: 0,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    disposalMethod: 0,
    userInputFlag: false,
    transColorFlag: false,
    delay: 0,
    transColorIdx: 0,
    lctFlag: false,
    interlace: false,
    sortFlag: false,
    lctSize: 0,
    lctStartByte: 0,
    lctEndByte: 0,
    lctList: [],
    imageData: new Uint8Array(),
    imageStartByte: 0,
    imageEndByte: 0
  }
  // Graphic Control Extension
  if (buf[readCtrl.ptr] === 0x21 && buf[readCtrl.ptr + 1] === 0xf9) {
    readCtrl.ptr += 2
    const blockSize = buf[readCtrl.ptr]
    const endByte = readCtrl.ptr + blockSize + 1 // include end flag 0x00

    /**
     * https://www.linuxidc.com/Linux/2017-06/145156.htm
     * disposal method
      disposal method???3Bit???????????????0-7???

      disposal method = 1
      ?????????????????????????????????????????????????????????????????????????????????

      disposal method = 2
      ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????

      disposal method = 3
      ?????????????????????????????????????????????????????????????????????????????????

      disposal method = 4-7
      ?????????

      user input flag
      ???user input flag???1??????GIF????????????????????????????????????????????????????????????????????????????????????

      delay time
      delay time?????????????????????????????????????????????????????????????????????????????????0.01??????

      transparency color
      ????????????????????????????????????????????????1??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
      */
    readCtrl.ptr++
    // 4th ~ 6th bit
    frameData.disposalMethod = (buf[readCtrl.ptr] & 0x1c) >> 2
    // 7th bit
    frameData.userInputFlag = Boolean((buf[readCtrl.ptr] & 0x02) >> 1)
    // 8th bit
    frameData.transColorFlag = Boolean(buf[readCtrl.ptr] & 0x01)
    frameData.delay = (buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8)) * 10
    frameData.transColorIdx = buf[++readCtrl.ptr]
    if (buf[++readCtrl.ptr] !== 0x00 || readCtrl.ptr > endByte) {
      readCtrl.ptr = endByte
    }
  }
  // Image Descriptor--10 bytes
  if (buf[readCtrl.ptr] === 0x2c) {
    // first 4 bytes represent North-west corner position of image in logical screen
    frameData.left = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8)
    frameData.top = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8)
    // next 4 bytes represent width and height
    frameData.width = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8)
    frameData.height = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8)
    // local color table flag
    frameData.lctFlag = Boolean(buf[++readCtrl.ptr] & 0x80)
    // interlace flag
    frameData.interlace = Boolean(buf[readCtrl.ptr] & 0x40)
    // sort flag--useless
    frameData.sortFlag = Boolean(buf[readCtrl.ptr] & 0x20)
    // local color table size
    frameData.lctSize = Math.pow(2, (buf[readCtrl.ptr] & 0x07) + 1)
    // read local color table
    if (frameData.lctFlag) {
      frameData.lctStartByte = readCtrl.ptr + 1
      frameData.lctEndByte = readCtrl.ptr + frameData.lctSize * 3
      for (let i = frameData.lctStartByte; i < frameData.lctEndByte; i += 3) {
        frameData.lctList.push([buf[i], buf[i + 1], buf[i + 2]])
      }
      readCtrl.ptr = frameData.lctEndByte
    }
    readCtrl.ptr++
    // Table-Based Image Data
    frameData.imageStartByte = readCtrl.ptr
    let codeSize = buf[readCtrl.ptr++]
    const blocks = []
    let imageDataLength = 0
    while(buf[readCtrl.ptr] !== 0 && buf[readCtrl.ptr] !== undefined) {
      let subBlockSize = buf[readCtrl.ptr++]
      let subBlock = buf.slice(readCtrl.ptr, readCtrl.ptr + subBlockSize)
      imageDataLength += subBlock.length
      blocks.push(subBlock)
      readCtrl.ptr += subBlockSize
    }
    frameData.imageEndByte = readCtrl.ptr
    frameData.endByte = readCtrl.ptr // contain end flag
    let imageData = new Uint8Array(imageDataLength)
    for (let i = blocks.length - 1; i >= 0; i--) {
      imageData.set(blocks[i], imageDataLength -= blocks[i].length)
    }
    // console.log(imageData)
    frameData.imageData = GifLZW.decode(codeSize, imageData)
  }
  // console.log(frameData)
  return frameData
}