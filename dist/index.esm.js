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
    errData: '数据格式错误',
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
    const boxCenter = [(boxWidth / 2) >> 0, (boxHeight / 2) >> 0];
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

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qKgogICAgICogQG1vZHVsZSBoZWxwZXJzCiAgICAgKi8KICAgIC8qKgogICAgICogZ2V0Qml0cwogICAgICogQHBhcmFtIG51bSAxIGJ5dGUKICAgICAqIEBwYXJhbSBiaXRJZHggYml0IGluZGV4KGZyb20gcmlnaHQgdG8gbGVmdCkKICAgICAqIEBwYXJhbSBsZW5ndGggcmVxdWlyZWQgYml0cyBsZW5ndGgKICAgICAqLwogICAgZnVuY3Rpb24gZ2V0Qml0cyhudW0sIGJpdElkeCwgbGVuZ3RoKSB7CiAgICAgICAgcmV0dXJuIChudW0gPj4gYml0SWR4KSAmICgoMSA8PCBsZW5ndGgpIC0gMSk7CiAgICB9CiAgICAvKioKICAgICAqIHNldEJpdHMKICAgICAqIEBwYXJhbSB0YXJnZXROdW0gMSBieXRlCiAgICAgKiBAcGFyYW0gYml0SWR4IGJpdCBpbmRleCAoZnJvbSByaWdodCB0byBsZWZ0KQogICAgICogQHBhcmFtIGxlbmd0aCByZXF1aXJlZCBiaXRzIGxlbmd0aAogICAgICogQHBhcmFtIHNvdXJjZU51bQogICAgICogQHJldHVybnMKICAgICAqLwogICAgZnVuY3Rpb24gc2V0Qml0cyh0YXJnZXROdW0sIGJpdElkeCwgbGVuZ3RoLCBzb3VyY2VOdW0pIHsKICAgICAgICByZXR1cm4gKCgoKDEgPDwgbGVuZ3RoKSAtIDEpICYgc291cmNlTnVtKSA8PCBiaXRJZHgpIHwgdGFyZ2V0TnVtOwogICAgfQoKICAgIC8vIGh0dHBzOi8vd3d3LmNuYmxvZ3MuY29tL2ppYW5nMDgvYXJ0aWNsZXMvMzE3MTMxOS5odG1sCiAgICBjb25zdCBHaWZMWlcgPSB7CiAgICAgICAgLyoqCiAgICAgICAgICogZGVjb2RlIGdpZiBidWZmZXIKICAgICAgICAgKiBAcGFyYW0gY29kZVNpemUKICAgICAgICAgKiBAcGFyYW0gYnVmCiAgICAgICAgICogQHJldHVybnMKICAgICAgICAgKi8KICAgICAgICBkZWNvZGU6IChjb2RlU2l6ZSwgYnVmKSA9PiB7CiAgICAgICAgICAgIGZ1bmN0aW9uIGdlblRhYmxlKCkgewogICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBcnJheSgyICoqIGNvZGVTaXplICsgMikuZmlsbCgwKS5tYXAoKF8sIGluZGV4KSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKGluZGV4KSk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgbGV0IHRhYmxlID0gZ2VuVGFibGUoKTsKICAgICAgICAgICAgY29uc3QgY2xlYXJDb2RlID0gMiAqKiBjb2RlU2l6ZTsKICAgICAgICAgICAgY29uc3QgZW5kQ29kZSA9IDIgKiogY29kZVNpemUgKyAxOwogICAgICAgICAgICBsZXQgYml0TGVuZ3RoID0gY29kZVNpemUgKyAxOwogICAgICAgICAgICBsZXQgc3RyZWFtID0gJyc7CiAgICAgICAgICAgIGxldCBkZWNvZGVTdGFydCA9IHRydWU7CiAgICAgICAgICAgIGNvbnN0IGJ5dGVMZW4gPSBidWYubGVuZ3RoOwogICAgICAgICAgICBsZXQgYnl0ZUlkeCA9IDA7CiAgICAgICAgICAgIGxldCBiaXRJZHggPSAwOwogICAgICAgICAgICBsZXQgcmVxdWlyZWRCaXRzID0gYml0TGVuZ3RoOwogICAgICAgICAgICBsZXQgY29kZSA9IDA7CiAgICAgICAgICAgIGxldCBrID0gJyc7CiAgICAgICAgICAgIGxldCBvbGRDb2RlID0gMDsKICAgICAgICAgICAgd2hpbGUgKGJ5dGVJZHggPCBieXRlTGVuKSB7CiAgICAgICAgICAgICAgICByZXF1aXJlZEJpdHMgPSBiaXRMZW5ndGg7CiAgICAgICAgICAgICAgICBjb2RlID0gMDsKICAgICAgICAgICAgICAgIC8vIHJlYWQgY29kZQogICAgICAgICAgICAgICAgd2hpbGUgKHJlcXVpcmVkQml0cyAhPT0gMCkgewogICAgICAgICAgICAgICAgICAgIGlmICg4IC0gYml0SWR4ID49IHJlcXVpcmVkQml0cykgewogICAgICAgICAgICAgICAgICAgICAgICBjb2RlICs9IGdldEJpdHMoYnVmW2J5dGVJZHhdLCBiaXRJZHgsIHJlcXVpcmVkQml0cykgPDwgKGJpdExlbmd0aCAtIHJlcXVpcmVkQml0cyk7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdElkeCArPSByZXF1aXJlZEJpdHM7CiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkQml0cyA9IDA7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICBjb2RlICs9IGdldEJpdHMoYnVmW2J5dGVJZHhdLCBiaXRJZHgsIDggLSBiaXRJZHgpIDw8IChiaXRMZW5ndGggLSByZXF1aXJlZEJpdHMpOwogICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZEJpdHMgLT0gOCAtIGJpdElkeDsKICAgICAgICAgICAgICAgICAgICAgICAgYml0SWR4ID0gODsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcmZsb3cKICAgICAgICAgICAgICAgICAgICBpZiAoYml0SWR4ID09PSA4KSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVJZHgrKzsKICAgICAgICAgICAgICAgICAgICAgICAgYml0SWR4ID0gMDsKICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ5dGVJZHggPj0gYnl0ZUxlbikKICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSBlbmRDb2RlKQogICAgICAgICAgICAgICAgICAgIGJyZWFrOwogICAgICAgICAgICAgICAgLy8gY29kZSBpcyBjbGVhciBjb2RlLCByZXNldCB0YWJsZSBhbmQgb3RoZXJzCiAgICAgICAgICAgICAgICBpZiAoY29kZSA9PT0gY2xlYXJDb2RlKSB7CiAgICAgICAgICAgICAgICAgICAgdGFibGUgPSBnZW5UYWJsZSgpOwogICAgICAgICAgICAgICAgICAgIGJpdExlbmd0aCA9IGNvZGVTaXplICsgMTsKICAgICAgICAgICAgICAgICAgICBkZWNvZGVTdGFydCA9IHRydWU7CiAgICAgICAgICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAvLyBpZiBjb2RlIGV4aXN0cyBpbiB0YWJsZSwgYXBwZW5kIGNvZGUgdG8gc3RyZWFtCiAgICAgICAgICAgICAgICBpZiAodGFibGVbY29kZV0gIT09IHVuZGVmaW5lZCkgewogICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IGNvZGUKICAgICAgICAgICAgICAgICAgICBpZiAoZGVjb2RlU3RhcnQpIHsKICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtICs9IHRhYmxlW2NvZGVdOwogICAgICAgICAgICAgICAgICAgICAgICBvbGRDb2RlID0gY29kZTsKICAgICAgICAgICAgICAgICAgICAgICAgZGVjb2RlU3RhcnQgPSBmYWxzZTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbSArPSB0YWJsZVtjb2RlXTsKICAgICAgICAgICAgICAgICAgICAgICAgayA9IHRhYmxlW2NvZGVdWzBdOwogICAgICAgICAgICAgICAgICAgICAgICB0YWJsZS5wdXNoKHRhYmxlW29sZENvZGVdICsgayk7CiAgICAgICAgICAgICAgICAgICAgICAgIG9sZENvZGUgPSBjb2RlOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGVsc2UgewogICAgICAgICAgICAgICAgICAgIC8vIGlmIG5vdAogICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRhYmxlLCBjb2RlLCBvbGRDb2RlKQogICAgICAgICAgICAgICAgICAgIGlmICh0YWJsZVtvbGRDb2RlXSA9PT0gdW5kZWZpbmVkKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9sZENvZGUsIHN0cmVhbS5sZW5ndGgpOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBrID0gdGFibGVbb2xkQ29kZV1bMF07CiAgICAgICAgICAgICAgICAgICAgc3RyZWFtICs9IHRhYmxlW29sZENvZGVdICsgazsKICAgICAgICAgICAgICAgICAgICB0YWJsZS5wdXNoKHRhYmxlW29sZENvZGVdICsgayk7CiAgICAgICAgICAgICAgICAgICAgb2xkQ29kZSA9IGNvZGU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAvLyBjaGVjayBjYXAgb2YgdGFibGUKICAgICAgICAgICAgICAgIGlmICh0YWJsZS5sZW5ndGggPj0gMiAqKiBiaXRMZW5ndGgpIHsKICAgICAgICAgICAgICAgICAgICBpZiAoYml0TGVuZ3RoIDwgMTIpIHsKICAgICAgICAgICAgICAgICAgICAgICAgYml0TGVuZ3RoKys7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIGNvbnN0IHJlcyA9IG5ldyBVaW50OEFycmF5KHN0cmVhbS5sZW5ndGgpOwogICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmVhbS5sZW5ndGg7IGkrKykgewogICAgICAgICAgICAgICAgcmVzW2ldID0gc3RyZWFtLmNoYXJDb2RlQXQoaSk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgcmV0dXJuIHJlczsKICAgICAgICB9LAogICAgICAgIC8qKgogICAgICAgICAqIGVuY29kZSBnaWYgY29sb3IgaW5kaWNlcyBidWZmZXIKICAgICAgICAgKiBAcGFyYW0gY29kZVNpemUKICAgICAgICAgKiBAcGFyYW0gYnVmCiAgICAgICAgICovCiAgICAgICAgZW5jb2RlOiAoY29kZVNpemUsIGJ1ZikgPT4gewogICAgICAgICAgICAvLyBnZW5lcmF0ZSBvcmlnaW5hbCBjb2RlIHRhYmxlCiAgICAgICAgICAgIGZ1bmN0aW9uIGdlblRhYmxlKCkgewogICAgICAgICAgICAgICAgY29uc3QgdCA9IG5ldyBNYXAoKTsKICAgICAgICAgICAgICAgIG5ldyBBcnJheSgyICoqIGNvZGVTaXplKS5maWxsKDApLm1hcCgoXywgaW5kZXgpID0+IHsKICAgICAgICAgICAgICAgICAgICB0LnNldChTdHJpbmcuZnJvbUNoYXJDb2RlKGluZGV4KSwgaW5kZXgpOwogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICByZXR1cm4gdDsKICAgICAgICAgICAgfQogICAgICAgICAgICAvLyB3cml0ZSB0byBidWYKICAgICAgICAgICAgZnVuY3Rpb24gd3JpdGUoY29kZSkgewogICAgICAgICAgICAgICAgbGV0IHJlcXVpcmVkQml0cyA9IGJpdExlbmd0aDsKICAgICAgICAgICAgICAgIC8vIGlmIHN0cmVhbSBtYXkgbm90IGVub3VnaCwgZXhwYW5kIHN0cmVhbQogICAgICAgICAgICAgICAgaWYgKGJ5dGVJZHggKyAyID49IHN0cmVhbS5sZW5ndGgpIHsKICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdTdHJlYW0gPSBuZXcgVWludDhBcnJheShzdHJlYW0ubGVuZ3RoICsgMjU2KTsKICAgICAgICAgICAgICAgICAgICBuZXdTdHJlYW0uc2V0KHN0cmVhbSk7CiAgICAgICAgICAgICAgICAgICAgc3RyZWFtID0gbmV3U3RyZWFtOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgd2hpbGUgKHJlcXVpcmVkQml0cykgewogICAgICAgICAgICAgICAgICAgIGlmICg4IC0gYml0SWR4ID49IHJlcXVpcmVkQml0cykgewogICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1bYnl0ZUlkeF0gPSBzZXRCaXRzKHN0cmVhbVtieXRlSWR4XSwgYml0SWR4LCByZXF1aXJlZEJpdHMsIGNvZGUpOwogICAgICAgICAgICAgICAgICAgICAgICBiaXRJZHggKz0gcmVxdWlyZWRCaXRzOwogICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZEJpdHMgPSAwOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBlbHNlIHsKICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtW2J5dGVJZHhdID0gc2V0Qml0cyhzdHJlYW1bYnl0ZUlkeF0sIGJpdElkeCwgOCAtIGJpdElkeCwgY29kZSk7CiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPSBjb2RlID4+ICg4IC0gYml0SWR4KTsKICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRCaXRzIC09IDggLSBiaXRJZHg7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdElkeCA9IDg7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIGlmIChiaXRJZHggPT09IDgpIHsKICAgICAgICAgICAgICAgICAgICAgICAgYml0SWR4ID0gMDsKICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZUlkeCsrOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgfQogICAgICAgICAgICBsZXQgdGFibGUgPSBnZW5UYWJsZSgpOwogICAgICAgICAgICBjb25zdCBjbGVhckNvZGUgPSAyICoqIGNvZGVTaXplOwogICAgICAgICAgICBjb25zdCBlbmRDb2RlID0gMiAqKiBjb2RlU2l6ZSArIDE7CiAgICAgICAgICAgIGxldCB0YWJsZUxlbmd0aCA9IDIgKiogY29kZVNpemUgKyAyOwogICAgICAgICAgICBsZXQgYml0TGVuZ3RoID0gY29kZVNpemUgKyAxOwogICAgICAgICAgICBsZXQgY3VyQml0TWF4VGFibGVMZW5ndGggPSAyICoqIGJpdExlbmd0aDsKICAgICAgICAgICAgLy8gdGhpcyB3aWxsIGFmZmVjdCB0aGUgc2l6ZSBvZiB0aGUgY29tcHJlc3NlZCBidWYKICAgICAgICAgICAgLy8gNDA5MyBpcyBtb3JlIGVmZmljZW50IGluIHRoZSBleGFtcGxlIHBpYyAnY2F0MS5naWYnCiAgICAgICAgICAgIC8vIGxldCBtYXhUYWJsZUxlbmd0aCA9IDIgKiogMTIKICAgICAgICAgICAgY29uc3QgbWF4VGFibGVMZW5ndGggPSA0MDkzOwogICAgICAgICAgICBsZXQgc3RyZWFtID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTsKICAgICAgICAgICAgbGV0IGJ5dGVJZHggPSAwOwogICAgICAgICAgICBsZXQgYml0SWR4ID0gMDsKICAgICAgICAgICAgbGV0IHAgPSAnJzsKICAgICAgICAgICAgbGV0IGMgPSAnJzsKICAgICAgICAgICAgLy8gZmlyc3QgY29kZSBpbiBkYXRhIHN0cmVhbSBtdXN0IGJlIGNsZWFyIGNvZGUKICAgICAgICAgICAgd3JpdGUoY2xlYXJDb2RlKTsKICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkrKykgewogICAgICAgICAgICAgICAgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKTsKICAgICAgICAgICAgICAgIGlmICh0YWJsZS5oYXMocCArIGMpKSB7CiAgICAgICAgICAgICAgICAgICAgcCA9IHAgKyBjOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgd3JpdGUodGFibGUuZ2V0KHApKTsKICAgICAgICAgICAgICAgICAgICBpZiAodGFibGVMZW5ndGggPT09IG1heFRhYmxlTGVuZ3RoKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlKGNsZWFyQ29kZSk7CiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2V0IGNvZGUgdGFibGUgYW5kIGJpdExlbmd0aAogICAgICAgICAgICAgICAgICAgICAgICB0YWJsZSA9IGdlblRhYmxlKCk7CiAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlTGVuZ3RoID0gMiAqKiBjb2RlU2l6ZSArIDI7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdExlbmd0aCA9IGNvZGVTaXplICsgMTsKICAgICAgICAgICAgICAgICAgICAgICAgY3VyQml0TWF4VGFibGVMZW5ndGggPSAyICoqIGJpdExlbmd0aDsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGFibGVMZW5ndGggPT09IGN1ckJpdE1heFRhYmxlTGVuZ3RoKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGJpdExlbmd0aCsrOwogICAgICAgICAgICAgICAgICAgICAgICBjdXJCaXRNYXhUYWJsZUxlbmd0aCA9IDIgKiogYml0TGVuZ3RoOwogICAgICAgICAgICAgICAgICAgICAgICB0YWJsZS5zZXQocCArIGMsIHRhYmxlTGVuZ3RoKyspOwogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBlbHNlIHsKICAgICAgICAgICAgICAgICAgICAgICAgdGFibGUuc2V0KHAgKyBjLCB0YWJsZUxlbmd0aCsrKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgcCA9IGM7CiAgICAgICAgICAgICAgICAgICAgYyA9ICcnOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIGlmIChwKSB7CiAgICAgICAgICAgICAgICB3cml0ZSh0YWJsZS5nZXQocCkpOwogICAgICAgICAgICB9CiAgICAgICAgICAgIHdyaXRlKGVuZENvZGUpOwogICAgICAgICAgICBsZXQgZmluYWwgPSBudWxsOwogICAgICAgICAgICBpZiAoYml0SWR4KSB7CiAgICAgICAgICAgICAgICBmaW5hbCA9IHN0cmVhbS5zbGljZSgwLCBieXRlSWR4ICsgMSk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICBmaW5hbCA9IHN0cmVhbS5zbGljZSgwLCBieXRlSWR4KTsKICAgICAgICAgICAgfQogICAgICAgICAgICByZXR1cm4gZmluYWw7CiAgICAgICAgfSwKICAgIH07CgogICAgLy8gbGV0IGNvbnNvbGVDb3VudCA9IDAKICAgIC8qKgogICAgICogY290cmVlIGNvbG9yIHF1YW50aXphdGlvbgogICAgICogaHR0cHM6Ly96aHVhbmxhbi56aGlodS5jb20vcC8yMjAxNzcwMzcKICAgICAqLwogICAgY2xhc3MgUXVhbnRpemVyIHsKICAgICAgICBjb25zdHJ1Y3RvcigpIHsKICAgICAgICAgICAgLy8gbWF4IGNvbG9yIG51bXMtLSBhIHNsb3QgZm9yIHRyYW5zcGFyYW50IGNvbG9yLCBhIHNsb3QgZm9yIGJhY2tncm91bmQgY29sb3IKICAgICAgICAgICAgdGhpcy5tYXhDb2xvciA9IDI1NDsKICAgICAgICAgICAgLy8gY29sb3IgY291bnQKICAgICAgICAgICAgdGhpcy5jb2xvckNvdW50ID0gMDsKICAgICAgICAgICAgdGhpcy50cmVlID0gbmV3IFRyZWVOb2RlKCk7CiAgICAgICAgICAgIHRoaXMudHJlZS5sZXZlbCA9IC0xOwogICAgICAgICAgICB0aGlzLmxldmVsTm9kZXMgPSBuZXcgQXJyYXkoOCkuZmlsbCgwKS5tYXAoKCkgPT4gewogICAgICAgICAgICAgICAgcmV0dXJuIFtdOwogICAgICAgICAgICB9KTsKICAgICAgICB9CiAgICAgICAgLy8gYWRkIGNvbG9yCiAgICAgICAgYWRkQ29sb3IociwgZywgYikgewogICAgICAgICAgICBsZXQgcGFyZW50Tm9kZSA9IHRoaXMudHJlZTsKICAgICAgICAgICAgZm9yIChsZXQgaSA9IDc7IGkgPj0gMDsgaS0tKSB7CiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSAoZ2V0Qml0cyhyLCBpLCAxKSA8PCAyKSArIChnZXRCaXRzKGcsIGksIDEpIDw8IDEpICsgZ2V0Qml0cyhiLCBpLCAxKTsKICAgICAgICAgICAgICAgIGxldCBub2RlID0gcGFyZW50Tm9kZS5ub2Rlc1tpZHhdOwogICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5vZGUKICAgICAgICAgICAgICAgIGlmICghbm9kZSkgewogICAgICAgICAgICAgICAgICAgIHBhcmVudE5vZGUubm9kZXNbaWR4XSA9IG5ldyBUcmVlTm9kZSgpOwogICAgICAgICAgICAgICAgICAgIG5vZGUgPSBwYXJlbnROb2RlLm5vZGVzW2lkeF07CiAgICAgICAgICAgICAgICAgICAgbm9kZS5sZXZlbCA9IDcgLSBpOwogICAgICAgICAgICAgICAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50Tm9kZTsKICAgICAgICAgICAgICAgICAgICBwYXJlbnROb2RlLm5vZGVzQ291bnQrKzsKICAgICAgICAgICAgICAgICAgICBub2RlLmlkeEluTGV2ZWxOb2RlcyA9IHRoaXMubGV2ZWxOb2Rlc1tub2RlLmxldmVsXS5sZW5ndGg7CiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbE5vZGVzW25vZGUubGV2ZWxdLnB1c2gobm9kZSk7CiAgICAgICAgICAgICAgICAgICAgLy8gbGFzdCBsZXZlbCwgY29sb3IgY291bnQgKyAxCiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubGV2ZWwgPT09IDcpIHsKICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xvckNvdW50Kys7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgbm9kZS5jb3VudCsrOwogICAgICAgICAgICAgICAgbm9kZS5yZWRTdW0gKz0gcjsKICAgICAgICAgICAgICAgIG5vZGUuZ3JlZW5TdW0gKz0gZzsKICAgICAgICAgICAgICAgIG5vZGUuYmx1ZVN1bSArPSBiOwogICAgICAgICAgICAgICAgaWYgKG5vZGUuaXNMZWFmKSB7CiAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBpZiAobm9kZS5sZXZlbCA9PT0gNykgewogICAgICAgICAgICAgICAgICAgIG5vZGUuaXNMZWFmID0gdHJ1ZTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHBhcmVudE5vZGUgPSBub2RlOwogICAgICAgICAgICB9CiAgICAgICAgICAgIC8vIGNoZWNrIG1heCBjb2xvciBjb3VudAogICAgICAgICAgICBpZiAodGhpcy5jb2xvckNvdW50ID4gdGhpcy5tYXhDb2xvcikgewogICAgICAgICAgICAgICAgdGhpcy5yZWR1Y2VDb2xvcigpOwogICAgICAgICAgICB9CiAgICAgICAgfQogICAgICAgIC8vIGdldCBjb2xvci0tZ2V0IHRyYW5zZm9ybWVkIGNvbG9yCiAgICAgICAgZ2V0Q29sb3IociwgZywgYikgewogICAgICAgICAgICBsZXQgcGFyZW50Tm9kZSA9IHRoaXMudHJlZTsKICAgICAgICAgICAgY29uc3QgY29sb3IgPSBbMCwgMCwgMCwgMF07CiAgICAgICAgICAgIGZvciAobGV0IGkgPSA3OyBpID49IDA7IGktLSkgewogICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gKGdldEJpdHMociwgaSwgMSkgPDwgMikgKyAoZ2V0Qml0cyhnLCBpLCAxKSA8PCAxKSArIGdldEJpdHMoYiwgaSwgMSk7CiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gcGFyZW50Tm9kZS5ub2Rlc1tpZHhdOwogICAgICAgICAgICAgICAgaWYgKCFub2RlKSB7CiAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBpZiAobm9kZS5pc0xlYWYpIHsKICAgICAgICAgICAgICAgICAgICBjb2xvclswXSA9IChub2RlLnJlZFN1bSAvIG5vZGUuY291bnQpID4+IDA7CiAgICAgICAgICAgICAgICAgICAgY29sb3JbMV0gPSAobm9kZS5ncmVlblN1bSAvIG5vZGUuY291bnQpID4+IDA7CiAgICAgICAgICAgICAgICAgICAgY29sb3JbMl0gPSAobm9kZS5ibHVlU3VtIC8gbm9kZS5jb3VudCkgPj4gMDsKICAgICAgICAgICAgICAgICAgICBjb2xvclszXSA9IDE7CiAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBwYXJlbnROb2RlID0gbm9kZTsKICAgICAgICAgICAgfQogICAgICAgICAgICByZXR1cm4gY29sb3I7CiAgICAgICAgfQogICAgICAgIC8vIHJlZHVjZSBjb2xvcgogICAgICAgIHJlZHVjZUNvbG9yKCkgewogICAgICAgICAgICAvKioKICAgICAgICAgICAgICogMS4gbm9kZSBoYXMgdHdvIHN1YiBub2RlcyBhdCBsZWFzdAogICAgICAgICAgICAgKiAyLiBpZiB0aGVyZSBhcmUgbm9kZXMgaW4gc2FtZSBsZXZlbCBtYXRjaCAxLiwgY2hvb3NlIHRoZSBvbmUgaGFzIGxlc3MgcGl4ZWxzCiAgICAgICAgICAgICAqIDMuIHNldCB0aGUgbm9kZSBhcyBsZWFmIG5vZGUsIGNvbG9yIHZhbHVlIGlzIChyZWRTdW0sIGdyZWVuU3VtLCBibHVlU3VtKSAvIGNvdW50CiAgICAgICAgICAgICAqIDQuIGRlbGV0ZSBzdWIgbm9kZXMKICAgICAgICAgICAgICovCiAgICAgICAgICAgIGxldCB0YXJnZXROb2RlID0gbnVsbDsKICAgICAgICAgICAgbGV0IG1pbkNvdW50ID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7CiAgICAgICAgICAgIC8vIGZyb20gYm90dG9tIHRvIHRvcCwgdGhlcmUgYXJlIGFsbCBsZWFmIG5vZGVzIGluIGxldmVsIDcsIHNraXAKICAgICAgICAgICAgZm9yIChsZXQgaSA9IDY7IGkgPj0gMDsgaS0tKSB7CiAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IHRoaXMubGV2ZWxOb2Rlc1tpXTsKICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCA9IDAsIGxlbiA9IG5vZGVzLmxlbmd0aDsgaWR4IDwgbGVuOyBpZHgrKykgewogICAgICAgICAgICAgICAgICAgIGlmIChub2Rlc1tpZHhdKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpZHhdOwogICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5vZGUuaXNMZWFmICYmIG5vZGUubm9kZXNDb3VudCA+IDEgJiYgbm9kZS5jb3VudCA8IG1pbkNvdW50KSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXROb2RlID0gbm9kZTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkNvdW50ID0gbm9kZS5jb3VudDsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmICh0YXJnZXROb2RlKSB7CiAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgLy8gZGVsZXRlIHN1YiBub2RlcwogICAgICAgICAgICBpZiAodGFyZ2V0Tm9kZSkgewogICAgICAgICAgICAgICAgdGhpcy5kZWxldGVTdWJOb2Rlcyh0YXJnZXROb2RlKTsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICAvLyBkZWxldGUgc3ViIG5vZGVzCiAgICAgICAgZGVsZXRlU3ViTm9kZXModGFyZ2V0Tm9kZSkgewogICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGFyZ2V0Tm9kZS5ub2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykgewogICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRhcmdldE5vZGUubm9kZXNbaV07CiAgICAgICAgICAgICAgICBpZiAobm9kZSkgewogICAgICAgICAgICAgICAgICAgIGlmICghbm9kZS5pc0xlYWYpIHsKICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxldGVTdWJOb2Rlcyhub2RlKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZXZlbE5vZGVzW25vZGUubGV2ZWxdW25vZGUuaWR4SW5MZXZlbE5vZGVzXSA9IG51bGw7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgdGhpcy5jb2xvckNvdW50IC09IHRhcmdldE5vZGUubm9kZXNDb3VudCAtIDE7CiAgICAgICAgICAgIHRhcmdldE5vZGUubm9kZXMgPSBbXTsKICAgICAgICAgICAgdGFyZ2V0Tm9kZS5ub2Rlc0NvdW50ID0gMDsKICAgICAgICAgICAgdGFyZ2V0Tm9kZS5pc0xlYWYgPSB0cnVlOwogICAgICAgIH0KICAgIH0KICAgIGNsYXNzIFRyZWVOb2RlIHsKICAgICAgICBjb25zdHJ1Y3RvcigpIHsKICAgICAgICAgICAgdGhpcy5pc0xlYWYgPSBmYWxzZTsKICAgICAgICAgICAgdGhpcy5sZXZlbCA9IDA7CiAgICAgICAgICAgIHRoaXMuY291bnQgPSAwOwogICAgICAgICAgICB0aGlzLnJlZFN1bSA9IDA7CiAgICAgICAgICAgIHRoaXMuZ3JlZW5TdW0gPSAwOwogICAgICAgICAgICB0aGlzLmJsdWVTdW0gPSAwOwogICAgICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7CiAgICAgICAgICAgIHRoaXMubm9kZXMgPSBbXTsKICAgICAgICAgICAgdGhpcy5ub2Rlc0NvdW50ID0gMDsKICAgICAgICAgICAgdGhpcy5pZHhJbkxldmVsTm9kZXMgPSAwOwogICAgICAgIH0KICAgIH0KCiAgICAvKioKICAgICAqIGdldCBpbmRleCBieSBwb2ludAogICAgICovCiAgICBmdW5jdGlvbiBnZXRJbmRleEJ5UG9pbnQoaW1nRGF0YSwgeCwgeSkgewogICAgICAgIHJldHVybiAoeSAqIGltZ0RhdGEud2lkdGggKyB4KSAqIDQ7CiAgICB9CiAgICAvKioKICAgICAqIGdldCBwb2ludCBieSBpbmRleAogICAgICovCiAgICBmdW5jdGlvbiBnZXRQb2ludEJ5SW5kZXgoaW1nRGF0YSwgaW5kZXgpIHsKICAgICAgICByZXR1cm4gewogICAgICAgICAgICB4OiAoaW5kZXggLyA0KSAlIGltZ0RhdGEud2lkdGgsCiAgICAgICAgICAgIHk6IChpbmRleCAvIDQpID4+IDAKICAgICAgICB9OwogICAgfQogICAgLyoqCiAgICAgKiByZ2JhMnJnYgogICAgICovCiAgICBmdW5jdGlvbiByZ2JhMnJnYihjb2xvciwgc3RhcnQgPSAwKSB7CiAgICAgICAgaWYgKGNvbG9yLmxlbmd0aCA+PSBzdGFydCArIDQgJiYgY29sb3Jbc3RhcnQgKyAzXSA+IDAgJiYgY29sb3Jbc3RhcnQgKyAzXSA8IDI1NSkgewogICAgICAgICAgICBjb25zdCBhbHBoYSA9IGNvbG9yW3N0YXJ0ICsgM10gLyAyNTU7CiAgICAgICAgICAgIGNvbG9yW3N0YXJ0XSA9IChjb2xvcltzdGFydF0gKiBhbHBoYSkgPj4gMDsKICAgICAgICAgICAgY29sb3Jbc3RhcnQgKyAxXSA9IChjb2xvcltzdGFydCArIDFdICogYWxwaGEpID4+IDA7CiAgICAgICAgICAgIGNvbG9yW3N0YXJ0ICsgMl0gPSAoY29sb3Jbc3RhcnQgKyAyXSAqIGFscGhhKSA+PiAwOwogICAgICAgICAgICBjb2xvcltzdGFydCArIDNdID0gMjU1OwogICAgICAgIH0KICAgICAgICByZXR1cm4gY29sb3I7CiAgICB9CiAgICAvKioKICAgICAqIGNvbG9yIHRyYW5zZm9ybSB0byBpbmRpY2VzCiAgICAgKi8KICAgIGZ1bmN0aW9uIGNvbG9yVHJhbnNmb3JtKGZyYW1lcywgZGl0aGVyaW5nID0gZmFsc2UpIHsKICAgICAgICBjb25zdCBkYXRhID0gewogICAgICAgICAgICBjb2xvclRhYmxlOiBbXSwKICAgICAgICAgICAgZnJhbWVzOiBbXSwKICAgICAgICB9OwogICAgICAgIGlmICghZnJhbWVzLmxlbmd0aCkgewogICAgICAgICAgICByZXR1cm4gZGF0YTsKICAgICAgICB9CiAgICAgICAgY29uc3QgY29sb3JDYWNoZSA9IG5ldyBNYXAoKTsKICAgICAgICBjb25zdCBpbmRpY2VzQ2FjaGUgPSBuZXcgTWFwKCk7CiAgICAgICAgY29uc3QgcXVhbnRpemVyID0gbmV3IFF1YW50aXplcigpOwogICAgICAgIGxldCB0cmFuc3BhcmFudENvbG9yID0gbnVsbDsKICAgICAgICBsZXQgdHJhbnNwYXJhbnRDb2xvcklkeCA9IC0xOwogICAgICAgIC8vIHF1YW50aXplCiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGZyYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykgewogICAgICAgICAgICBjb25zdCBpbWFnZURhdGEgPSBmcmFtZXNbaV0uaW1hZ2VEYXRhOwogICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbGVuMiA9IGltYWdlRGF0YS53aWR0aCAqIGltYWdlRGF0YS5oZWlnaHQgKiA0OyBqIDwgbGVuMjsgaiArPSA0KSB7CiAgICAgICAgICAgICAgICAvLyBzZXQgdHJhbnNwYXJhbnQgY29sb3IKICAgICAgICAgICAgICAgIGlmIChpbWFnZURhdGEuZGF0YVtqICsgM10gPT09IDApIHsKICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNwYXJhbnRDb2xvciA9PT0gbnVsbCkgewogICAgICAgICAgICAgICAgICAgICAgICB0cmFuc3BhcmFudENvbG9yID0gW2ltYWdlRGF0YS5kYXRhW2pdLCBpbWFnZURhdGEuZGF0YVtqICsgMV0sIGltYWdlRGF0YS5kYXRhW2ogKyAyXSwgMF07CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgLy8gcmdiYSB0byByZ2IsIGNoYW5nZSB2YWx1ZSBpbiBwbGFjZQogICAgICAgICAgICAgICAgICAgIHJnYmEycmdiKGltYWdlRGF0YS5kYXRhLCBqKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHF1YW50aXplci5hZGRDb2xvcihpbWFnZURhdGEuZGF0YVtqXSwgaW1hZ2VEYXRhLmRhdGFbaiArIDFdLCBpbWFnZURhdGEuZGF0YVtqICsgMl0pOwogICAgICAgICAgICB9CiAgICAgICAgfQogICAgICAgIGNvbnNvbGUubG9nKHF1YW50aXplcik7CiAgICAgICAgdHJhbnNwYXJhbnRDb2xvcklkeCA9IHF1YW50aXplci5jb2xvckNvdW50OwogICAgICAgIC8vIHNldCBjb2xvciBhbmQgaW5kaWNlcwogICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBmcmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHsKICAgICAgICAgICAgY29uc3QgaW1hZ2VEYXRhID0gbmV3IEltYWdlRGF0YShmcmFtZXNbaV0uaW1hZ2VEYXRhLndpZHRoLCBmcmFtZXNbaV0uaW1hZ2VEYXRhLmhlaWdodCk7CiAgICAgICAgICAgIGltYWdlRGF0YS5kYXRhLnNldChmcmFtZXNbaV0uaW1hZ2VEYXRhLmRhdGEpOwogICAgICAgICAgICAvLyBjb25zdCBpbWFnZURhdGEgPSBmcmFtZXNbaV0uaW1hZ2VEYXRhCiAgICAgICAgICAgIGNvbnN0IGluZGljZXMgPSBuZXcgVWludDhBcnJheShpbWFnZURhdGEud2lkdGggKiBpbWFnZURhdGEuaGVpZ2h0KTsKICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIHAgPSAwLCBsZW4yID0gaW1hZ2VEYXRhLndpZHRoICogaW1hZ2VEYXRhLmhlaWdodCAqIDQ7IGogPCBsZW4yOyBqICs9IDQsIHArKykgewogICAgICAgICAgICAgICAgaWYgKGltYWdlRGF0YS5kYXRhW2ogKyAzXSAhPT0gMCkgewogICAgICAgICAgICAgICAgICAgIGxldCBuZXdDb2xvciA9IG51bGw7CiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gW2ltYWdlRGF0YS5kYXRhW2pdLCBpbWFnZURhdGEuZGF0YVtqICsgMV0sIGltYWdlRGF0YS5kYXRhW2ogKyAyXV0uam9pbigpOwogICAgICAgICAgICAgICAgICAgIGlmIChjb2xvckNhY2hlLmhhcyhrZXkpKSB7CiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbG9yID0gY29sb3JDYWNoZS5nZXQoa2V5KTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NvbG9yID0gcXVhbnRpemVyLmdldENvbG9yKGltYWdlRGF0YS5kYXRhW2pdLCBpbWFnZURhdGEuZGF0YVtqICsgMV0sIGltYWdlRGF0YS5kYXRhW2ogKyAyXSk7CiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yQ2FjaGUuc2V0KGtleSwgbmV3Q29sb3IpOwogICAgICAgICAgICAgICAgICAgICAgICAvLyBmaWxsIGNvbG9yIHRhYmxlCiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5kaWNlc0NhY2hlLmhhcyhuZXdDb2xvci5qb2luKCkpKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzQ2FjaGUuc2V0KG5ld0NvbG9yLmpvaW4oKSwgZGF0YS5jb2xvclRhYmxlLmxlbmd0aCk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbG9yVGFibGUucHVzaChbbmV3Q29sb3JbMF0sIG5ld0NvbG9yWzFdLCBuZXdDb2xvclsyXV0pOwogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIGltYWdlRGF0YS5kYXRhW2pdID0gbmV3Q29sb3JbMF07CiAgICAgICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaiArIDFdID0gbmV3Q29sb3JbMV07CiAgICAgICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaiArIDJdID0gbmV3Q29sb3JbMl07CiAgICAgICAgICAgICAgICAgICAgaW5kaWNlc1twXSA9IGluZGljZXNDYWNoZS5nZXQobmV3Q29sb3Iuam9pbigpKTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGVsc2UgewogICAgICAgICAgICAgICAgICAgIGluZGljZXNbcF0gPSB0cmFuc3BhcmFudENvbG9ySWR4OwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIGRhdGEuZnJhbWVzLnB1c2goewogICAgICAgICAgICAgICAgaW1hZ2VEYXRhLAogICAgICAgICAgICAgICAgaW5kaWNlcywKICAgICAgICAgICAgfSk7CiAgICAgICAgfQogICAgICAgIC8vIHB1c2ggdHJhbnNwYXJlbnQgY29sb3IgdG8gY29sb3IgdGFibGUKICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTsKICAgICAgICB0cmFuc3BhcmFudENvbG9yID0gdHJhbnNwYXJhbnRDb2xvciB8fCBkYXRhLmNvbG9yVGFibGVbZGF0YS5jb2xvclRhYmxlLmxlbmd0aCAtIDFdOwogICAgICAgIGRhdGEuY29sb3JUYWJsZS5wdXNoKFt0cmFuc3BhcmFudENvbG9yWzBdLCB0cmFuc3BhcmFudENvbG9yWzFdLCB0cmFuc3BhcmFudENvbG9yWzFdXSk7CiAgICAgICAgaWYgKGRpdGhlcmluZykgewogICAgICAgICAgICBpbWFnZURpdGhlcmluZyhmcmFtZXMsIGRhdGEsIGluZGljZXNDYWNoZSk7CiAgICAgICAgICAgIC8vIHJldHVybiBjb2xvclRyYW5zZm9ybShmcmFtZXMubWFwKChpdGVtLCBpZHgpID0+IHsKICAgICAgICAgICAgLy8gICByZXR1cm4gewogICAgICAgICAgICAvLyAgICAgLi4uaXRlbSwKICAgICAgICAgICAgLy8gICAgIGltYWdlRGF0YTogZGF0YS5mcmFtZXNbaWR4XS5pbWFnZURhdGEKICAgICAgICAgICAgLy8gICB9CiAgICAgICAgICAgIC8vIH0pLCkKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGRhdGE7CiAgICB9CiAgICAvKioKICAgICAqIGRpdGhlcmluZwogICAgICogZXJyb3IgZGlmZnVzaW9uIG1hdHJpeDoKICAgICAqICAgWyAgICAgLCAgICAqLCA3LzE2IF0KICAgICAqICAgWyAzLzE2LCA1LzE2LCAxLzE2IF0KICAgICAqLwogICAgZnVuY3Rpb24gaW1hZ2VEaXRoZXJpbmcoZnJhbWVzLCBkYXRhLCBpbmRpY2VzQ2FjaGUpIHsKICAgICAgICBjb25zdCBtYXRyaXggPSBbCiAgICAgICAgICAgIFsxLCAwLCA3IC8gMTZdLAogICAgICAgICAgICBbLTEsIDEsIDMgLyAxNl0sCiAgICAgICAgICAgIFswLCAxLCA1IC8gMTZdLAogICAgICAgICAgICBbMSwgMSwgMSAvIDE2XQogICAgICAgIF07CiAgICAgICAgY29uc3QgY29sb3JDYWNoZSA9IG5ldyBNYXAoKTsKICAgICAgICAvLyBmcmFtZQogICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBmcmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHsKICAgICAgICAgICAgY29uc3QgcmF3SW1hZ2VEYXRhID0gZnJhbWVzW2ldLmltYWdlRGF0YTsKICAgICAgICAgICAgY29uc3QgaW1hZ2VEYXRhID0gZGF0YS5mcmFtZXNbaV0uaW1hZ2VEYXRhOwogICAgICAgICAgICBjb25zdCBjb3B5SW1hZ2VEYXRhID0gbmV3IEltYWdlRGF0YShpbWFnZURhdGEud2lkdGgsIGltYWdlRGF0YS5oZWlnaHQpOwogICAgICAgICAgICBjb3B5SW1hZ2VEYXRhLmRhdGEuc2V0KGltYWdlRGF0YS5kYXRhKTsKICAgICAgICAgICAgY29uc3QgaW5kaWNlcyA9IGRhdGEuZnJhbWVzW2ldLmluZGljZXM7CiAgICAgICAgICAgIC8vIHBpeGVsCiAgICAgICAgICAgIGZvciAobGV0IGogPSAwLCBsZW4yID0gcmF3SW1hZ2VEYXRhLndpZHRoICogcmF3SW1hZ2VEYXRhLmhlaWdodCAqIDQ7IGogPCBsZW4yOyBqICs9IDQpIHsKICAgICAgICAgICAgICAgIC8vIHNraXAgdHJhbnNwYXJhbnQgcGl4ZWwKICAgICAgICAgICAgICAgIGlmIChpbWFnZURhdGEuZGF0YVtqICsgM10gPT09IDApIHsKICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnN0IHAxID0gZ2V0UG9pbnRCeUluZGV4KHJhd0ltYWdlRGF0YSwgaik7CiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbiBvZmZzZXQKICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgNDsgaysrKSB7CiAgICAgICAgICAgICAgICAgICAgY29uc3QgYyA9IG1hdHJpeFtrXTsKICAgICAgICAgICAgICAgICAgICBjb25zdCBwMiA9IHsKICAgICAgICAgICAgICAgICAgICAgICAgeDogcDEueCArIGNbMF0sCiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHAxLnkgKyBjWzFdCiAgICAgICAgICAgICAgICAgICAgfTsKICAgICAgICAgICAgICAgICAgICBpZiAocDIueCA+PSAwICYmIHAyLnggPCByYXdJbWFnZURhdGEud2lkdGggJiYgcDIueSA+PSAwICYmIHAyLnkgPCByYXdJbWFnZURhdGEuaGVpZ2h0KSB7CiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZ2V0SW5kZXhCeVBvaW50KHJhd0ltYWdlRGF0YSwgcDIueCwgcDIueSk7CiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNraXAgdHJhbnNwYXJhbnQgcGl4ZWwKICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlRGF0YS5kYXRhW2luZGV4ICsgM10gPT09IDApIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOwogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5uZWwKICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbCA9IDA7IGwgPCAzOyBsKyspIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGRpZmYgPSByYXdJbWFnZURhdGEuZGF0YVtqICsgbF0gLSBjb3B5SW1hZ2VEYXRhLmRhdGFbaiArIGxdCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaWZmID0gcmF3SW1hZ2VEYXRhLmRhdGFbaiArIGxdIC0gaW1hZ2VEYXRhLmRhdGFbaiArIGxdOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaW5kZXggKyBsXSArPSBkaWZmICogY1syXTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIC8vIHNldCBuZXcgY29sb3IgYW5kIGluZGV4CiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IFtpbWFnZURhdGEuZGF0YVtqXSwgaW1hZ2VEYXRhLmRhdGFbaiArIDFdLCBpbWFnZURhdGEuZGF0YVtqICsgMl1dOwogICAgICAgICAgICAgICAgbGV0IG5ld0NvbG9yID0gZ2V0Q2xvc2VzdENvbG9yKGNvbG9yLCBkYXRhLmNvbG9yVGFibGUsIGNvbG9yQ2FjaGUpOwogICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbal0gPSBuZXdDb2xvclswXTsKICAgICAgICAgICAgICAgIGltYWdlRGF0YS5kYXRhW2ogKyAxXSA9IG5ld0NvbG9yWzFdOwogICAgICAgICAgICAgICAgaW1hZ2VEYXRhLmRhdGFbaiArIDJdID0gbmV3Q29sb3JbMl07CiAgICAgICAgICAgICAgICBpbmRpY2VzWyhqIC8gNCkgPj4gMF0gPSBpbmRpY2VzQ2FjaGUuZ2V0KG5ld0NvbG9yLmpvaW4oKSk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgY29uc3QgdGVtcCA9IG5ldyBJbWFnZURhdGEoaW1hZ2VEYXRhLndpZHRoLCBpbWFnZURhdGEuaGVpZ2h0KTsKICAgICAgICAgICAgdGVtcC5kYXRhLnNldChpbWFnZURhdGEuZGF0YSk7CiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRlbXAuZGF0YSwgaW5kaWNlcywgaW5kaWNlc0NhY2hlKQogICAgICAgIH0KICAgICAgICByZXR1cm4gZGF0YTsKICAgIH0KICAgIC8qKgogICAgICogZ2V0IGNsb3Nlc3QgY29sb3IKICAgICAqLwogICAgZnVuY3Rpb24gZ2V0Q2xvc2VzdENvbG9yKGNvbG9yLCBjb2xvclRhYmxlLCBjb2xvckNhY2hlKSB7CiAgICAgICAgY29uc3Qga2V5ID0gY29sb3Iuam9pbigpOwogICAgICAgIGlmIChjb2xvckNhY2hlLmhhcyhrZXkpKSB7CiAgICAgICAgICAgIHJldHVybiBjb2xvckNhY2hlLmdldChrZXkpOwogICAgICAgIH0KICAgICAgICBlbHNlIHsKICAgICAgICAgICAgbGV0IHJlcyA9IFtdOwogICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBJbmZpbml0eTsKICAgICAgICAgICAgbGV0IGluZGV4ID0gLTE7CiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBjb2xvclRhYmxlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7CiAgICAgICAgICAgICAgICAvLyBodHRwczovL3d3dy5jbmJsb2dzLmNvbS93eGw4NDUyMzU4MDAvcC8xMTA4NTgwMi5odG1sCiAgICAgICAgICAgICAgICAvLyBjdXJyZW50IGNvbG9yCiAgICAgICAgICAgICAgICBjb25zdCBjYyA9IGNvbG9yVGFibGVbaV07CiAgICAgICAgICAgICAgICBjb25zdCByID0gKGNvbG9yWzBdICsgY2NbMF0pIC8gMjsKICAgICAgICAgICAgICAgIGNvbnN0IGRlbHRhUiA9IGNvbG9yWzBdIC0gY2NbMF07CiAgICAgICAgICAgICAgICBjb25zdCBkZWx0YUcgPSBjb2xvclsxXSAtIGNjWzFdOwogICAgICAgICAgICAgICAgY29uc3QgZGVsdGFCID0gY29sb3JbMl0gLSBjY1syXTsKICAgICAgICAgICAgICAgIGNvbnN0IGRlbHRhQyA9IE1hdGguc3FydCgoMiArIHIgLyAyNTYpICogZGVsdGFSICogZGVsdGFSICsgNCAqIGRlbHRhRyAqIGRlbHRhRyArICgyICsgKDI1NSAtIHIpIC8gMjU2KSAqIGRlbHRhQiAqIGRlbHRhQik7CiAgICAgICAgICAgICAgICBpZiAoZGVsdGFDIDwgZGlzdGFuY2UpIHsKICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IGRlbHRhQzsKICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGk7CiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgMSkgewogICAgICAgICAgICAgICAgICAgICAgICBicmVhazsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgcmVzID0gWy4uLmNvbG9yVGFibGVbaW5kZXhdLCAxXTsKICAgICAgICAgICAgY29sb3JDYWNoZS5zZXQoa2V5LCByZXMpOwogICAgICAgICAgICByZXR1cm4gcmVzOwogICAgICAgIH0KICAgIH0KCiAgICBjb25zdCB1dGlscyA9IHsKICAgICAgICBnaWZMendEZWNvZGU6IEdpZkxaVy5kZWNvZGUsCiAgICAgICAgZ2lmTHp3RW5jb2RlOiBHaWZMWlcuZW5jb2RlLAogICAgICAgIGNvbG9yVHJhbnNmb3JtLAogICAgfTsKICAgIG9ubWVzc2FnZSA9IGUgPT4gewogICAgICAgIGNvbnN0IHsgYWN0aW9uLCBwYXJhbSwgX3NpZ24gfSA9IGUuZGF0YTsKICAgICAgICBpZiAodHlwZW9mIHV0aWxzW2FjdGlvbl0gPT09ICdmdW5jdGlvbicpIHsKICAgICAgICAgICAgY29uc3QgcmVzID0gewogICAgICAgICAgICAgICAgYWN0aW9uLAogICAgICAgICAgICAgICAgcmVzdWx0OiB1dGlsc1thY3Rpb25dKC4uLihwYXJhbSAhPT0gbnVsbCAmJiBwYXJhbSAhPT0gdm9pZCAwID8gcGFyYW0gOiBbXSkpLAogICAgICAgICAgICAgICAgX3NpZ24sCiAgICAgICAgICAgIH07CiAgICAgICAgICAgIHBvc3RNZXNzYWdlKHJlcyk7CiAgICAgICAgfQogICAgICAgIGVsc2UgewogICAgICAgICAgICBjb25zb2xlLmxvZyhgYWN0aW9uICR7YWN0aW9ufSBub3QgZm91bmRgKTsKICAgICAgICB9CiAgICB9OwoKfSkoKTsKLy8jIHNvdXJjZU1hcHBpbmdVUkw9d29ya2VyVXRpbHMuanMubWFwCgo=', null, false);
/* eslint-enable */

