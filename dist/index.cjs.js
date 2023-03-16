'use strict';

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
    skinContainerIsSmall: '空间不足以显示皮肤',
    errData: '数据格式错误'
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
/**
 * get bit depth of a num
 * @param num
 * @returns
 */
function getBitsByNum(num) {
    let exp = 1;
    while (num > 2 ** exp) {
        exp++;
    }
    return exp;
}
/**
 * setBits
 * @param targetNum 1 byte
 * @param bitIdx bit index (from right to left)
 * @param length required bits length
 * @param sourceNum
 * @returns
 */
function setBits(targetNum, bitIdx, length, sourceNum) {
    return ((((1 << length) - 1) & sourceNum) << bitIdx) | targetNum;
}
/**
 * increase buffer capacity
 * @param buf
 * @param num
 * @returns
 */
function bufferGrow(buf, num) {
    if (!num) {
        num = 256;
    }
    if (buf instanceof Uint8Array) {
        const temp = new Uint8Array(buf.length + num);
        temp.set(buf);
        return temp;
    }
    return undefined;
}

const defaultConfig = {
    loop: true,
    auto: false,
    interactive: true,
    skin: 'basic',
    speed: 1
};
const speedList = [0.5, 1.0, 1.5, 2.0];
const defaultBgColor = [0, 0, 0, 255];

var WorkerClass = null;

try {
    var WorkerThreads =
        typeof module !== 'undefined' && typeof module.require === 'function' && module.require('worker_threads') ||
        typeof __non_webpack_require__ === 'function' && __non_webpack_require__('worker_threads') ||
        typeof require === 'function' && require('worker_threads');
    WorkerClass = WorkerThreads.Worker;
} catch(e) {} // eslint-disable-line

function decodeBase64$1(base64, enableUnicode) {
    return Buffer.from(base64, 'base64').toString(enableUnicode ? 'utf16' : 'utf8');
}

function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64$1(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    return function WorkerFactory(options) {
        return new WorkerClass(body, Object.assign({}, options, { eval: true }));
    };
}

function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    if (enableUnicode) {
        var binaryView = new Uint8Array(binaryString.length);
        for (var i = 0, n = binaryString.length; i < n; ++i) {
            binaryView[i] = binaryString.charCodeAt(i);
        }
        return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
    }
    return binaryString;
}

function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    var blob = new Blob([body], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
        return new Worker(url, options);
    };
}

var kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

function isNodeJS() {
    return kIsNodeJS;
}

