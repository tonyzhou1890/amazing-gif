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
};
/**
 * @name fillBoxPixels
 * fill box pixels
 */
export declare function fillBoxPixels(imgData: ImageData, x: number, y: number, box: Uint8ClampedArray, boxWidth: number, boxHeight: number, pixelChannel: number): Uint8ClampedArray;
