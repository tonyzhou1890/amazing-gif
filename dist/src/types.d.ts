declare type CallbackFunc = (message: string) => void;
export declare type httpGifRequest = (src: string) => Blob;
/**
 * @interface Config
 * @description
 * AMZGif param
 */
export interface Config {
    el: HTMLImageElement | string;
    src?: string;
    httpRequest?: httpGifRequest;
    loop?: boolean;
    auto?: boolean;
    width?: number;
    height?: number;
    interactive?: boolean;
    skin?: string;
    speed: number;
    onLoad?: CallbackFunc;
    onLoadError?: CallbackFunc;
    onDataError?: CallbackFunc;
    onError?: CallbackFunc;
    onBeforePlay?: CallbackFunc;
    onPlay?: CallbackFunc;
    onEnd?: CallbackFunc;
    onBeforePause: CallbackFunc;
    onPause?: CallbackFunc;
    nextFrame?: CallbackFunc;
    prevFrame?: CallbackFunc;
}
/**
 * read ctrl type
 */
export interface ReadCtrlType {
    ptr: number;
}
/**
 * gif header info type
 */
export interface GifHeaderInfo {
    type: string;
    isGif: boolean;
    version: string;
    width: number;
    height: number;
    gctFlag: boolean;
    cr: number;
    sortFlag: boolean;
    gctSize: number;
    gctStartByte: number;
    gctEndByte: number;
    bgIndex: number;
    pixelAspect: number;
    gctList: Array<Array<number>>;
}
/**
 * gif frame data
 */
export interface GifFrameData {
    startByte: number;
    endByte: number;
    width: number;
    height: number;
    left: number;
    top: number;
    disposalMethod: number;
    userInputFlag: boolean;
    transColorFlag: boolean;
    delay: number;
    transColorIdx: number;
    lctFlag: boolean;
    interlace: boolean;
    sortFlag: boolean;
    lctSize: number;
    lctStartByte: number;
    lctEndByte: number;
    lctList: Array<Array<number>>;
    imageData: Uint8Array;
    imageStartByte: number;
    imageEndByte: number;
    canvasImageData?: ImageData;
}
/**
 * gif data obj type
 */
export interface GifData {
    header: GifHeaderInfo;
    appExt?: {
        appName: string;
        repetitionTimes: number;
        startByte: number;
        endByte: number;
    };
    frames: Array<GifFrameData>;
}
export {};
