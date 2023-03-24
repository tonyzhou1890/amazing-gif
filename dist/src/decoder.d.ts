import { EventFuncNameType, GifData } from './types';
/**
 * decode gif buffer
 * @param gifBuffer
 * @param errorCallback
 */
declare const _default: (gifBuffer: ArrayBuffer, errorCallback: (msg: string, type: EventFuncNameType) => undefined) => Promise<GifData | undefined>;
export default _default;
