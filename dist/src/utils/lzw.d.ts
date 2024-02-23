export declare const GifLZW: {
    /**
     * decode gif buffer
     * @param codeSize
     * @param buf
     * @returns
     */
    decode: (codeSize: number, buf: Uint8Array) => Uint8Array;
    /**
     * encode gif color indices buffer
     * @param codeSize
     * @param buf
     */
    encode: (codeSize: number, buf: Uint8Array) => Uint8Array;
};