function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    if (isNodeJS()) {
        return createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg);
    }
    return createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg);
}

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qKgogICAgICogQG1vZHVsZSBoZWxwZXJzCiAgICAgKi8KICAgIC8qKgogICAgICogZ2V0Qml0cwogICAgICogQHBhcmFtIG51bSAxIGJ5dGUKICAgICAqIEBwYXJhbSBiaXRJZHggYml0IGluZGV4KGZyb20gcmlnaHQgdG8gbGVmdCkKICAgICAqIEBwYXJhbSBsZW5ndGggcmVxdWlyZWQgYml0cyBsZW5ndGgKICAgICAqLwogICAgZnVuY3Rpb24gZ2V0Qml0cyhudW0sIGJpdElkeCwgbGVuZ3RoKSB7CiAgICAgICAgcmV0dXJuIChudW0gPj4gYml0SWR4KSAmICgoMSA8PCBsZW5ndGgpIC0gMSk7CiAgICB9CiAgICAvKioKICAgICAqIHNldEJpdHMKICAgICAqIEBwYXJhbSB0YXJnZXROdW0gMSBieXRlCiAgICAgKiBAcGFyYW0gYml0SWR4IGJpdCBpbmRleCAoZnJvbSByaWdodCB0byBsZWZ0KQogICAgICogQHBhcmFtIGxlbmd0aCByZXF1aXJlZCBiaXRzIGxlbmd0aAogICAgICogQHBhcmFtIHNvdXJjZU51bQogICAgICogQHJldHVybnMKICAgICAqLwogICAgZnVuY3Rpb24gc2V0Qml0cyh0YXJnZXROdW0sIGJpdElkeCwgbGVuZ3RoLCBzb3VyY2VOdW0pIHsKICAgICAgICByZXR1cm4gKCgoKDEgPDwgbGVuZ3RoKSAtIDEpICYgc291cmNlTnVtKSA8PCBiaXRJZHgpIHwgdGFyZ2V0TnVtOwogICAgfQoKICAgIC8vIGh0dHBzOi8vd3d3LmNuYmxvZ3MuY29tL2ppYW5nMDgvYXJ0aWNsZXMvMzE3MTMxOS5odG1sCiAgICBjb25zdCBHaWZMWlcgPSB7CiAgICAgICAgLyoqCiAgICAgICAgICogZGVjb2RlIGdpZiBidWZmZXIKICAgICAgICAgKiBAcGFyYW0gY29kZVNpemUKICAgICAgICAgKiBAcGFyYW0gYnVmCiAgICAgICAgICogQHJldHVybnMKICAgICAgICAgKi8KICAgICAgICBkZWNvZGU6IChjb2RlU2l6ZSwgYnVmKSA9PiB7CiAgICAgICAgICAgIGZ1bmN0aW9uIGdlblRhYmxlKCkgewogICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheSgoMiAqKiBjb2RlU2l6ZSkgKyAyKS5maWxsKDApLm1hcCgoXywgaW5kZXgpID0+IFN0cmluZy5mcm9tQ2hhckNvZGUoaW5kZXgpKTsKICAgICAgICAgICAgfQogICAgICAgICAgICBsZXQgdGFibGUgPSBnZW5UYWJsZSgpOwogICAgICAgICAgICBjb25zdCBjbGVhckNvZGUgPSAyICoqIGNvZGVTaXplOwogICAgICAgICAgICBjb25zdCBlbmRDb2RlID0gMiAqKiBjb2RlU2l6ZSArIDE7CiAgICAgICAgICAgIGxldCBiaXRMZW5ndGggPSBjb2RlU2l6ZSArIDE7CiAgICAgICAgICAgIGxldCBzdHJlYW0gPSAnJzsKICAgICAgICAgICAgbGV0IGRlY29kZVN0YXJ0ID0gdHJ1ZTsKICAgICAgICAgICAgbGV0IGJ5dGVMZW4gPSBidWYubGVuZ3RoOwogICAgICAgICAgICBsZXQgYnl0ZUlkeCA9IDA7CiAgICAgICAgICAgIGxldCBiaXRJZHggPSAwOwogICAgICAgICAgICBsZXQgcmVxdWlyZWRCaXRzID0gYml0TGVuZ3RoOwogICAgICAgICAgICBsZXQgY29kZSA9IDA7CiAgICAgICAgICAgIGxldCBrID0gJyc7CiAgICAgICAgICAgIGxldCBvbGRDb2RlID0gMDsKICAgICAgICAgICAgd2hpbGUgKGJ5dGVJZHggPCBieXRlTGVuKSB7CiAgICAgICAgICAgICAgICByZXF1aXJlZEJpdHMgPSBiaXRMZW5ndGg7CiAgICAgICAgICAgICAgICBjb2RlID0gMDsKICAgICAgICAgICAgICAgIC8vIHJlYWQgY29kZQogICAgICAgICAgICAgICAgd2hpbGUgKHJlcXVpcmVkQml0cyAhPT0gMCkgewogICAgICAgICAgICAgICAgICAgIGlmICg4IC0gYml0SWR4ID49IHJlcXVpcmVkQml0cykgewogICAgICAgICAgICAgICAgICAgICAgICBjb2RlICs9IGdldEJpdHMoYnVmW2J5dGVJZHhdLCBiaXRJZHgsIHJlcXVpcmVkQml0cykgPDwgKGJpdExlbmd0aCAtIHJlcXVpcmVkQml0cyk7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdElkeCArPSByZXF1aXJlZEJpdHM7CiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkQml0cyA9IDA7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICBjb2RlICs9IGdldEJpdHMoYnVmW2J5dGVJZHhdLCBiaXRJZHgsIDggLSBiaXRJZHgpIDw8IChiaXRMZW5ndGggLSByZXF1aXJlZEJpdHMpOwogICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZEJpdHMgLT0gKDggLSBiaXRJZHgpOwogICAgICAgICAgICAgICAgICAgICAgICBiaXRJZHggPSA4OwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAvLyBvdmVyZmxvdwogICAgICAgICAgICAgICAgICAgIGlmIChiaXRJZHggPT09IDgpIHsKICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZUlkeCsrOwogICAgICAgICAgICAgICAgICAgICAgICBiaXRJZHggPSAwOwogICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnl0ZUlkeCA+PSBieXRlTGVuKQogICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IGVuZENvZGUpCiAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICAvLyBjb2RlIGlzIGNsZWFyIGNvZGUsIHJlc2V0IHRhYmxlIGFuZCBvdGhlcnMKICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSBjbGVhckNvZGUpIHsKICAgICAgICAgICAgICAgICAgICB0YWJsZSA9IGdlblRhYmxlKCk7CiAgICAgICAgICAgICAgICAgICAgYml0TGVuZ3RoID0gY29kZVNpemUgKyAxOwogICAgICAgICAgICAgICAgICAgIGRlY29kZVN0YXJ0ID0gdHJ1ZTsKICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIC8vIGlmIGNvZGUgZXhpc3RzIGluIHRhYmxlLCBhcHBlbmQgY29kZSB0byBzdHJlYW0KICAgICAgICAgICAgICAgIGlmICh0YWJsZVtjb2RlXSAhPT0gdW5kZWZpbmVkKSB7CiAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgY29kZQogICAgICAgICAgICAgICAgICAgIGlmIChkZWNvZGVTdGFydCkgewogICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW0gKz0gdGFibGVbY29kZV07CiAgICAgICAgICAgICAgICAgICAgICAgIG9sZENvZGUgPSBjb2RlOwogICAgICAgICAgICAgICAgICAgICAgICBkZWNvZGVTdGFydCA9IGZhbHNlOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBlbHNlIHsKICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtICs9IHRhYmxlW2NvZGVdOwogICAgICAgICAgICAgICAgICAgICAgICBrID0gdGFibGVbY29kZV1bMF07CiAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlLnB1c2godGFibGVbb2xkQ29kZV0gKyBrKTsKICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ29kZSA9IGNvZGU7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgLy8gaWYgbm90CiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGFibGUsIGNvZGUsIG9sZENvZGUpCiAgICAgICAgICAgICAgICAgICAgaWYgKHRhYmxlW29sZENvZGVdID09PSB1bmRlZmluZWQpIHsKICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cob2xkQ29kZSwgc3RyZWFtLmxlbmd0aCk7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIGsgPSB0YWJsZVtvbGRDb2RlXVswXTsKICAgICAgICAgICAgICAgICAgICBzdHJlYW0gKz0gdGFibGVbb2xkQ29kZV0gKyBrOwogICAgICAgICAgICAgICAgICAgIHRhYmxlLnB1c2godGFibGVbb2xkQ29kZV0gKyBrKTsKICAgICAgICAgICAgICAgICAgICBvbGRDb2RlID0gY29kZTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNhcCBvZiB0YWJsZQogICAgICAgICAgICAgICAgaWYgKHRhYmxlLmxlbmd0aCA+PSAoMiAqKiBiaXRMZW5ndGgpKSB7CiAgICAgICAgICAgICAgICAgICAgaWYgKGJpdExlbmd0aCA8IDEyKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdExlbmd0aCsrOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgfQogICAgICAgICAgICBsZXQgcmVzID0gbmV3IFVpbnQ4QXJyYXkoc3RyZWFtLmxlbmd0aCk7CiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyZWFtLmxlbmd0aDsgaSsrKSB7CiAgICAgICAgICAgICAgICByZXNbaV0gPSBzdHJlYW0uY2hhckNvZGVBdChpKTsKICAgICAgICAgICAgfQogICAgICAgICAgICByZXR1cm4gcmVzOwogICAgICAgIH0sCiAgICAgICAgLyoqCiAgICAgICAgICogZW5jb2RlIGdpZiBjb2xvciBpbmRpY2VzIGJ1ZmZlcgogICAgICAgICAqIEBwYXJhbSBjb2RlU2l6ZQogICAgICAgICAqIEBwYXJhbSBidWYKICAgICAgICAgKi8KICAgICAgICBlbmNvZGU6IChjb2RlU2l6ZSwgYnVmKSA9PiB7CiAgICAgICAgICAgIC8vIGdlbmVyYXRlIG9yaWdpbmFsIGNvZGUgdGFibGUKICAgICAgICAgICAgZnVuY3Rpb24gZ2VuVGFibGUoKSB7CiAgICAgICAgICAgICAgICBjb25zdCB0ID0gbmV3IE1hcCgpOwogICAgICAgICAgICAgICAgbmV3IEFycmF5KDIgKiogY29kZVNpemUpLmZpbGwoMCkubWFwKChfLCBpbmRleCkgPT4gewogICAgICAgICAgICAgICAgICAgIHQuc2V0KFN0cmluZy5mcm9tQ2hhckNvZGUoaW5kZXgpLCBpbmRleCk7CiAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgIHJldHVybiB0OwogICAgICAgICAgICB9CiAgICAgICAgICAgIC8vIHdyaXRlIHRvIGJ1ZgogICAgICAgICAgICBmdW5jdGlvbiB3cml0ZShjb2RlKSB7CiAgICAgICAgICAgICAgICBsZXQgcmVxdWlyZWRCaXRzID0gYml0TGVuZ3RoOwogICAgICAgICAgICAgICAgLy8gaWYgc3RyZWFtIG1heSBub3QgZW5vdWdoLCBleHBhbmQgc3RyZWFtCiAgICAgICAgICAgICAgICBpZiAoYnl0ZUlkeCArIDIgPj0gc3RyZWFtLmxlbmd0aCkgewogICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N0cmVhbSA9IG5ldyBVaW50OEFycmF5KHN0cmVhbS5sZW5ndGggKyAyNTYpOwogICAgICAgICAgICAgICAgICAgIG5ld1N0cmVhbS5zZXQoc3RyZWFtKTsKICAgICAgICAgICAgICAgICAgICBzdHJlYW0gPSBuZXdTdHJlYW07CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB3aGlsZSAocmVxdWlyZWRCaXRzKSB7CiAgICAgICAgICAgICAgICAgICAgaWYgKDggLSBiaXRJZHggPj0gcmVxdWlyZWRCaXRzKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbVtieXRlSWR4XSA9IHNldEJpdHMoc3RyZWFtW2J5dGVJZHhdLCBiaXRJZHgsIHJlcXVpcmVkQml0cywgY29kZSk7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdElkeCArPSByZXF1aXJlZEJpdHM7CiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkQml0cyA9IDA7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1bYnl0ZUlkeF0gPSBzZXRCaXRzKHN0cmVhbVtieXRlSWR4XSwgYml0SWR4LCA4IC0gYml0SWR4LCBjb2RlKTsKICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9IGNvZGUgPj4gKDggLSBiaXRJZHgpOwogICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZEJpdHMgLT0gOCAtIGJpdElkeDsKICAgICAgICAgICAgICAgICAgICAgICAgYml0SWR4ID0gODsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgaWYgKGJpdElkeCA9PT0gOCkgewogICAgICAgICAgICAgICAgICAgICAgICBiaXRJZHggPSAwOwogICAgICAgICAgICAgICAgICAgICAgICBieXRlSWR4Kys7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIGxldCB0YWJsZSA9IGdlblRhYmxlKCk7CiAgICAgICAgICAgIGNvbnN0IGNsZWFyQ29kZSA9IDIgKiogY29kZVNpemU7CiAgICAgICAgICAgIGNvbnN0IGVuZENvZGUgPSAyICoqIGNvZGVTaXplICsgMTsKICAgICAgICAgICAgbGV0IHRhYmxlTGVuZ3RoID0gMiAqKiBjb2RlU2l6ZSArIDI7CiAgICAgICAgICAgIGxldCBiaXRMZW5ndGggPSBjb2RlU2l6ZSArIDE7CiAgICAgICAgICAgIGxldCBjdXJCaXRNYXhUYWJsZUxlbmd0aCA9IDIgKiogYml0TGVuZ3RoOwogICAgICAgICAgICAvLyB0aGlzIHdpbGwgYWZmZWN0IHRoZSBzaXplIG9mIHRoZSBjb21wcmVzc2VkIGJ1ZgogICAgICAgICAgICAvLyA0MDkzIGlzIG1vcmUgZWZmaWNlbnQgaW4gdGhlIGV4YW1wbGUgcGljICdjYXQxLmdpZicKICAgICAgICAgICAgLy8gbGV0IG1heFRhYmxlTGVuZ3RoID0gMiAqKiAxMgogICAgICAgICAgICBsZXQgbWF4VGFibGVMZW5ndGggPSA0MDkzOwogICAgICAgICAgICBsZXQgc3RyZWFtID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICAgICAgICAgICAgbGV0IGJ5dGVJZHggPSAwOwogICAgICAgICAgICBsZXQgYml0SWR4ID0gMDsKICAgICAgICAgICAgbGV0IHAgPSAnJzsKICAgICAgICAgICAgbGV0IGMgPSAnJzsKICAgICAgICAgICAgLy8gZmlyc3QgY29kZSBpbiBkYXRhIHN0cmVhbSBtdXN0IGJlIGNsZWFyIGNvZGUKICAgICAgICAgICAgd3JpdGUoY2xlYXJDb2RlKTsKICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkrKykgewogICAgICAgICAgICAgICAgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKTsKICAgICAgICAgICAgICAgIGlmICh0YWJsZS5oYXMocCArIGMpKSB7CiAgICAgICAgICAgICAgICAgICAgcCA9IHAgKyBjOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgd3JpdGUodGFibGUuZ2V0KHApKTsKICAgICAgICAgICAgICAgICAgICBpZiAodGFibGVMZW5ndGggPT09IG1heFRhYmxlTGVuZ3RoKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlKGNsZWFyQ29kZSk7CiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2V0IGNvZGUgdGFibGUgYW5kIGJpdExlbmd0aAogICAgICAgICAgICAgICAgICAgICAgICB0YWJsZSA9IGdlblRhYmxlKCk7CiAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlTGVuZ3RoID0gMiAqKiBjb2RlU2l6ZSArIDI7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdExlbmd0aCA9IGNvZGVTaXplICsgMTsKICAgICAgICAgICAgICAgICAgICAgICAgY3VyQml0TWF4VGFibGVMZW5ndGggPSAyICoqIGJpdExlbmd0aDsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGFibGVMZW5ndGggPT09IGN1ckJpdE1heFRhYmxlTGVuZ3RoKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdExlbmd0aCsrOwogICAgICAgICAgICAgICAgICAgICAgICBjdXJCaXRNYXhUYWJsZUxlbmd0aCA9IDIgKiogYml0TGVuZ3RoOwogICAgICAgICAgICAgICAgICAgICAgICB0YWJsZS5zZXQocCArIGMsIHRhYmxlTGVuZ3RoKyspOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBlbHNlIHsKICAgICAgICAgICAgICAgICAgICAgICAgdGFibGUuc2V0KHAgKyBjLCB0YWJsZUxlbmd0aCsrKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgcCA9IGM7CiAgICAgICAgICAgICAgICAgICAgYyA9ICcnOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIGlmIChwKSB7CiAgICAgICAgICAgICAgICB3cml0ZSh0YWJsZS5nZXQocCkpOwogICAgICAgICAgICB9CiAgICAgICAgICAgIHdyaXRlKGVuZENvZGUpOwogICAgICAgICAgICBsZXQgZmluYWwgPSBudWxsOwogICAgICAgICAgICBpZiAoYml0SWR4KSB7CiAgICAgICAgICAgICAgICBmaW5hbCA9IHN0cmVhbS5zbGljZSgwLCBieXRlSWR4ICsgMSk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICBmaW5hbCA9IHN0cmVhbS5zbGljZSgwLCBieXRlSWR4KTsKICAgICAgICAgICAgfQogICAgICAgICAgICByZXR1cm4gZmluYWw7CiAgICAgICAgfQogICAgfTsKCiAgICBjb25zdCB1dGlscyA9IHsKICAgICAgICBnaWZMendEZWNvZGU6IEdpZkxaVy5kZWNvZGUsCiAgICAgICAgZ2lmTHp3RW5jb2RlOiBHaWZMWlcuZW5jb2RlCiAgICB9OwogICAgb25tZXNzYWdlID0gKGUpID0+IHsKICAgICAgICBjb25zdCB7IGFjdGlvbiwgcGFyYW0sIF9zaWduIH0gPSBlLmRhdGE7CiAgICAgICAgaWYgKHR5cGVvZiB1dGlsc1thY3Rpb25dID09PSAnZnVuY3Rpb24nKSB7CiAgICAgICAgICAgIGNvbnN0IHJlcyA9IHsKICAgICAgICAgICAgICAgIGFjdGlvbiwKICAgICAgICAgICAgICAgIHJlc3VsdDogdXRpbHNbYWN0aW9uXSguLi4ocGFyYW0gIT09IG51bGwgJiYgcGFyYW0gIT09IHZvaWQgMCA/IHBhcmFtIDogW10pKSwKICAgICAgICAgICAgICAgIF9zaWduCiAgICAgICAgICAgIH07CiAgICAgICAgICAgIHBvc3RNZXNzYWdlKHJlcyk7CiAgICAgICAgfQogICAgICAgIGVsc2UgewogICAgICAgICAgICBjb25zb2xlLmxvZygn5oyH5a6a5pON5L2c5LiN5a2Y5ZyoJyk7CiAgICAgICAgfQogICAgfTsKCn0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPXdvcmtlclV0aWxzLmpzLm1hcAoK', null, false);
/* eslint-enable */

