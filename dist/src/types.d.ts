declare type CallbackFunc = (message: string) => void;
export declare type httpGifRequest = (src: string) => Blob;
export declare type AnyFuncType = (...args: any) => any;
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
    filter?: (imgData: ImageData) => ImageData;
}
/**
 * event func name type
 */
export declare type EventFuncNameType = 'onLoad' | 'onError' | 'onLoadError' | 'onDataError';
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
    codeSize: number;
    imageData: Uint8Array;
    imageStartByte: number;
    imageEndByte: number;
    canvasImageData?: ImageData;
    rawImageData?: ImageData;
}
/**
 * application extension data type
 */
export interface AppExt {
    appName: string;
    verification: string;
    blockIdx: number;
    repetitionTimes: number;
    startByte: number;
    endByte: number;
}
/**
 * gif data obj type
 */
export interface GifData {
    header: GifHeaderInfo;
    appExt?: AppExt;
    frames: Array<GifFrameData>;
}
/**
 * gif encoded data type
 */
export interface GifEncodeData {
    buf: Uint8Array;
    ptr: number;
}
/**
 * value change type
 */
export interface ValueChangeType {
    key: string;
    oldValue: any;
    newValue: any;
}
/**
 * string key object
 */
export interface StringKeyObjType {
    [x: string]: any;
}
/**
 * worker job type
 */
export interface WorkerJobType {
    action: string;
    param?: Array<any>;
    transferable?: Transferable[];
}
/**
 * worker job wrap type
 */
export interface WorkerJobWrapType {
    _sign: number;
    job: WorkerJobType;
    p: {
        resolve: (value: unknown) => void;
        reject: (value: unknown) => void;
    };
}
/**
 * to build frame data type
 */
export interface ToBuildFrameDataType {
    imageData: ImageData;
    delay?: number;
    disposalMethod?: number;
    setLocalColorTable?: boolean;
}
/**
 * quantized frame data
 */
export interface QuantizedFrameType {
    imageData: ImageData;
    indices: Uint8Array;
}
/**
 * build data type
 */
export interface ToBuildDataType {
    backgroundColor?: string;
    repetition: number;
    frames: Array<ToBuildFrameDataType>;
}
/**
 * point
 * [col, row], just like [x, y]
 */
export declare type Point = {
    x: number;
    y: number;
};
/**
 * rgba map
 */
export interface RGBAMAPType {
    r: number;
    g: number;
    b: number;
    a: number;
}
/**
 * color table and frames
 */
export interface ColorTableAndFramesType {
    colorTable: Array<Array<number>>;
    frames: Array<QuantizedFrameType>;
}
export {};
