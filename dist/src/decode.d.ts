import { EventFuncNameType, GifData } from './types';
/**
 * decode gif buffer
 * @param gifBuffer
 * @param errorCallback
 */
export default function decode(gifBuffer: ArrayBuffer, errorCallback?: (msg: string, type: EventFuncNameType) => undefined): Promise<GifData | undefined>;