const workerNum = Math.max(window.navigator.hardwareConcurrency - 1, 1); // 线程数量
const quene = new Map();
const waiting = [];
const workers = new Array(workerNum).fill(null).map((_, index) => {
    return ({
        index,
        worker: new WorkerFactory(),
        idle: true // 是否空闲
    });
});
workers.map(item => {
    item.worker.addEventListener('message', e => {
        if (!e.data || !e.data._sign) {
            console.error('worker 返回数据错误');
            quene.get(e.data._sign).reject('worker 返回数据错误');
        }
        else {
            quene.get(e.data._sign).resolve(e.data.result);
            quene.delete(e.data._sign);
            item.idle = true;
            // 尝试接受新任务
            assignJob();
        }
    });
});
/**
 * 将等待队列中的任务加入空闲线程
 */
function assignJob() {
    let idleWorker = null;
    let waitingJob = null;
    if (waiting.length) {
        idleWorker = workers.find(item => item.idle);
        if (idleWorker) {
            idleWorker.idle = false;
            waitingJob = waiting.shift();
            quene.set(waitingJob._sign, waitingJob.p);
            idleWorker.worker.postMessage(Object.assign(Object.assign({}, waitingJob.job), { _sign: waitingJob._sign }), waitingJob.job.transferable || []);
        }
    }
}
/**
 * @param job {
 *  action: '',
 *  param: [],
 * }
 */
