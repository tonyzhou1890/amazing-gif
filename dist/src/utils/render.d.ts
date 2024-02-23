import { AnyFuncType, GifData } from '../types';
/**
 * generate ImageData for canvas
 */
export declare function generateFullCanvasImageData(gifData: GifData, frameIndex: number): ImageData;
/**
 * generate ImageData
 * single frame, support transparent
 */
export declare function generateRawImageData(gifData: GifData, frameIndex: number): ImageData;
/**
 * get correct lastFrameSnapshot
 */
export declare function getLastFrameSnapshot(gifData: GifData, frameIndex: number): undefined | ImageData;
/**
 * render frame image data to canvas
 */
export declare function render(ctx: CanvasRenderingContext2D, offscreenCtx: CanvasRenderingContext2D, gifData: GifData, frameIndex: number, beforeDraw?: AnyFuncType): ImageData;
