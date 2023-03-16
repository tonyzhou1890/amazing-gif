import { GifData } from './types';
/**
 * encode gif data
 * @param gifData
 * @param errorCallback
 * @returns
 */
export default function encode(gifData: GifData): Promise<Uint8Array>;