var worker = (job) => {
    return new Promise((resolve, reject) => {
        const _sign = Date.now() * Math.random();
        waiting.push({
            _sign,
            job,
            p: { resolve, reject }
        });
        // 分配线程
        assignJob();
    });
};

/**
 * decode gif buffer
 * @param gifBuffer
 * @param errorCallback
 */
var decode = (function decode(gifBuffer, errorCallback) {
    return __awaiter(this, void 0, void 0, function* () {
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
        let s = window.performance.now();
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
        console.log('parse: ', window.performance.now() - s);
        s = window.performance.now();
        const decompressedFramesData = yield Promise.all(gifData.frames.map((item) => {
            return worker({
                action: 'gifLzwDecode',
                param: [item.codeSize, item.imageData],
                transferable: [item.imageData.buffer]
            });
        }));
        console.log('duration: ', window.performance.now() - s);
        decompressedFramesData.map((data, idx) => {
            gifData.frames[idx].imageData = data;
        });
        return gifData;
    });
});
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
    info.cr = (buf[10] >> 4) & 0x7;
    // sort flag, if this is 1, color table is sorted by frequncy
    // 5th bit indicates this
    // now, this is useless
    info.sortFlag = Boolean(buf[10] & 0x08);
    // global color table size, (2^(n+1)
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
        verification: '',
        blockIdx: 1,
        repetitionTimes: 0,
        startByte: 0,
        endByte: 0
    };
    info.startByte = readCtrl.ptr;
    let idx = info.startByte;
    // to NETSCAPE, app name(8 bytes) and verification bytes(3 bytes)
    const blockSize = buf[idx += 2];
    idx++;
    for (let i = 0; i < blockSize - 3; i++) {
        info.appName += String.fromCharCode(buf[idx + i]);
    }
    idx += blockSize - 3;
    for (let i = 0; i < 3; i++) {
        info.verification += String.fromCharCode(buf[idx + i]);
    }
    idx += 3;
    // Number of bytes in the following sub-block
    const subBlockSize = buf[idx];
    info.endByte = idx + subBlockSize;
    info.blockIdx = buf[idx + 1];
    // Unsigned number of repetitions
    info.repetitionTimes = buf[idx + 2] + (buf[idx + 3] << 8);
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
        codeSize: 0,
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
        // frameData.imageData = GifLZW.decode(codeSize, imageData)
        frameData.codeSize = codeSize;
        frameData.imageData = imageData;
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
function generateFullCanvasImageData(gifData, frameIndex) {
    const frameInfo = gifData.frames[frameIndex];
    // check cache
    if (frameInfo.canvasImageData instanceof ImageData) {
        return frameInfo.canvasImageData;
    }
    // get last frame snapshot
    const lastFrameSnapshot = getLastFrameSnapshot(gifData, frameIndex);
    // color table
    const colorTable = frameInfo.lctFlag ? frameInfo.lctList : gifData.header.gctList;
    // background color
    const bgColor = gifData.header.gctFlag ? [...gifData.header.gctList[gifData.header.bgIndex], 255] : [...defaultBgColor];
    // width and height
    const width = gifData.header.width;
    const height = gifData.header.height;
    // avoid affect raw data
    const frameImageCopy = getGifRawImageDataCopy(frameInfo);
    // fill color
    const frameImageData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0, len = width * height; i < len; i++) {
        let x = i % width;
        let y = (i / width) >> 0;
        // first primary color index
        let pci = i << 2;
        // whether current pixel in current frame image
        if (x >= frameInfo.left &&
            x < (frameInfo.left + frameInfo.width) &&
            y >= frameInfo.top &&
            y < (frameInfo.top + frameInfo.height)) {
            // frameImageCopy index
            const ficidx = x - frameInfo.left + (y - frameInfo.top) * frameInfo.width;
            // if this pixel is transparent, pixel will be filled with the color of previous frame at the same position
            if (frameInfo.transColorFlag && frameImageCopy[ficidx] === frameInfo.transColorIdx) {
                if (lastFrameSnapshot) {
                    frameImageData[pci] = lastFrameSnapshot.data[pci];
                    frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1];
                    frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2];
                    frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3];
                }
            }
            else {
                const color = colorTable[frameImageCopy[ficidx]];
                frameImageData[pci] = color[0];
                frameImageData[pci + 1] = color[1];
                frameImageData[pci + 2] = color[2];
                frameImageData[pci + 3] = 255;
            }
        }
        else {
            if (lastFrameSnapshot) {
                frameImageData[pci] = lastFrameSnapshot.data[pci];
                frameImageData[pci + 1] = lastFrameSnapshot.data[pci + 1];
                frameImageData[pci + 2] = lastFrameSnapshot.data[pci + 2];
                frameImageData[pci + 3] = lastFrameSnapshot.data[pci + 3];
            }
            else {
                frameImageData[pci] = bgColor[0];
                frameImageData[pci + 1] = bgColor[1];
                frameImageData[pci + 2] = bgColor[2];
                frameImageData[pci + 3] = bgColor[3];
            }
        }
    }
    const frameImage = new ImageData(frameImageData, width, height);
    // cache
    frameInfo.canvasImageData = frameImage;
    return frameImage;
}
/**
 * generate ImageData
 * single frame, support transparent, without regard to disposal method
 */
