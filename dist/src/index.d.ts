import { Config, GifData } from './types';
declare class AMZGif {
    constructor(config: Config);
    _config: Config;
    _imgEl: HTMLImageElement | null;
    _canvas: HTMLCanvasElement | null;
    _ctx: CanvasRenderingContext2D | null;
    _offscreenCanvas: HTMLCanvasElement | null;
    _offscreenCtx: CanvasRenderingContext2D | null;
    _gifLoading: boolean;
    _gifBuffer: ArrayBuffer | null;
    gifData: GifData | null;
    _frameTotal: number;
    _currFrame: number;
    _nextUpdateTime: number;
    /**
     * @member isPlaying
     * @description play status
     */
    isPlaying: boolean;
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
     * togglePlay by
     */
    _togglePlay(): void;
    /**
     * update
     */
    _update(time: number): void;
    _renderFrame(): void;
    _checkEnd(): true | undefined;
    /**
     * play next frame munually
     * @returns
     */
    nextFrame(): void;
    /**
     * play prev frame manually
     */
    prevFrame(): void;
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
