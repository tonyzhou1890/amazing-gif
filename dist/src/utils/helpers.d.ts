/**
 * @module helpers
 */
/**
 * @name noop
 * @description empty function
 */
export declare function noop(): void;
/**
 * @name isFunc
 */
export declare function isFunc(f: any): boolean;
/**
 * isOdd
 */
export declare function isOdd(a: number): boolean;
export declare const errMsgs: {
    notReady: string;
    wrongParam: string;
    noGifUrl: string;
    gifEmpty: string;
    gifDataTypeError: string;
    notGif: string;
    noConfigEl: string;
    noImg: string;
    notImg: (el: string) => string;
    isRendering: string;
    skinError: string;
    skinContainerIsSmall: string;
    errData: string;
};
/**
 * @name fillBoxPixels
 * fill box pixels
 */
export declare function fillBoxPixels(imgData: ImageData, x: number, y: number, box: Uint8ClampedArray, boxWidth: number, boxHeight: number, pixelChannel: number): Uint8ClampedArray;
/**
 * get bit depth of a num
 * @param num
 * @returns
 */
export declare function getBitsByNum(num: number): number;
/**
 * getBits
 * @param num 1 byte
 * @param bitIdx bit index(from right to left)
 * @param length required bits length
 */
export declare function getBits(num: number, bitIdx: number, length: number): number;
/**
 * setBits
 * @param targetNum 1 byte
 * @param bitIdx bit index (from right to left)
 * @param length required bits length
 * @param sourceNum
 * @returns
 */
export declare function setBits(targetNum: number, bitIdx: number, length: number, sourceNum: number): number;
/**
 * increase buffer capacity
 * @param buf
 * @param num
 * @returns
 */
export declare function bufferGrow(buf: ArrayBuffer, num?: number): ArrayBuffer | undefined;