function generateIndependentImageData(gifData, frameIndex) {
    const frameInfo = gifData.frames[frameIndex];
    // check cache
    if (frameInfo.independentImageData instanceof ImageData) {
        return frameInfo.independentImageData;
    }
    // color table
    const colorTable = frameInfo.lctFlag ? frameInfo.lctList : gifData.header.gctList;
    const frameImageCopy = getGifRawImageDataCopy(frameInfo);
    // fill color
    const frameImageData = new Uint8ClampedArray(frameInfo.width * frameInfo.height * 4);
    for (let i = 0; i < frameInfo.imageData.length; i++) {
        const idx = i << 2;
        if (frameInfo.transColorFlag && frameImageCopy[i] === frameInfo.transColorIdx) {
            frameImageData[idx] = 0;
            frameImageData[idx + 1] = 0;
            frameImageData[idx + 2] = 0;
            frameImageData[idx + 3] = 0;
        }
        else {
            const color = colorTable[frameImageCopy[i]];
            frameImageData[idx] = color[0];
            frameImageData[idx + 1] = color[1];
            frameImageData[idx + 2] = color[2];
            frameImageData[idx + 3] = 255;
        }
    }
    const independentImageData = new ImageData(frameInfo.width, frameInfo.height);
    independentImageData.data.set(frameImageData);
    // cache
    frameInfo.independentImageData = independentImageData;
    return independentImageData;
}
/**
 * get image data copy correctly (consider interlace)
 */
