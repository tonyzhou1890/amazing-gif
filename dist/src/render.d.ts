import { GifData, GifFrameData } from "./types";
/**
 * generate ImageData for canvas
 */
export declare function generateImageData(gifData: GifData, frameInfo: GifFrameData, lastFrameSnapshot?: ImageData): ImageData;
/**
 * get correct lastFrameSnapshot
 */
export declare function getLastFrameSnapshot(gifData: GifData, frameIndex: number): undefined | ImageData;
/**
 * render frame image data to canvas
 */
export declare function render(ctx: CanvasRenderingContext2D, offscreenCtx: CanvasRenderingContext2D, gifData: GifData, frameIndex: number): ImageData;
