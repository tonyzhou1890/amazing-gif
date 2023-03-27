import { ColorTableAndFramesType, Point, ToBuildFrameDataType, GifData } from '../types';
/**
 * get pixel by point——x: col, y: row
 */
export declare function getPixelByPoint(imgData: ImageData, x: number, y: number): Uint8ClampedArray;
/**
 * get index by point
 */
export declare function getIndexByPoint(imgData: ImageData, x: number, y: number): number;
/**
 * get point by index
 */
export declare function getPointByIndex(imgData: ImageData, index: number): Point;
/**
 * get max width and max height
 */
export declare function getMaxImageSize(...args: Array<ImageData>): Point;
/**
 * copy image
 */
export declare function imageCopy(source: ImageData, x: number, y: number, width: number, height: number): ImageData;
/**
 * paste image
 */
export declare function imagePaste(source: ImageData, target: ImageData, x: number, y: number): ImageData;
/**
 * adjust rgb channel value
 */
export declare function adjustRGBChannel(val: number): number;
/**
 * colorStr to rgba array
 * from zrender
 */
export declare function parseColorStr(colorStr: string): Array<number>;
/**
 * rgba2rgb
 */
export declare function rgba2rgb(color: Array<number> | Uint8ClampedArray, start?: number): Array<number> | Uint8ClampedArray;
/**
 * color transform to indices
 */
export declare function colorTransform(frames: Array<ToBuildFrameDataType>, dithering?: boolean): ColorTableAndFramesType;
/**
 * dithering
 * error diffusion matrix:
 *   [     ,    *, 7/16 ]
 *   [ 3/16, 5/16, 1/16 ]
 */
export declare function imageDithering(frames: Array<ToBuildFrameDataType>, data: ColorTableAndFramesType, indicesCache: Map<any, any>): ColorTableAndFramesType;
/**
 * get closest color
 */
export declare function getClosestColor(color: Array<number>, colorTable: Array<Array<number>>, colorCache: Map<any, any>): Array<number>;
/**
 * replace same indices in adjacent images to transparant indices
 */
export declare function replaceRepetedIndices(gifData: GifData): void;