function getGifRawImageDataCopy(frameInfo) {
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
    return frameImageCopy;
}
/**
 * get correct lastFrameSnapshot
 */
function getLastFrameSnapshot(gifData, frameIndex) {
    // first frame, dont need lastFrameSnapshot
    if (frameIndex <= 0)
        return undefined;
    const lastFrame = gifData.frames[frameIndex - 1];
    // no specified disposal method
    if (lastFrame.disposalMethod === 0) {
        return undefined;
    }
    // set the area of image to background color
    if (lastFrame.disposalMethod === 2) {
        // background color
        const bgColor = gifData.header.gctFlag ? [...gifData.header.gctList[gifData.header.bgIndex], 255] : [...defaultBgColor];
        let lastCanvasImageData = lastFrame.canvasImageData;
        if (!lastCanvasImageData) {
            lastCanvasImageData = generateFullCanvasImageData(gifData, frameIndex - 1);
        }
        const tempImageData = new ImageData(lastCanvasImageData.width, lastCanvasImageData.height);
        // copy data--new ImageData(data, width, height) will not copy data
        tempImageData.data.set(lastCanvasImageData.data);
        for (let y = lastFrame.top; y < lastFrame.top + lastFrame.height; y++) {
            for (let x = lastFrame.left; x < lastFrame.left + lastFrame.width; x++) {
                const idx = (y * gifData.header.width + x) << 2;
                tempImageData.data[idx] = bgColor[0];
                tempImageData.data[idx + 1] = bgColor[1];
                tempImageData.data[idx + 2] = bgColor[2];
                tempImageData.data[idx + 3] = bgColor[3];
            }
        }
        return tempImageData;
    }
    // use last frame as background
    if ([1].includes(lastFrame.disposalMethod)) {
        if (lastFrame.canvasImageData)
            return lastFrame.canvasImageData;
        return generateFullCanvasImageData(gifData, frameIndex - 1);
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
    let currentFrameImage = generateFullCanvasImageData(gifData, frameIndex);
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

var playSvg = "<svg t=\"1662789664652\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"2367\" width=\"200\" height=\"200\"><path d=\"M128 138.666667c0-47.232 33.322667-66.666667 74.176-43.562667l663.146667 374.954667c40.96 23.168 40.853333 60.8 0 83.882666L202.176 928.896C161.216 952.064 128 932.565333 128 885.333333v-746.666666z\" fill=\"#3D3D3D\" p-id=\"2368\"></path></svg>";

var loadingSvg = "<svg t=\"1662789724678\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"3441\" width=\"200\" height=\"200\"><path d=\"M512.511 21.483c-271.163 0-491.028 219.86-491.028 491.028 0 271.173 219.856 491.03 491.028 491.03 26.554 0 48.08-21.527 48.08-48.08 0-26.554-21.526-48.08-48.08-48.08-218.065 0-394.869-176.804-394.869-394.87 0-218.06 176.813-394.869 394.87-394.869 218.065 0 394.869 176.804 394.869 394.87 0 26.553 21.526 48.08 48.08 48.08 26.553 0 48.08-21.527 48.08-48.08 0-271.173-219.857-491.03-491.03-491.03z\" p-id=\"3442\"></path></svg>";

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

/**
 * encode gif data
 * @param gifData
 * @param errorCallback
 * @returns
 */
function encode(gifData) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = {
            buf: growGifBuffer(new Uint8Array(0)),
            ptr: 0
        };
        // write header
        writeHeader(data, gifData.header);
        // write logical screen discriptor
        writeLSD(data, gifData.header);
        // write global color table
        gifData.header.gctFlag && writeCT(data, gifData.header.gctList);
        // write NETSCAPE application extension
        gifData.appExt && writeAppExt(data, gifData.appExt);
        // write frames
        yield writeFrames(data, gifData.frames, gifData.header.gctSize);
        // write end
        if (data.ptr >= data.buf.length) {
            data.buf = growGifBuffer(data.buf);
        }
        data.buf[data.ptr] = 0x3b;
        data.ptr++;
        return data.buf.slice(0, data.ptr);
    });
}
/**
 * write gif header info. just file type and gif version
 * this need 6 bytes
 * @param data
 * @param header
 */
