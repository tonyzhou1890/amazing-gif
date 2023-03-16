import { GifData } from "./types";
/**
 * decode gif buffer
 * @param gifBuffer
 * @param errorCallback
 */
declare const _default: (gifBuffer: ArrayBuffer, errorCallback: Function) => Promise<GifData | undefined>;
export default _default;