const workerNum = Math.max(window.navigator.hardwareConcurrency - 1, 1); // 线程数量
const quene = new Map();
const waiting = [];
const workers = new Array(workerNum).fill(null).map((_, index) => {
    return {
        index,
        worker: new WorkerFactory(),
        idle: true, // 是否空闲
    };
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
            p: { resolve, reject },
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
            ptr: 0,
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
                gctList: [],
            },
            frames: [],
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
            else if (
            // extention flag is 0x21, application flag is 0xff
            readCtrl.ptr + 1 < buf.length &&
                buf[readCtrl.ptr] === 0x21 &&
                buf[readCtrl.ptr + 1] === 0xff &&
                !gifData.appExt // 0x21 0xff will matched times
            ) {
                const appExt = readAppExt(buf, readCtrl);
                gifData.appExt = appExt;
            }
            else if (
            // Graphic Control Extension
            readCtrl.ptr + 1 < buf.length &&
                buf[readCtrl.ptr] === 0x21 &&
                buf[readCtrl.ptr + 1] === 0xf9) {
                gifData.frames.push(readFrame(buf, readCtrl));
            }
            else if (buf[readCtrl.ptr] === 0x2c) {
                // Image Descriptor
                const frame = readFrame(buf, readCtrl);
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
            else if (
            // Plain Text Extension
            readCtrl.ptr + 1 < buf.length &&
                buf[readCtrl.ptr] === 0x21 &&
                buf[readCtrl.ptr + 1] === 0x01) {
                gifData.frames.push(readFrame(buf, readCtrl));
            }
            else if (buf[readCtrl.ptr] === 0x3b) {
                // file end
                break;
            }
            // if (gifData.frames.length >= 2) break
            readCtrl.ptr++;
        }
        console.log('parse: ', window.performance.now() - s);
        s = window.performance.now();
        const decompressedFramesData = yield Promise.all(gifData.frames.map(item => {
            return worker({
                action: 'gifLzwDecode',
                param: [item.codeSize, item.imageData],
                transferable: [item.imageData.buffer],
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
        version: '',
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
        pixelAspect: 0,
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
        endByte: 0,
    };
    info.startByte = readCtrl.ptr;
    let idx = info.startByte;
    // to NETSCAPE, app name(8 bytes) and verification bytes(3 bytes)
    const blockSize = buf[(idx += 2)];
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
        imageEndByte: 0,
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
        const codeSize = buf[readCtrl.ptr++];
        const blocks = [];
        let imageDataLength = 0;
        while (buf[readCtrl.ptr] !== 0 && buf[readCtrl.ptr] !== undefined) {
            const subBlockSize = buf[readCtrl.ptr++];
            const subBlock = buf.slice(readCtrl.ptr, readCtrl.ptr + subBlockSize);
            imageDataLength += subBlock.length;
            blocks.push(subBlock);
            readCtrl.ptr += subBlockSize;
        }
        frameData.imageEndByte = readCtrl.ptr;
        frameData.endByte = readCtrl.ptr; // contain end flag
        const imageData = new Uint8Array(imageDataLength);
        for (let i = blocks.length - 1; i >= 0; i--) {
            imageData.set(blocks[i], (imageDataLength -= blocks[i].length));
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
    const interval = 1000 / 60;
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
        },
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
    const bgColor = gifData.header.gctFlag
        ? [...gifData.header.gctList[gifData.header.bgIndex], 255]
        : [...defaultBgColor];
    // width and height
    const width = gifData.header.width;
    const height = gifData.header.height;
    // avoid affect raw data
    const frameImageCopy = getGifRawImageDataCopy(frameInfo);
    // fill color
    const frameImageData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0, len = width * height; i < len; i++) {
        const x = i % width;
        const y = (i / width) >> 0;
        // first primary color index
        const pci = i << 2;
        // whether current pixel in current frame image
        if (x >= frameInfo.left &&
            x < frameInfo.left + frameInfo.width &&
            y >= frameInfo.top &&
            y < frameInfo.top + frameInfo.height) {
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
 * single frame, support transparent
 */
function generateRawImageData(gifData, frameIndex) {
    const frameInfo = gifData.frames[frameIndex];
    // check cache
    if (frameInfo.rawImageData instanceof ImageData) {
        return frameInfo.rawImageData;
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
    const rawImageData = new ImageData(frameInfo.width, frameInfo.height);
    rawImageData.data.set(frameImageData);
    // cache
    frameInfo.rawImageData = rawImageData;
    return rawImageData;
}
/**
 * get image data copy correctly (consider interlace)
 */
function getGifRawImageDataCopy(frameInfo) {
    const frameImageCopy = new Uint8Array(frameInfo.imageData.length);
    let idx = 0;
    function rowCopy(rowIdx) {
        for (let i = 0; i < frameInfo.width; i++) {
            frameImageCopy[idx] = frameInfo.imageData[rowIdx * frameInfo.width + i];
            idx++;
        }
    }
    // interlace
    if (frameInfo.interlace) {
        let rowIdx = 0;
        // pass 1: row 0, row 8, row 16……
        while (rowIdx < frameInfo.height) {
            rowCopy(rowIdx);
            rowIdx += 8;
        }
        // pass 2: row 4, row 12, row 20……
        rowIdx = 4;
        while (rowIdx < frameInfo.height) {
            rowCopy(rowIdx);
            rowIdx += 8;
        }
        // pass 3: row 2, row 6, row 10……
        rowIdx = 2;
        while (rowIdx < frameInfo.height) {
            rowCopy(rowIdx);
            rowIdx += 4;
        }
        // pass 4: row 1, row 3, row 5……
        rowIdx = 1;
        while (rowIdx < frameInfo.height) {
            rowCopy(rowIdx);
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
        const bgColor = gifData.header.gctFlag
            ? [...gifData.header.gctList[gifData.header.bgIndex], 255]
            : [...defaultBgColor];
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
                    newValue: tempValue,
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
                    this.loadingImg.style.transform = `rotate(${(this.loadingImgRoate += 1)}deg)`;
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
        const data = {
            buf: growGifBuffer(new Uint8Array(0)),
            ptr: 0,
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
                param: [framesMinCodeSize[idx], frame.imageData],
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

/**
 * get max width and max height
 */
function getMaxImageSize(...args) {
    return {
        x: Math.max(...args.map(item => item.width)),
        y: Math.max(...args.map(item => item.height)),
    };
}
/**
 * adjust rgb channel value
 */
function adjustRGBChannel(val) {
    return typeof val === 'number' ? Math.max(0, Math.min(val, 255)) : 0;
}
/**
 * colorStr to rgba array
 * from zrender
 */
function parseColorStr(colorStr) {
    const data = new Array(4).fill(0);
    data[3] = 1;
    const str = colorStr.replace(/ /g, '');
    if (str) {
        if (str.startsWith('#')) {
            const iv = parseInt(str.substring(1), 16);
            if (str.length === 4) {
                if (!(iv >= 0 && iv <= 0xfff)) {
                    return data;
                }
                data[0] = ((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8);
                data[1] = (iv & 0xf0) | ((iv & 0xf0) >> 4);
                data[2] = (iv & 0xf) | ((iv & 0xf) << 4);
            }
            else if (str.length === 7) {
                if (!(iv >= 0 && iv <= 0xffffff)) {
                    return data;
                }
                data[0] = (iv & 0xff0000) >> 16;
                data[1] = (iv & 0xff00) >> 8;
                data[2] = iv & 0xff;
            }
        }
        else {
            const op = str.indexOf('(');
            const ep = str.indexOf(')');
            if (op !== -1 && ep + 1 === str.length) {
                const fname = str.substring(0, op);
                const params = str.substring(op + 1, ep).split(',');
                let alpha = 1; // To allow case fallthrough.
                switch (fname) {
                    case 'rgba':
                        if (params.length === 4) {
                            alpha = parseFloat(params.pop()) * 255;
                            alpha = adjustRGBChannel(alpha);
                            data[3] = alpha;
                        }
                    // Fall through.
                    case 'rgb':
                        if (params.length === 3) {
                            data[0] = adjustRGBChannel(parseInt(params[0]));
                            data[1] = adjustRGBChannel(parseInt(params[1]));
                            data[2] = adjustRGBChannel(parseInt(params[2]));
                        }
                        break;
                }
            }
        }
    }
    return data;
}

/**
 * build imageDatas to gif
 */
function build(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const gifData = {
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
                pixelAspect: 1,
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
        };
        // global transparant color indix
        let transparantColorIdx = 0;
        // split frames into two groups--1. global color table, 2. local color table
        const frameGroups = [[]];
        data.frames.map((frame, idx) => {
            if (frame.setLocalColorTable) {
                frameGroups.push([
                    {
                        frameIdx: idx,
                        frameData: frame,
                    },
                ]);
            }
            else {
                frameGroups[0].push({
                    frameIdx: idx,
                    frameData: frame,
                });
            }
        });
        const quantizedFrames = yield Promise.all(frameGroups.map(g => {
            console.log(g);
            return worker({
                action: 'colorTransform',
                param: [g.map(frame => frame.frameData), data.dithering],
            });
        }));
        console.log('quantizedFrames: ', quantizedFrames);
        frameGroups.map((g, gIdx) => {
            g.map((frame, fIdx) => {
                // global color table frames
                if (gIdx === 0) {
                    gifData.header.gctList = quantizedFrames[gIdx].colorTable;
                }
                else {
                    gifData.frames[frame.frameIdx].lctList = quantizedFrames[gIdx].colorTable;
                }
                gifData.frames[frame.frameIdx] = {};
                gifData.frames[frame.frameIdx].imageData = quantizedFrames[gIdx].frames[fIdx].indices;
            });
        });
        // header set
        // size
        const imageSize = getMaxImageSize(...data.frames.map(item => item.imageData));
        gifData.header.width = imageSize.x;
        gifData.header.height = imageSize.y;
        // color table pad
        let bgColor = [0, 0, 0];
        if (data.backgroundColor) {
            bgColor = parseColorStr(data.backgroundColor);
        }
        transparantColorIdx = gifData.header.gctList.length - 1;
        gifData.header.bgIndex = gifData.header.gctList.length;
        gifData.header.gctList.push([bgColor[0], bgColor[1], bgColor[2]]);
        gifData.header.gctList = padColorTable(gifData.header.gctList);
        gifData.header.gctSize = gifData.header.gctList.length;
        // app ext
        if (gifData.appExt) {
            gifData.appExt.repetitionTimes = data.repetition;
        }
        // frames
        gifData.frames.forEach((frame, idx) => {
            const cnf = data.frames[idx];
            frame.startByte = 0;
            frame.endByte = 0;
            frame.width = cnf.imageData.width;
            frame.height = cnf.imageData.height;
            frame.left = ((gifData.header.width - frame.width) / 2) >> 0;
            frame.top = ((gifData.header.height - frame.height) / 2) >> 0;
            frame.disposalMethod = cnf.disposalMethod || 1;
            frame.userInputFlag = false;
            frame.transColorFlag = true;
            frame.delay = cnf.delay || 10;
            frame.lctList = frame.lctList || [];
            frame.lctFlag = !!frame.lctList.length;
            frame.interlace = false;
            frame.sortFlag = false;
            frame.transColorIdx = frame.lctFlag ? frame.lctList.length - 1 : transparantColorIdx;
            frame.lctList = frame.lctFlag ? padColorTable(frame.lctList) : [];
            frame.lctSize = frame.lctList.length;
            frame.codeSize = getBitsByNum(frame.lctSize);
            frame.imageStartByte = 0;
            frame.imageEndByte = 0;
        });
        // encode
        return encode(gifData);
    });
}
/**
 * pad color table
 */
function padColorTable(list) {
    let bits = getBitsByNum(list.length);
    if (bits < 4) {
        bits = 4;
    }
    const size = Math.pow(2, bits);
    for (let i = 0; i < size; i++) {
        if (!list[i]) {
            list[i] = [0, 0, 0];
        }
    }
    return list;
}

const kit = {
    /**
     * decode gif (ArrayBuffer)
     */
    decode(buf, errorCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            return decode(buf, (msg) => {
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
     * build image data list to gif
     */
    build(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return build(data);
        });
    },
    /**
     * get frame ImageData
     * single frame, support transparent, without regard to disposal method
     */
    getFrameImageData: generateRawImageData,
    /**
     * get frames ImageData[]
     * this will take a long time
     */
    getFramesImageData(gifData) {
        return gifData.frames.map((_, index) => {
            return generateRawImageData(gifData, index);
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
    },
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
        this._config.width =
            typeof this._config.width === 'number' ? this._config.width : (_a = rect === null || rect === void 0 ? void 0 : rect.width) !== null && _a !== void 0 ? _a : 0;
        this._config.height =
            typeof this._config.height === 'number' ? this._config.height : (_b = rect === null || rect === void 0 ? void 0 : rect.height) !== null && _b !== void 0 ? _b : 0;
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
        this._nextUpdateTime =
            performance.now() + this.gifData.frames[this._currFrame].delay / this._config.speed;
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
        this._nextUpdateTime =
            performance.now() + this.gifData.frames[this._currFrame].delay / this._config.speed;
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
        if (!this.isPlaying ||
            this.isRendering ||
            !this.gifData ||
            !this._ctx ||
            !this._offscreenCtx ||
            document.hidden)
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
        if (this._currFrame > this.gifData.frames.length - 1) {
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
        return undefined;
    }
}
AMZGif.filter = filter;
AMZGif.gifKit = kit;

export { AMZGif as default };