function writeHeader(data, header) {
    data.buf[0] = header.type.charCodeAt(0);
    data.buf[1] = header.type.charCodeAt(1);
    data.buf[2] = header.type.charCodeAt(2);
    data.buf[3] = header.version.charCodeAt(0);
    data.buf[4] = header.version.charCodeAt(1);
    data.buf[5] = header.version.charCodeAt(2);
    data.ptr = 6;
}
/**
 * writeLSD
 * 7 ~ 13 bytes is logical screen descriptor
 * @param data
 * @param header
 */
function writeLSD(data, header) {
    // image width and height--little endian
    data.buf[6] = header.width & 0xff;
    data.buf[7] = header.width >> 8;
    data.buf[8] = header.height & 0xff;
    data.buf[9] = header.height >> 8;
    // global color table flag--the highest bit of 11th byte
    data.buf[10] = setBits(data.buf[10], 7, 1, Number(header.gctFlag));
    // color resolution--2 ~ 4th bit
    data.buf[10] = setBits(data.buf[10], 4, 3, header.cr - 1);
    // sort flag--5th bit, if this is 1, color table is sorted by frequncy
    data.buf[10] = setBits(data.buf[10], 3, 1, Number(header.sortFlag));
    // global color table size--3 bits, getBitsByNum(size) - 1
    data.buf[10] = setBits(data.buf[10], 0, 3, getBitsByNum(header.gctSize) - 1);
    // background color index
    data.buf[11] = header.bgIndex;
    // pixel aspect ratio
    data.buf[12] = header.pixelAspect;
    data.ptr = 13;
}
/**
 * write color table
 * @param data
 * @param ctList color table list
 */
function writeCT(data, ctList) {
    for (let i = 0, len = ctList.length; i < len; i++) {
        if (data.ptr + 3 >= data.buf.length) {
            data.buf = growGifBuffer(data.buf);
        }
        data.buf[data.ptr++] = ctList[i][0];
        data.buf[data.ptr++] = ctList[i][1];
        data.buf[data.ptr++] = ctList[i][2];
    }
}
/**
 * write application extension
 * @param data
 * @param appInfo
 */
function writeAppExt(data, appInfo) {
    // for NETSCAPE extension, the number of bytes is 18
    if (data.ptr + 18 >= data.buf.length) {
        data.buf = growGifBuffer(data.buf);
    }
    // extension label
    data.buf[data.ptr++] = 0x21;
    data.buf[data.ptr++] = 0xff;
    // block size--app name and verification code
    data.buf[data.ptr++] = appInfo.appName.length + appInfo.verification.length;
    // app name
    for (let i = 0, len = appInfo.appName.length; i < len; i++) {
        data.buf[data.ptr++] = appInfo.appName.charCodeAt(i);
    }
    // verification
    for (let i = 0, len = appInfo.verification.length; i < len; i++) {
        data.buf[data.ptr++] = appInfo.verification.charCodeAt(i);
    }
    // sub-block
    data.buf[data.ptr++] = 3;
    data.buf[data.ptr++] = appInfo.blockIdx;
    data.buf[data.ptr++] = appInfo.repetitionTimes & 0xff;
    data.buf[data.ptr++] = appInfo.repetitionTimes >> 8;
    // end
    data.buf[data.ptr++] = 0x00;
}
/**
 * write frames
 * @param data
 * @param frames
 * @param gctSize global color table size
 */
