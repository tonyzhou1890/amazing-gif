import decode from './decode';
import encode from './encode';
import build from './build';
import GifPlayer from './player';
import filter from './filter';
import { generateRawImageData, generateFullCanvasImageData } from './utils/render';
import { GifData } from './types';
declare function getFramesImageData(gifData: GifData): ImageData[];
declare function getCompositedFramesImageData(gifData: GifData): ImageData[];
export { 
/**
 * decode gif (ArrayBuffer)
 */
decode, 
/**
 * encode gif
 */
encode, 
/**
 * build image data list to gif
 */
build, 
/**
 * get frame ImageData
 * single frame, support transparent, without regard to disposal method
 */
generateRawImageData as getFrameImageData, 
/**
 * get frames ImageData[]
 * this will take a long time
 */
getFramesImageData, 
/**
 * get composite ImageData of a frame
 * this may take a long time
 */
generateFullCanvasImageData as getCompositedFrameImageData, 
/**
 * get composite ImageData of all frames
 * this will take a long time
 */
getCompositedFramesImageData, 
/**
 * player
 */
GifPlayer, 
/**
 * build-in filters
 */
filter };
