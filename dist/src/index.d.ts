import { Config, GifData } from './types';
declare class AMZGif {
    constructor(config: Config);
    static filter: {
        grayscale: typeof import("./filter/grayscale").default;
        blackAndWhite: typeof import("./filter/blackAndWhite").default;
        reverse: typeof import("./filter/reverse").default;
        decolorizing: typeof import("./filter/decolorizing").default;
        monochromeRed: typeof import("./filter/monochromeRed").default;
        monochromeGreen: typeof import("./filter/monochromeGreen").default;
        monochromeBlue: typeof import("./filter/monochromeBlue").default;
        nostalgic: typeof import("./filter/nostalgic").default;
        cast: typeof import("./filter/cast").default;
        frozen: typeof import("./filter/frozen").default;
        comic: typeof import("./filter/comic").default;
        brown: typeof import("./filter/brown").default;
        boxBlur: typeof import("./filter/boxBlur").default;
    };
    static gifKit: {
        decode(buf: ArrayBuffer, errorCallback: Function): GifData | undefined;
        encode(gifData: GifData): Uint8Array;
        getFrameImageData: typeof import("./render").generateIndependentImageData;
        getFramesImageData(gifData: GifData): ImageData[];
        getCompositeFrameImageData: typeof import("./render").generateFullCanvasImageData;
        getCompositeFramesImageData(gifData: GifData): ImageData[];
    };
    speedList: number[];
    _config: Config;
    _imgEl: HTMLImageElement | null;
    _canvas: HTMLCanvasElement | null;
    _ctx: CanvasRenderingContext2D | null;
    _offscreenCanvas: HTMLCanvasElement | null;
    _offscreenCtx: CanvasRenderingContext2D | null;
    _gifBuffer: ArrayBuffer | null;
    gifData: GifData | null;
    _currFrame: number;
    _nextUpdateTime: number;
    _rAFCallbackQueue: Array<Function>;
    /**
     * loading gif
     */
    isLoading: boolean;
    /**
     * @member isPlaying
     * @description play status
     */
    isPlaying: boolean;
    /**
     * is rendering
     */
    isRendering: boolean;
    /**
     * @member init
     */
    _init(): void;
    /**
     * set width and height，and create canvas
     */
    _initCanvas(): void;
    _initContainer(): void;
    /**
     * @member play
     * play gif
     */
    play(): Promise<void>;
    /**
     * pause
     */
    pause(): Promise<void>;
    /**
     * play next frame munually
     * @returns
     */
    nextFrame(): string | void;
    /**
     * play prev frame manually
     */
    prevFrame(): string | void;
    /**
     * jump
     */
    jump(frameIndex: number): string | void;
    /**
     * set speed
     */
    setSpeed(speed: number): boolean;
    /**
     * togglePlay by
     */
    _togglePlay(): void;
    /**
     * update
     */
    _update(time: number): void;
    _renderFrame(): void;
    _checkEnd(): boolean;
    /**
     * get gif data
     */
    _getGif(): Promise<void>;
    /**
     * @ignore
     * handleError
     */
    _errCall(msg: string, funcName: 'onLoad' | 'onError' | 'onLoadError' | 'onDataError'): void;
}
export default AMZGif;