function writeFrames(data, frames, gctSize) {
    return __awaiter(this, void 0, void 0, function* () {
        // compress imageData in workers
        const framesMinCodeSize = [];
        const s = window.performance.now();
        const compressedImageData = yield Promise.all(frames.map((frame, idx) => {
            framesMinCodeSize[idx] = frame.lctFlag ? getBitsByNum(frame.lctSize) : getBitsByNum(gctSize);
            return worker({
                action: 'gifLzwEncode',
                param: [framesMinCodeSize[idx], frame.imageData]
                // there is no need of transferable in here, transferable buffer will cause detached buffer error when you call encode twice in a gifData
            });
        }));
        console.log('encode frames buffer: ', window.performance.now() - s);
        for (let i = 0, len = frames.length; i < len; i++) {
            const frame = frames[i];
            // write graphic control extension
            writeGCE(data, frame);
            // write image descriptor
            writeID(data, frame);
            // write local table flag
            frame.lctFlag && writeCT(data, frame.lctList);
            // write image data
            const compressedBuf = compressedImageData[i];
            // console.log(i, compressedBuf)
            const subBlockSize = compressedBuf.length + Math.ceil(compressedBuf.length / 255);
            while (data.ptr + 1 + subBlockSize >= data.buf.length) {
                data.buf = growGifBuffer(data.buf);
            }
            data.buf[data.ptr++] = framesMinCodeSize[i];
            let bolckSizeIdx = data.ptr;
            for (let i = 0, len = compressedBuf.length; i < len; i++) {
                if (bolckSizeIdx === data.ptr) {
                    data.ptr++;
                }
                data.buf[data.ptr] = compressedBuf[i];
                if (data.ptr - bolckSizeIdx === 255 || i + 1 === len) {
                    data.buf[bolckSizeIdx] = data.ptr - bolckSizeIdx;
                    bolckSizeIdx = data.ptr + 1;
                }
                data.ptr++;
            }
            data.buf[data.ptr++] = 0x0;
        }
    });
}
/**
 * write graphic control extension
 * @param data
 * @param frame
 */
function writeGCE(data, frame) {
    // number of bytes in GCE
    if (data.ptr + 8 >= data.buf.length) {
        data.buf = growGifBuffer(data.buf);
    }
    // extension label
    data.buf[data.ptr++] = 0x21;
    data.buf[data.ptr++] = 0xf9;
    // block size
    data.buf[data.ptr++] = 4;
    // disposal method
    data.buf[data.ptr] = setBits(data.buf[data.ptr], 2, 3, frame.disposalMethod);
    // user input flag
    data.buf[data.ptr] = setBits(data.buf[data.ptr], 1, 1, Number(frame.userInputFlag));
    // transparent color flag
    data.buf[data.ptr] = setBits(data.buf[data.ptr], 0, 1, Number(frame.transColorFlag));
    // delay
    data.ptr++;
    data.buf[data.ptr++] = (frame.delay / 10) & 0xff;
    data.buf[data.ptr++] = (frame.delay / 10) >> 8;
    // transparent color index
    data.buf[data.ptr++] = frame.transColorIdx;
    data.buf[data.ptr++] = 0x00;
}
/**
 * write image descriptor
 * @param data
 * @param frame
 */
function writeID(data, frame) {
    // number of bytes in this block
    if (data.ptr + 10 >= data.buf.length) {
        data.buf = growGifBuffer(data.buf);
    }
    // label
    data.buf[data.ptr++] = 0x2c;
    // left-top coordinates
    data.buf[data.ptr++] = frame.left & 0xff;
    data.buf[data.ptr++] = frame.left >> 8;
    data.buf[data.ptr++] = frame.top & 0xff;
    data.buf[data.ptr++] = frame.top >> 8;
    // width and height
    data.buf[data.ptr++] = frame.width & 0xff;
    data.buf[data.ptr++] = frame.width >> 8;
    data.buf[data.ptr++] = frame.height & 0xff;
    data.buf[data.ptr++] = frame.height >> 8;
    // local color table flag
    data.buf[data.ptr] = setBits(data.buf[data.ptr], 7, 1, Number(frame.lctFlag));
    // interlace flag
    data.buf[data.ptr] = setBits(data.buf[data.ptr], 6, 1, Number(frame.interlace));
    // sort flag
    data.buf[data.ptr] = setBits(data.buf[data.ptr], 2, 1, Number(frame.sortFlag));
    // local color table size
    data.buf[data.ptr] = setBits(data.buf[data.ptr], 0, 3, getBitsByNum(frame.lctSize) - 1);
    data.ptr++;
}
/**
 * grow gif buffer
 * @param buf
 * @returns
 */
function growGifBuffer(buf) {
    return bufferGrow(buf, 1024 * 1024);
}

const kit = {
    /**
     * decode gif (ArrayBuffer)
     */
    decode(buf, errorCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            return decode(buf, (msg, ev) => {
                return errorCallback(msg);
            });
        });
    },
    /**
     * encode gif
     */
    encode(gifData) {
        return __awaiter(this, void 0, void 0, function* () {
            return encode(gifData);
        });
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
    getFramesImageData(gifData) {
        return gifData.frames.map((_, index) => {
            return generateIndependentImageData(gifData, index);
        });
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
    getCompositeFramesImageData(gifData) {
        return gifData.frames.map((_, index) => {
            return generateFullCanvasImageData(gifData, index);
        });
    }
};

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
        setTimeout(() => {
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
                if (!this._config.src && typeof this._config.httpRequest !== 'function') {
                    return this._errCall(errMsgs.noGifUrl, 'onError');
                }
                yield this._getGif().catch((e) => this._errCall(e.message, 'onLoadError'));
            }
            if (this._gifBuffer === null) {
                return;
            }
            // try parse gifBuffer
            if (this.gifData === null) {
                const temp = yield decode(this._gifBuffer, this._errCall);
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
AMZGif.gifKit = kit;

module.exports = AMZGif;
