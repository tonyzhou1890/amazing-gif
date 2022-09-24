(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.AMZGif = factory());
})(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /**
     * @module helpers
     */
    /**
     * @name isFunc
     */
    function isFunc(f) {
        return typeof f === 'function';
    }
    /**
     * isOdd
     */
    function isOdd(a) {
        return !!(a % 2);
    }
    const errMsgs = {
        notReady: '数据未就绪',
        wrongParam: '参数错误',
        noGifUrl: '未指定 gif 图片地址',
        gifEmpty: 'gif 不存在',
        gifDataTypeError: 'gif 数据类型错误',
        notGif: '文件非 gif',
        noConfigEl: '未指定 img 元素',
        noImg: '未找到 img 元素',
        notImg: (el) => `元素 ${el} 不是图片`,
        isRendering: 'isRendering',
        skinError: '皮肤出错',
        skinContainerIsSmall: '空间不足以显示皮肤'
    };
    /**
     * @name fillBoxPixels
     * fill box pixels
     */
    function fillBoxPixels(imgData, x, y, box, boxWidth, boxHeight, pixelChannel) {
        let xOver = false;
        let yOver = false;
        let xDis = 0;
        let yDis = 0;
        let boxCenter = [(boxWidth / 2) >> 0, (boxHeight / 2) >> 0];
        let pixelStartIdx = 0;
        for (let i = 0; i < boxWidth; i++) {
            for (let j = 0; j < boxHeight; j++) {
                xOver = false;
                yOver = false;
                // whether x direction overflow
                xDis = boxCenter[0] - i;
                if (xDis > 0) {
                    if (xDis > x) {
                        xOver = true;
                    }
                }
                else {
                    if (x - xDis >= imgData.width) {
                        xOver = true;
                    }
                }
                // whether y direction overflow
                yDis = boxCenter[1] - j;
                if (j < boxCenter[1]) {
                    if (yDis > y) {
                        yOver = true;
                    }
                }
                else {
                    if (y - yDis >= imgData.height) {
                        yOver = true;
                    }
                }
                // Out-of-bounds processing
                // corner
                if (xOver && yOver) {
                    // left-top corner
                    if (xDis > 0 && yDis > 0) {
                        pixelStartIdx = 0;
                    }
                    else if (xDis < 0 && yDis < 0) {
                        // right-bottom corner
                        pixelStartIdx = (imgData.width * imgData.height - 1) * 4;
                    }
                    else if (xDis > 0) {
                        // left-bottom corner
                        pixelStartIdx = imgData.width * (imgData.height - 1) * 4;
                    }
                    else {
                        // right-top corner
                        pixelStartIdx = (imgData.width - 1) * 4;
                    }
                }
                else if (xOver) {
                    // left
                    if (xDis < 0) {
                        pixelStartIdx = (y - yDis) * imgData.width * 4;
                    }
                    else {
                        // right
                        pixelStartIdx = ((y - yDis) * imgData.width - 1) * 4;
                    }
                }
                else if (yOver) {
                    // top
                    if (yDis < 0) {
                        pixelStartIdx = (x - xDis) * 4;
                    }
                    else {
                        // bottom
                        pixelStartIdx = ((imgData.height - 1) * imgData.width + x - xDis) * 4;
                    }
                }
                // common processing
                pixelStartIdx = ((y - yDis) * imgData.width + (x - xDis)) * 4;
                box[i + boxWidth * j] = imgData.data[pixelStartIdx + pixelChannel];
            }
        }
        return box;
    }

    // https://www.cnblogs.com/jiang08/articles/3171319.html
    /**
     * getBits
     * @param num 1 byte
     * @param bitIdx bit index(from right to left)
     * @param length required bits length
     */
    function getBits(num, bitIdx, length) {
        return (num >> bitIdx) & ((1 << length) - 1);
    }
    const GifLZW = {
        decode: (codeSize, buf) => {
            function genTable() {
                return new Array((2 ** codeSize) + 2).fill(0).map((_, index) => String.fromCharCode(index));
            }
            let table = genTable();
            let clearCode = 2 ** codeSize;
            let endCode = 2 ** codeSize + 1;
            let bitLength = codeSize + 1;
            let stream = '';
            let decodeStart = true;
            let byteLen = buf.length;
            let byteIdx = 0;
            let bitIdx = 0;
            let requiredBits = bitLength;
            let code = 0;
            let k = '';
            let oldCode = 0;
            while (byteIdx < byteLen) {
                requiredBits = bitLength;
                code = 0;
                // read code
                while (requiredBits !== 0) {
                    if (8 - bitIdx >= requiredBits) {
                        code += getBits(buf[byteIdx], bitIdx, requiredBits) << (bitLength - requiredBits);
                        bitIdx += requiredBits;
                        requiredBits = 0;
                    }
                    else {
                        code += getBits(buf[byteIdx], bitIdx, 8 - bitIdx) << (bitLength - requiredBits);
                        requiredBits -= (8 - bitIdx);
                        bitIdx = 8;
                    }
                    // overflow
                    if (bitIdx === 8) {
                        byteIdx++;
                        bitIdx = 0;
                    }
                }
                // console.log(bitIdx, bitLength, byteIdx, code)
                //
                if (code === endCode)
                    break;
                // code is clear code, reset table and others
                if (code === clearCode) {
                    table = genTable();
                    bitLength = codeSize + 1;
                    decodeStart = true;
                    continue;
                }
                // if code exists in table, append code to stream
                if (table[code] !== undefined) {
                    // first code
                    if (decodeStart) {
                        stream += table[code];
                        oldCode = code;
                        decodeStart = false;
                    }
                    else {
                        stream += table[code];
                        k = table[code][0];
                        table.push(table[oldCode] + k);
                        oldCode = code;
                    }
                }
                else {
                    // if not
                    // console.log(table, code, oldCode)
                    k = table[oldCode][0];
                    stream += table[oldCode] + k;
                    table.push(table[oldCode] + k);
                    oldCode = code;
                }
                // check cap of table
                if (table.length >= (2 ** bitLength)) {
                    if (bitLength < 12) {
                        bitLength++;
                    }
                }
            }
            let res = new Uint8Array(stream.length);
            for (let i = 0; i < stream.length; i++) {
                res[i] = stream.charCodeAt(i);
            }
            // console.log(res)
            return res;
        }
    };

    /**
     * parse gif buffer
     * @param gifBuffer
     * @param errorCallback
     */
    function parser(gifBuffer, errorCallback) {
        if (!(gifBuffer instanceof ArrayBuffer)) {
            if (isFunc(errorCallback)) {
                return errorCallback(errMsgs.gifDataTypeError, 'onDataError');
            }
            else {
                throw new Error(errMsgs.gifDataTypeError);
            }
        }
        // read gifBuffer as Uint8Array
        const buf = new Uint8Array(gifBuffer);
        // control steps of processing.
        const readCtrl = {
            // current byte index
            ptr: 0
        };
        const gifData = {
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
        };
        while (readCtrl.ptr < buf.length) {
            if (readCtrl.ptr === 0) {
                // read header
                const header = readHeader(buf, readCtrl);
                if (!header.isGif) {
                    return errorCallback(errMsgs.notGif, 'onDataError');
                }
                Object.assign(gifData.header, header);
            }
            else if (readCtrl.ptr === 6) {
                // read logical screen descriptor
                const LSD = readLSD(buf, readCtrl);
                Object.assign(gifData.header, LSD);
                // global color table list
                const gctList = LSD.gctFlag ? (++readCtrl.ptr, readGCT(buf, LSD.gctSize, readCtrl)) : [];
                gifData.header.gctList = gctList;
            }
            else if ( // extention flag is 0x21, application flag is 0xff
            (readCtrl.ptr + 1 < buf.length) &&
                buf[readCtrl.ptr] === 0x21 &&
                buf[readCtrl.ptr + 1] === 0xff &&
                !gifData.appExt // 0x21 0xff will matched times
            ) {
                const appExt = readAppExt(buf, readCtrl);
                gifData.appExt = appExt;
            }
            else if ( // Graphic Control Extension
            readCtrl.ptr + 1 < buf.length &&
                buf[readCtrl.ptr] === 0x21 &&
                buf[readCtrl.ptr + 1] === 0xf9) {
                gifData.frames.push(readFrame(buf, readCtrl));
            }
            else if (buf[readCtrl.ptr] === 0x2c) { // Image Descriptor
                let frame = readFrame(buf, readCtrl);
                // Graphic Control Extension may not be followed by Image Descriptor, i.e. last frame may not contain real image data
                const lastFrame = gifData.frames[gifData.frames.length - 1];
                if (!lastFrame.endByte) {
                    frame.startByte = lastFrame.startByte;
                    frame.disposalMethod = lastFrame.disposalMethod;
                    frame.userInputFlag = lastFrame.userInputFlag;
                    frame.transColorFlag = lastFrame.transColorFlag;
                    frame.delay = lastFrame.delay;
                    frame.transColorIdx = lastFrame.transColorIdx;
                    gifData.frames[gifData.frames.length - 1] = frame;
                }
                else {
                    gifData.frames.push(frame);
                }
            }
            else if ( // Plain Text Extension
            readCtrl.ptr + 1 < buf.length &&
                buf[readCtrl.ptr] === 0x21 &&
                buf[readCtrl.ptr + 1] === 0x01) {
                gifData.frames.push(readFrame(buf, readCtrl));
            }
            else if (buf[readCtrl.ptr] === 0x3b) { // file end
                break;
            }
            // if (gifData.frames.length >= 2) break
            readCtrl.ptr++;
        }
        console.log(gifData);
        return gifData;
    }
    /**
     * read gif header info
     * the first 6 bytes of gif file indicates file type and gif
     * version. e.g. GIF89a
     * @param buf
     */
    function readHeader(buf, readCtrl) {
        const info = {
            type: '',
            isGif: false,
            version: ''
        };
        // file type
        for (let i = 0; i < 3; i++) {
            info.type += String.fromCharCode(buf[i]);
        }
        info.isGif = info.type === 'GIF';
        if (!info.isGif)
            return info;
        // gif version
        for (let i = 3; i < 6; i++) {
            info.version += String.fromCharCode(buf[i]);
        }
        // set ptr with header end index
        readCtrl.ptr = 5;
        return info;
    }
    /**
     * readLSD
     * 7 ~ 13 bytes is logical screen descriptor which contains width, height and others
     */
    function readLSD(buf, readCtrl) {
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
        };
        // image width and height--little endian
        info.width = buf[6] + (buf[7] << 8);
        info.height = buf[8] + (buf[9] << 8);
        // global color table flag.
        // the highest bit of 11th byte indicates the present of global color table
        info.gctFlag = Boolean(buf[10] >> 7);
        // color resolution. color depth is cr + 1
        // 2 ~ 4 bits represent the bits of primary color(rgb)
        // this is useless.
        // https://stackoverflow.com/questions/7128265/purpose-of-color-resolution-bits-in-a-gif
        info.cr = buf[10] & 0x70;
        // sort flag, if this is 1, color table is sorted by frequncy
        // 5th bit indicates this
        // now, this is useless
        info.sortFlag = Boolean(buf[10] & 0x08);
        // global color table size, (2^n)+1
        info.gctSize = Math.pow(2, (buf[10] & 0x07) + 1);
        if (info.gctFlag) {
            info.gctStartByte = 13;
            info.gctEndByte = 13 + info.gctSize * 3 - 1;
        }
        // background color index
        info.bgIndex = buf[11];
        // pixel aspect ratio--now, this is useless
        info.pixelAspect = buf[12];
        readCtrl.ptr = 12;
        return info;
    }
    /**
     * readGCT
     */
    function readGCT(buf, gctSize, readCtrl) {
        const bytes = gctSize * 3;
        const start = 13;
        const end = bytes + start;
        const gctList = [];
        for (let i = start; i < end; i += 3) {
            gctList.push([buf[i], buf[i + 1], buf[i + 2]]);
        }
        readCtrl.ptr = end - 1;
        return gctList;
    }
    /**
     * read application extention
     */
    function readAppExt(buf, readCtrl) {
        const info = {
            appName: '',
            repetitionTimes: 0,
            startByte: 0,
            endByte: 0
        };
        info.startByte = readCtrl.ptr;
        let idx = info.startByte;
        // app name and verification bytes(3 bytes)
        const blockSize = buf[idx += 2];
        idx++;
        for (let i = 0; i < blockSize - 3; i++) {
            info.appName += String.fromCharCode(buf[idx + i]);
        }
        idx += blockSize;
        // Number of bytes in the following sub-block
        const subBlockSize = buf[idx];
        info.endByte = idx + subBlockSize;
        // Unsigned number of repetitions
        info.repetitionTimes = buf[idx += 2];
        readCtrl.ptr = info.endByte;
        return info;
    }
    /**
     * read frame
     */
    function readFrame(buf, readCtrl) {
        const frameData = {
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
        };
        // Graphic Control Extension
        if (buf[readCtrl.ptr] === 0x21 && buf[readCtrl.ptr + 1] === 0xf9) {
            readCtrl.ptr += 2;
            const blockSize = buf[readCtrl.ptr];
            const endByte = readCtrl.ptr + blockSize + 1; // include end flag 0x00
            /**
             * https://www.linuxidc.com/Linux/2017-06/145156.htm
             * disposal method
              disposal method占3Bit，能够表示0-7。
        
              disposal method = 1
              解码器不会清理画布，直接将下一幅图像渲染上一幅图像上。
        
              disposal method = 2
              解码器会以背景色清理画布，然后渲染下一幅图像。背景色在逻辑屏幕描述符中设置。
        
              disposal method = 3
              解码器会将画布设置为上之前的状态，然后渲染下一幅图像。
        
              disposal method = 4-7
              保留值
        
              user input flag
              当user input flag为1时，GIF会在有用户输入事件（鼠标、键盘）时才会过渡到下一幅图像。
        
              delay time
              delay time占两个字节，为无符号整数，控制当前帧的展示时间，单位是0.01秒。
        
              transparency color
              如果图形控制扩展的透明色标志位为1，那么解码器会通过透明色索引在颜色列表中找到改颜色，标记为透明，当渲染图像时，标记为透明色的颜色将不会绘制，显示下面的背景。
              */
            readCtrl.ptr++;
            // 4th ~ 6th bit
            frameData.disposalMethod = (buf[readCtrl.ptr] & 0x1c) >> 2;
            // 7th bit
            frameData.userInputFlag = Boolean((buf[readCtrl.ptr] & 0x02) >> 1);
            // 8th bit
            frameData.transColorFlag = Boolean(buf[readCtrl.ptr] & 0x01);
            frameData.delay = (buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8)) * 10;
            frameData.transColorIdx = buf[++readCtrl.ptr];
            if (buf[++readCtrl.ptr] !== 0x00 || readCtrl.ptr > endByte) {
                readCtrl.ptr = endByte;
            }
        }
        // Image Descriptor--10 bytes
        if (buf[readCtrl.ptr] === 0x2c) {
            // first 4 bytes represent North-west corner position of image in logical screen
            frameData.left = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8);
            frameData.top = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8);
            // next 4 bytes represent width and height
            frameData.width = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8);
            frameData.height = buf[++readCtrl.ptr] + (buf[++readCtrl.ptr] << 8);
            // local color table flag
            frameData.lctFlag = Boolean(buf[++readCtrl.ptr] & 0x80);
            // interlace flag
            frameData.interlace = Boolean(buf[readCtrl.ptr] & 0x40);
            // sort flag--useless
            frameData.sortFlag = Boolean(buf[readCtrl.ptr] & 0x20);
            // local color table size
            frameData.lctSize = Math.pow(2, (buf[readCtrl.ptr] & 0x07) + 1);
            // read local color table
            if (frameData.lctFlag) {
                frameData.lctStartByte = readCtrl.ptr + 1;
                frameData.lctEndByte = readCtrl.ptr + frameData.lctSize * 3;
                for (let i = frameData.lctStartByte; i < frameData.lctEndByte; i += 3) {
                    frameData.lctList.push([buf[i], buf[i + 1], buf[i + 2]]);
                }
                readCtrl.ptr = frameData.lctEndByte;
            }
            readCtrl.ptr++;
            // Table-Based Image Data
            frameData.imageStartByte = readCtrl.ptr;
            let codeSize = buf[readCtrl.ptr++];
            const blocks = [];
            let imageDataLength = 0;
            while (buf[readCtrl.ptr] !== 0 && buf[readCtrl.ptr] !== undefined) {
                let subBlockSize = buf[readCtrl.ptr++];
                let subBlock = buf.slice(readCtrl.ptr, readCtrl.ptr + subBlockSize);
                imageDataLength += subBlock.length;
                blocks.push(subBlock);
                readCtrl.ptr += subBlockSize;
            }
            frameData.imageEndByte = readCtrl.ptr;
            frameData.endByte = readCtrl.ptr; // contain end flag
            let imageData = new Uint8Array(imageDataLength);
            for (let i = blocks.length - 1; i >= 0; i--) {
                imageData.set(blocks[i], imageDataLength -= blocks[i].length);
            }
            // console.log(imageData)
            frameData.imageData = GifLZW.decode(codeSize, imageData);
        }
        // console.log(frameData)
        return frameData;
    }

    function rAF(callbackQueue) {
        const now = performance.now();
        let interval = 1000 / 60;
        let timer = 0;
        let last = now;
        function c(time) {
            if (interval <= time - last) {
                last = time - ((time - last) % interval);
                callbackQueue.map(callback => {
                    callback(time);
                });
            }
            timer = window.requestAnimationFrame(c);
        }
        timer = window.requestAnimationFrame(c);
        return {
            cancel() {
                if (timer) {
                    window.cancelAnimationFrame(timer);
                }
            }
        };
    }

    /**
     * generate ImageData for canvas
     */
    function generateImageData(gifData, frameInfo, lastFrameSnapshot) {
        // check cache
        if (frameInfo.canvasImageData instanceof ImageData) {
            return frameInfo.canvasImageData;
        }
        // color table
        const colorTable = frameInfo.lctFlag ? frameInfo.lctList : gifData.header.gctList;
        // background color
        const bgColor = gifData.header.gctFlag ? [...gifData.header.gctList[gifData.header.bgIndex], 255] : null;
        // width and height
        const width = gifData.header.width;
        const height = gifData.header.height;
        // if lastFrameSnapshot doesn't exist, then we will create it
        if (!lastFrameSnapshot) {
            const buf = new Uint8ClampedArray(width * height * 4);
            const tempBgColor = bgColor || [0, 0, 0, 255];
            for (let i = 0, len = width * height; i < len; i += 4) {
                buf[i] = tempBgColor[0];
                buf[i + 1] = tempBgColor[1];
                buf[i + 2] = tempBgColor[2];
                buf[i + 2] = tempBgColor[3];
            }
            lastFrameSnapshot = new ImageData(buf, width, height);
        }
        // avoid affect raw data
        const frameImageCopy = new Uint8Array(frameInfo.imageData.length);
        // interlace
        if (frameInfo.interlace) {
            let rowIdx = 0;
            let idx = 0;
            function rowCopy() {
                for (let i = 0; i < frameInfo.width; i++) {
                    frameImageCopy[idx] = frameInfo.imageData[rowIdx * frameInfo.width + i];
                    idx++;
                }
            }
            // pass 1: row 0, row 8, row 16……
            while (rowIdx < frameInfo.height) {
                rowCopy();
                rowIdx += 8;
            }
            // pass 2: row 4, row 12, row 20……
            rowIdx = 4;
            while (rowIdx < frameInfo.height) {
                rowCopy();
                rowIdx += 8;
            }
            // pass 3: row 2, row 6, row 10……
            rowIdx = 2;
            while (rowIdx < frameInfo.height) {
                rowCopy();
                rowIdx += 4;
            }
            // pass 4: row 1, row 3, row 5……
            rowIdx = 1;
            while (rowIdx < frameInfo.height) {
                rowCopy();
                rowIdx += 2;
            }
        }
        else {
            frameImageCopy.set(frameInfo.imageData);
        }
        // fill color
        const frameImageData = new Uint8ClampedArray(width * height * 4);
        for (let i = 0, len = width * height; i < len; i++) {
            let x = i % width;
            let y = (i / width) >> 0;
            // first primary color index
            let pci = i * 4;
            // whether current pixel in current frame image
            if (x >= frameInfo.left &&
                x < (frameInfo.left + frameInfo.width) &&
                y >= frameInfo.top &&
                y < (frameInfo.top + frameInfo.height)) {
                // frameImageCopy index
                const ficidx = x - frameInfo.left + (y - frameInfo.top) * frameInfo.width;
                // if this pixel is transparent, pixel will be filled width the color of previous frame at the same position
                if (frameInfo.transColorFlag && frameImageCopy[ficidx] === frameInfo.transColorIdx) {
                    frameImageData[pci] = lastFrameSnapshot.data[pci];
                    frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1];
                    frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2];
                    frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3];
                }
                else {
                    const color = colorTable[frameImageCopy[ficidx]];
                    frameImageData[pci] = color[0];
                    frameImageData[pci + 1] = color[0 + 1];
                    frameImageData[pci + 2] = color[0 + 2];
                    frameImageData[pci + 3] = 255;
                }
            }
            else {
                frameImageData[pci] = lastFrameSnapshot.data[pci];
                frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1];
                frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2];
                frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3];
            }
        }
        const frameImage = new ImageData(frameImageData, width, height);
        // cache
        frameInfo.canvasImageData = frameImage;
        return frameImage;
    }
    /**
     * get correct lastFrameSnapshot
     */
    function getLastFrameSnapshot(gifData, frameIndex) {
        // first frame, dont need lastFrameSnapshot
        if (frameIndex <= 0)
            return undefined;
        const lastFrame = gifData.frames[frameIndex - 1];
        // no dependency
        if (lastFrame.disposalMethod === 0 || lastFrame.disposalMethod === 2) {
            return undefined;
        }
        // use last frame as background
        if ([1].includes(lastFrame.disposalMethod)) {
            if (lastFrame.canvasImageData)
                return lastFrame.canvasImageData;
            return generateImageData(gifData, lastFrame, getLastFrameSnapshot(gifData, frameIndex - 1));
        }
        // drop last frame, use last 2 frame
        if (lastFrame.disposalMethod === 3) {
            return getLastFrameSnapshot(gifData, frameIndex - 1);
        }
        return undefined;
    }
    /**
     * render frame image data to canvas
     */
    function render(ctx, offscreenCtx, gifData, frameIndex, beforeDraw) {
        // current frame info
        const frameInfo = gifData.frames[frameIndex];
        // get last frame snapshot
        let lastFrameSnapshot = getLastFrameSnapshot(gifData, frameIndex);
        let currentFrameImage = generateImageData(gifData, frameInfo, lastFrameSnapshot);
        // if beforeDraw is Function, call it
        if (isFunc(beforeDraw)) {
            let tempFrameImage = new ImageData(currentFrameImage.width, currentFrameImage.height);
            tempFrameImage.data.set(currentFrameImage.data);
            tempFrameImage = beforeDraw(tempFrameImage);
            currentFrameImage = tempFrameImage;
        }
        offscreenCtx.putImageData(currentFrameImage, 0, 0);
        // drawImage can scale image, but doesn't support ImageData, so we use offscreen canvas
        ctx.drawImage(offscreenCtx.canvas, 0, 0, currentFrameImage.width, currentFrameImage.height, 0, 0, ctx.canvas.width, ctx.canvas.height);
        return currentFrameImage;
    }

    /**
     * base skin class
     */
    class SkinBase {
        constructor(amzGif) {
            this.keys = [];
            this.watch = {};
            this.amzGif = amzGif;
            this.cache = {};
            this.init();
        }
        init() {
            this.dirtyChecking();
        }
        /**
         * check changes of data
         */
        dirtyChecking() {
            const changes = [];
            let tempValue = null;
            Object.keys(this.watch).map(key => {
                tempValue = this.getValue(key);
                if (this.cache[key] !== tempValue) {
                    changes.push({
                        key,
                        oldValue: this.cache[key],
                        newValue: tempValue
                    });
                }
            });
            // notify subscribers
            changes.map((change) => __awaiter(this, void 0, void 0, function* () {
                if (isFunc(this.watch[change.key])) {
                    yield this.watch[change.key](change.newValue, change.oldValue);
                }
            }));
        }
        /**
         * get value by key from amzGif
         */
        getValue(key) {
            const path = key.split('.').filter(v => v);
            let temp = this.amzGif;
            for (let i = 0; i < path.length; i++) {
                temp = temp === null || temp === void 0 ? void 0 : temp[path[i]];
                if (temp === undefined)
                    break;
            }
            return temp;
        }
    }

    var playSvg = 'data:image/svg+xml;base64,PHN2ZyB0PSIxNjYyNzg5NjY0NjUyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIzNjciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMTI4IDEzOC42NjY2NjdjMC00Ny4yMzIgMzMuMzIyNjY3LTY2LjY2NjY2NyA3NC4xNzYtNDMuNTYyNjY3bDY2My4xNDY2NjcgMzc0Ljk1NDY2N2M0MC45NiAyMy4xNjggNDAuODUzMzMzIDYwLjggMCA4My44ODI2NjZMMjAyLjE3NiA5MjguODk2QzE2MS4yMTYgOTUyLjA2NCAxMjggOTMyLjU2NTMzMyAxMjggODg1LjMzMzMzM3YtNzQ2LjY2NjY2NnoiIGZpbGw9IiMzRDNEM0QiIHAtaWQ9IjIzNjgiPjwvcGF0aD48L3N2Zz4=';

    var loadingSvg = 'data:image/svg+xml;base64,PHN2ZyB0PSIxNjYyNzg5NzI0Njc4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjM0NDEiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNTEyLjUxMSAyMS40ODNjLTI3MS4xNjMgMC00OTEuMDI4IDIxOS44Ni00OTEuMDI4IDQ5MS4wMjggMCAyNzEuMTczIDIxOS44NTYgNDkxLjAzIDQ5MS4wMjggNDkxLjAzIDI2LjU1NCAwIDQ4LjA4LTIxLjUyNyA0OC4wOC00OC4wOCAwLTI2LjU1NC0yMS41MjYtNDguMDgtNDguMDgtNDguMDgtMjE4LjA2NSAwLTM5NC44NjktMTc2LjgwNC0zOTQuODY5LTM5NC44NyAwLTIxOC4wNiAxNzYuODEzLTM5NC44NjkgMzk0Ljg3LTM5NC44NjkgMjE4LjA2NSAwIDM5NC44NjkgMTc2LjgwNCAzOTQuODY5IDM5NC44NyAwIDI2LjU1MyAyMS41MjYgNDguMDggNDguMDggNDguMDggMjYuNTUzIDAgNDguMDgtMjEuNTI3IDQ4LjA4LTQ4LjA4IDAtMjcxLjE3My0yMTkuODU3LTQ5MS4wMy00OTEuMDMtNDkxLjAzeiIgcC1pZD0iMzQ0MiI+PC9wYXRoPjwvc3ZnPg==';

    class BasicSkin extends SkinBase {
        constructor(amzGif) {
            super(amzGif);
            this.playDiv = null;
            this.playImg = null;
            this.loadingDiv = null;
            this.loadingImg = null;
            this.loadingImgRoate = 0;
            this.handlePlay = this.handlePlay.bind(this);
            this.dirtyChecking = this.dirtyChecking.bind(this);
            this.init();
            this.setWatch();
        }
        init() {
            const container = this.amzGif._canvas.parentElement;
            if (!container) {
                this.amzGif._errCall(errMsgs.skinError, 'onError');
                return;
            }
            const rect = container.getBoundingClientRect();
            const playDiv = this.genMask(rect.width, rect.height);
            playDiv.style.zIndex = '1';
            playDiv.style.display = 'none';
            playDiv.style.cursor = 'pointer';
            playDiv.addEventListener('click', this.handlePlay.bind(this));
            this.playDiv = playDiv;
            const playImg = document.createElement('img');
            playImg.src = playSvg;
            playImg.style.width = '60px';
            playImg.style.height = '60px';
            playImg.style.opacity = '0.6';
            this.playImg = playImg;
            playDiv.appendChild(playImg);
            container.appendChild(playDiv);
            const loadingDiv = this.genMask(rect.width, rect.height);
            this.loadingDiv = loadingDiv;
            loadingDiv.style.zIndex = '2';
            loadingDiv.style.display = 'none';
            const loadingImg = document.createElement('img');
            this.loadingImg = loadingImg;
            loadingImg.src = loadingSvg;
            loadingImg.style.width = '60px';
            loadingImg.style.height = '60px';
            loadingImg.style.opacity = '0.6';
            loadingDiv.appendChild(loadingImg);
            container.appendChild(loadingDiv);
            this.amzGif._rAFCallbackQueue.push(this.dirtyChecking.bind(this));
        }
        genMask(width, height) {
            const div = document.createElement('div');
            div.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            div.style.width = width + 'px';
            div.style.height = height + 'px';
            div.style.position = 'absolute';
            div.style.left = '0';
            div.style.top = '0';
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            return div;
        }
        setWatch() {
            this.watch['isPlaying'] = (newValue) => {
                if (this.playDiv) {
                    this.playDiv.style.display = newValue || this.amzGif.isLoading ? 'none' : 'flex';
                }
            };
            this.watch['isLoading'] = (newValue) => {
                if (this.loadingDiv) {
                    this.loadingDiv.style.display = newValue ? 'flex' : 'none';
                    if (newValue && this.loadingImg) {
                        this.loadingImg.style.transform = `rotate(${this.loadingImgRoate += 1}deg)`;
                    }
                }
            };
        }
        handlePlay() {
            if (!this.amzGif.isPlaying) {
                this.amzGif.play();
            }
        }
    }

    function initSkin (amzGif) {
        if (amzGif._config.interactive) {
            if (amzGif._config.skin === 'basic') {
                return new BasicSkin(amzGif);
            }
        }
    }

    /**
     * grayscale filter
     * Weighted average: 0.3R + 0.59G + 0.11*B
     */
    function grayscale (imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const avg = (imgData.data[i] * 0.3 + imgData.data[i + 1] * 0.59 + imgData.data[i + 2] * 0.11) >> 0;
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg;
        }
        return imgData;
    }

    /**
     * black and white filter
     * if average value of rgb is smaller than 100, set rgb to 0, otherwise set rgba to 255
     */
    function blackAndWhite(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg >= 100 ? 255 : 0;
        }
        return imgData;
    }

    /**
     * reverse filter
     * subtract rgb from 255
     */
    function reverse(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            imgData.data[i] = 255 - imgData.data[i];
            imgData.data[i + 1] = 255 - imgData.data[i + 1];
            imgData.data[i + 2] = 255 - imgData.data[i + 2];
        }
        return imgData;
    }

    /**
     * decolorizing filter
     * set rgb to the average of extremum
     */
    function decolorizing(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const avg = ((Math.min(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]) + Math.max(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2])) / 2) >> 0;
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg;
        }
        return imgData;
    }

    /**
     * monochrome red filter
     * set green and blue to zero
     */
    function monochromeRed(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            imgData.data[i + 1] = imgData.data[i + 2] = 0;
        }
        return imgData;
    }

    /**
     * monochrome green filter
     * set red and blue to zero
     */
    function monochromeGreen(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            imgData.data[i] = imgData.data[i + 2] = 0;
        }
        return imgData;
    }

    /**
     * monochrome blue filter
     * set red and green to zero
     */
    function monochromeBlue(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            imgData.data[i] = imgData.data[i + 1] = 0;
        }
        return imgData;
    }

    /**
     * nostalgic filter
     * r: 0.393 * r + 0.769 * g + 0.189 * b
     * g: 0.349 * r + 0.686 * g + 0.168 * b
     * b: 0.272 * r + 0.534 * g + 0.131 * b
     */
    function nostalgic(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
            const newR = 0.393 * r + 0.769 * g + 0.189 * b, newG = 0.349 * r + 0.686 * g + 0.168 * b, newB = 0.272 * r + 0.534 * g + 0.131 * b;
            imgData.data[i] = Math.min(255, Math.max(0, newR));
            imgData.data[i + 1] = Math.min(255, Math.max(0, newG));
            imgData.data[i + 2] = Math.min(255, Math.max(0, newB));
        }
        return imgData;
    }

    /**
     * black and white filter
     * r: r * 128 / (g + b + 1)
     * g: g * 128 / (r + b + 1)
     * b: b * 128 / (g + r + 1)
     */
    function cast(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
            const newR = r * 128 / (g + b + 1), newG = g * 128 / (r + b + 1), newB = b * 128 / (g + r + 1);
            imgData.data[i] = Math.min(255, Math.max(0, newR));
            imgData.data[i + 1] = Math.min(255, Math.max(0, newG));
            imgData.data[i + 2] = Math.min(255, Math.max(0, newB));
        }
        return imgData;
    }

    /**
     * black and white filter
     * r: (r - g -b) * 3 /2
     * g: (g - r -b) * 3 /2
     * b: (b - g -r) * 3 /2
     */
    function frozen(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
            const newR = (r - g - b) * 3 / 2, newG = (g - r - b) * 3 / 2, newB = (b - g - r) * 3 / 2;
            imgData.data[i] = Math.min(255, Math.max(0, newR));
            imgData.data[i + 1] = Math.min(255, Math.max(0, newG));
            imgData.data[i + 2] = Math.min(255, Math.max(0, newB));
        }
        return imgData;
    }

    /**
     * black and white filter
     * r: |g – b + g + r| * r / 256
     * g: |b – g + b + r| * r / 256
     * b: |b – g + b + r| * g / 256
     */
    function comic(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
            imgData.data[i] = Math.abs(g - b + g + r) * r / 256;
            imgData.data[i + 1] = Math.abs(b - g + b + r) * r / 256;
            imgData.data[i + 2] = Math.abs(b - g + b + r) * g / 256;
        }
        return imgData;
    }

    /**
     * black and white filter
     * r: r * 0.393 + g * 0.769 + b * 0.189
     * g: r * 0.349 + g * 0.686 + b * 0.168
     * b: r * 0.272 + g * 0.534 + b * 0.131
     */
    function brown(imgData) {
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
            const newR = r * 0.393 + g * 0.769 + b * 0.189, newG = r * 0.349 + g * 0.686 + b * 0.168, newB = r * 0.272 + g * 0.534 + b * 0.131;
            imgData.data[i] = Math.min(255, Math.max(0, newR));
            imgData.data[i + 1] = Math.min(255, Math.max(0, newG));
            imgData.data[i + 2] = Math.min(255, Math.max(0, newB));
        }
        return imgData;
    }

    /**
     * box blur
     */
    function boxBlur(imgData, boxSize = 5) {
        const tempImgData = new ImageData(imgData.width, imgData.height);
        tempImgData.data.set(imgData.data);
        // boxSize need be odd
        boxSize = isOdd(boxSize) ? boxSize : boxSize + 1;
        let x = 0;
        let y = 0;
        let box = new Uint8ClampedArray(boxSize * boxSize);
        let sum = 0;
        let avg = 0;
        for (let i = 0, len = imgData.data.length; i < len; i += 4) {
            x = (i / 4) % imgData.width;
            y = (i / 4 / imgData.width) >> 0;
            // rgb channels
            for (let c = 0; c < 3; c++) {
                box = fillBoxPixels(imgData, x, y, box, boxSize, boxSize, c);
                // box average
                sum = 0;
                for (let bi = 0, len = box.length; bi < len; bi++) {
                    sum += box[bi];
                }
                avg = (sum / box.length) >> 0;
                if (avg < 0)
                    avg = 0;
                else if (avg > 255)
                    avg = 255;
                tempImgData.data[i + c] = avg;
            }
        }
        return tempImgData;
    }

    // filters from https://www.jianshu.com/p/3122d9710bd8
    var filter = {
        grayscale,
        blackAndWhite,
        reverse,
        decolorizing,
        monochromeRed,
        monochromeGreen,
        monochromeBlue,
        nostalgic,
        cast,
        frozen,
        comic,
        brown,
        boxBlur
    };

    const defaultConfig = {
        loop: true,
        auto: false,
        interactive: true,
        skin: 'basic',
        speed: 1
    };
    const speedList = [0.5, 1.0, 1.5, 2.0];
    class AMZGif {
        constructor(config) {
            this.speedList = speedList;
            this._imgEl = null;
            this._canvas = null;
            this._ctx = null;
            this._offscreenCanvas = null;
            this._offscreenCtx = null;
            this._gifBuffer = null;
            this.gifData = null;
            this._currFrame = -1;
            this._nextUpdateTime = performance.now();
            this._rAFCallbackQueue = [];
            /**
             * loading gif
             */
            this.isLoading = false;
            /**
             * @member isPlaying
             * @description play status
             */
            this.isPlaying = false;
            /**
             * is rendering
             */
            this.isRendering = false;
            this._config = Object.assign(Object.assign({}, defaultConfig), config);
            if (!speedList.includes(this._config.speed)) {
                this._config.speed = 1;
            }
            this._update = this._update.bind(this);
            this._renderFrame = this._renderFrame.bind(this);
            this._togglePlay = this._togglePlay.bind(this);
            this._init();
        }
        /**
         * @member init
         */
        _init() {
            var _a;
            // init element
            // check img element
            if (!this._config.el) {
                this._errCall(errMsgs.noConfigEl, 'onError');
                return;
            }
            if (this._config.el instanceof HTMLImageElement) {
                this._imgEl = this._config.el;
            }
            if (typeof this._config.el === 'string') {
                const el = document.querySelector(this._config.el);
                if (!el) {
                    this._errCall(errMsgs.noImg + this._config.el, 'onError');
                    return;
                }
                if (!(el instanceof HTMLImageElement)) {
                    this._errCall(errMsgs.notImg(this._config.el), 'onError');
                    return;
                }
                this._imgEl = el;
            }
            (_a = this._imgEl) === null || _a === void 0 ? void 0 : _a.addEventListener('load', () => {
                this._initCanvas();
                this._initContainer();
                // init controller
                initSkin(this);
                // if config.auto is true, play gif at once
                if (this._config.auto === true) {
                    this.play();
                }
                this._rAFCallbackQueue.push(this._update);
                rAF(this._rAFCallbackQueue);
            });
        }
        /**
         * set width and height，and create canvas
         */
        _initCanvas() {
            var _a, _b, _c, _d, _e, _f, _g;
            const img = this._imgEl;
            // get width and height
            const rect = img.getBoundingClientRect();
            console.log(rect);
            this._config.width = typeof this._config.width === 'number' ? this._config.width : (_a = rect === null || rect === void 0 ? void 0 : rect.width) !== null && _a !== void 0 ? _a : 0;
            this._config.height = typeof this._config.height === 'number' ? this._config.height : (_b = rect === null || rect === void 0 ? void 0 : rect.height) !== null && _b !== void 0 ? _b : 0;
            // create canvas
            this._canvas = document.createElement('canvas');
            this._canvas.style.cursor = 'pointer';
            this._canvas.addEventListener('click', this._togglePlay);
            this._canvas.width = this._config.width;
            this._canvas.height = this._config.height;
            this._canvas.style.width = this._config.width + 'px';
            this._canvas.style.height = this._config.height + 'px';
            this._ctx = this._canvas.getContext('2d');
            this._ctx.globalCompositeOperation = 'copy';
            (_c = this._ctx) === null || _c === void 0 ? void 0 : _c.drawImage(img, 0, 0, (_d = rect === null || rect === void 0 ? void 0 : rect.width) !== null && _d !== void 0 ? _d : this._config.width, (_e = rect === null || rect === void 0 ? void 0 : rect.height) !== null && _e !== void 0 ? _e : this._config.height, 0, 0, (_f = this._config.width) !== null && _f !== void 0 ? _f : rect === null || rect === void 0 ? void 0 : rect.width, (_g = this._config.height) !== null && _g !== void 0 ? _g : rect === null || rect === void 0 ? void 0 : rect.height);
        }
        _initContainer() {
            var _a;
            const img = this._imgEl;
            // create container
            const container = document.createElement('div');
            if (img.id) {
                container.id = img.id;
            }
            container.style.width = this._config.width + 'px';
            container.style.height = this._config.height + 'px';
            container.style.position = 'relative';
            // set display as same as img element
            container.style.display = 'inline-block';
            if (this._canvas) {
                container.appendChild(this._canvas);
                (_a = img.parentElement) === null || _a === void 0 ? void 0 : _a.replaceChild(container, img);
            }
        }
        /**
         * @member play
         * play gif
         */
        play() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                // check gifBuffer, if it is null, load gif first
                if (this._gifBuffer === null) {
                    if (!this._config.src) {
                        return this._errCall(errMsgs.noGifUrl, 'onError');
                    }
                    yield this._getGif().catch((e) => this._errCall(e.message, 'onLoadError'));
                }
                if (this._gifBuffer === null) {
                    return;
                }
                // try parse gifBuffer
                if (this.gifData === null) {
                    const temp = parser(this._gifBuffer, this._errCall);
                    if (!temp || !temp.header.isGif)
                        return;
                    this.gifData = temp;
                    this._offscreenCanvas = document.createElement('canvas');
                    this._offscreenCanvas.width = (_a = this.gifData) === null || _a === void 0 ? void 0 : _a.header.width;
                    this._offscreenCanvas.height = (_b = this.gifData) === null || _b === void 0 ? void 0 : _b.header.height;
                    this._offscreenCtx = this._offscreenCanvas.getContext('2d');
                }
                if (isFunc(this._config.onBeforePlay)) {
                    const res = yield this._config.onBeforePlay();
                    if (!res)
                        return;
                }
                this.isPlaying = true;
                this._nextUpdateTime = Math.max(this._nextUpdateTime, performance.now());
                if (this._checkEnd()) {
                    this._currFrame = -1;
                }
                if (isFunc(this._config.onPlay)) {
                    this._config.onPlay();
                }
            });
        }
        /**
         * pause
         */
        pause() {
            return __awaiter(this, void 0, void 0, function* () {
                if (isFunc(this._config.onBeforePause)) {
                    const res = yield this._config.onBeforePause();
                    if (!res)
                        return;
                }
                this.isPlaying = false;
                if (isFunc(this._config.onPause)) {
                    this._config.onPause();
                }
            });
        }
        /**
         * play next frame munually
         * @returns
         */
        nextFrame() {
            if (!this.gifData || !this._ctx || !this._offscreenCtx) {
                return this._errCall(errMsgs.notReady, 'onError');
            }
            if (this.isRendering)
                return errMsgs.isRendering;
            this._currFrame = (this._currFrame + 1) % this.gifData.frames.length;
            this._renderFrame();
            this._nextUpdateTime = performance.now() + this.gifData.frames[this._currFrame].delay / this._config.speed;
        }
        /**
         * play prev frame manually
         */
        prevFrame() {
            if (!this.gifData || !this._ctx || !this._offscreenCtx) {
                return this._errCall(errMsgs.notReady, 'onError');
            }
            if (this.isRendering)
                return errMsgs.isRendering;
            this._currFrame--;
            if (this._currFrame < 0) {
                this._currFrame = this.gifData.frames.length - 1;
            }
            this._renderFrame();
            this._nextUpdateTime = performance.now() + this.gifData.frames[this._currFrame].delay / this._config.speed;
        }
        /**
         * jump
         */
        jump(frameIndex) {
            if (!this.gifData) {
                return this._errCall(errMsgs.notReady, 'onError');
            }
            if (typeof frameIndex !== 'number') {
                return this._errCall(errMsgs.wrongParam, 'onError');
            }
            if (this.isRendering)
                return errMsgs.isRendering;
            if (frameIndex < 0 || frameIndex > this.gifData.frames.length - 1) {
                frameIndex = 0;
            }
            this._currFrame = frameIndex;
            this._renderFrame();
        }
        /**
         * set speed
         */
        setSpeed(speed) {
            if (this.speedList.includes(speed)) {
                this._config.speed = speed;
                return true;
            }
            return false;
        }
        /**
         * togglePlay by
         */
        _togglePlay() {
            if (this._config.interactive === false)
                return;
            if (this.isPlaying) {
                this.pause();
            }
            else {
                this.play();
            }
        }
        /**
         * update
         */
        _update(time) {
            if (!this.isPlaying || this.isRendering || !this.gifData || !this._ctx || !this._offscreenCtx || document.hidden)
                return;
            // If the time has not yet arrived, no action
            if (this._nextUpdateTime > time)
                return;
            this._currFrame++;
            if (this._checkEnd()) {
                this.isPlaying = false;
                if (isFunc(this._config.onEnd)) {
                    this._config.onEnd();
                }
                return;
            }
            this._renderFrame();
            // set nextUpdateTime
            while (this._nextUpdateTime <= time) {
                this._nextUpdateTime += Math.max(this.gifData.frames[this._currFrame].delay / this._config.speed, 1);
                if (this._nextUpdateTime <= time) {
                    this._currFrame++;
                    if (this._checkEnd()) {
                        this.isPlaying = false;
                        if (isFunc(this._config.onEnd)) {
                            this._config.onEnd();
                        }
                        // render the last frame
                        this._currFrame = this.gifData.frames.length - 1;
                        this._renderFrame();
                    }
                }
            }
        }
        _renderFrame() {
            const gifData = this.gifData;
            const ctx = this._ctx;
            const offscreenCtx = this._offscreenCtx;
            // render will take some time
            this.isRendering = true;
            render(ctx, offscreenCtx, gifData, this._currFrame, (imgData) => {
                if (isFunc(this._config.filter)) {
                    return this._config.filter(imgData);
                }
                return imgData;
            });
            this.isRendering = false;
        }
        _checkEnd() {
            if (this._currFrame > (this.gifData.frames.length - 1)) {
                if (this._config.loop !== false) {
                    this._currFrame = 0;
                    return false;
                }
                else {
                    return true;
                }
            }
            return false;
        }
        /**
         * get gif data
         */
        _getGif() {
            return __awaiter(this, void 0, void 0, function* () {
                this.isLoading = true;
                if (isFunc(this._config.httpRequest)) {
                    try {
                        const blob = yield this._config.httpRequest(this._config.src);
                        this._gifBuffer = yield blob.arrayBuffer();
                    }
                    catch (e) {
                        this._errCall(e === null || e === void 0 ? void 0 : e.message, 'onLoadError');
                    }
                }
                else {
                    try {
                        const res = yield fetch(this._config.src);
                        this._gifBuffer = yield res.arrayBuffer();
                        if (isFunc(this._config.onLoad)) {
                            this._config.onLoad();
                        }
                    }
                    catch (e) {
                        this._errCall(e === null || e === void 0 ? void 0 : e.message, 'onLoadError');
                    }
                }
                this.isLoading = false;
            });
        }
        /**
         * @ignore
         * handleError
         */
        _errCall(msg, funcName) {
            var _a, _b, _c, _d;
            if (isFunc(this._config[funcName])) {
                (_b = (_a = this._config)[funcName]) === null || _b === void 0 ? void 0 : _b.call(_a, msg);
            }
            else if (isFunc(this._config.onError)) {
                (_d = (_c = this._config).onError) === null || _d === void 0 ? void 0 : _d.call(_c, msg);
            }
            else {
                throw new Error(msg);
            }
        }
    }
    AMZGif.filter = filter;

    return AMZGif;

}));
