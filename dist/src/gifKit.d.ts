import { generateIndependentImageData, generateFullCanvasImageData } from './render';
import { GifData } from "./types";
declare const kit: {
    /**
     * decode gif (ArrayBuffer)
     */
    decode(buf: ArrayBuffer, errorCallback: Function): Promise<GifData | undefined>;
    /**
     * encode gif
     */
    encode(gifData: GifData): Promise<Uint8Array>;
    /**
     * get frame ImageData
     * single frame, support transparent, without regard to disposal method
     */
    getFrameImageData: typeof generateIndependentImageData;
    /**
     * get frames ImageData[]
     * this will take a long time
     */
    getFramesImageData(gifData: GifData): ImageData[];
    /**
     * get composite ImageData of a frame
     * this may take a long time
     */
    getCompositeFrameImageData: typeof generateFullCanvasImageData;
    /**
     * get composite ImageData of all frames
     * this will take a long time
     */
    getCompositeFramesImageData(gifData: GifData): ImageData[];
};
export default kit;
