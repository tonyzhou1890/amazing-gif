/**
 * @module helpers
 */
/**
 * @name noop
 * @description empty function
 */
export declare function noop(): void;
/**
 * @name isFunc
 */
export declare function isFunc(f: any): boolean;
export declare const errMsgs: {
    notReady: string;
    wrongParam: string;
    noGifUrl: string;
    gifEmpty: string;
    gifDataTypeError: string;
    notGif: string;
    noConfigEl: string;
    noImg: string;
    notImg: (el: string) => string;
    isRendering: string;
    skinError: string;
    skinContainerIsSmall: string;
};
