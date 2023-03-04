import { GifData } from "./types";
/**
 * decode gif buffer
 * @param gifBuffer
 * @param errorCallback
 */
export default function decode(gifBuffer: ArrayBuffer, errorCallback: Function): GifData | undefined;
