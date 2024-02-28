import { AnyFuncType, Config, EventFuncNameType, GifData } from './types';
declare class GifPlayer {
    constructor(config: Config);
    speedList: number[];
    _config: Config;
    _imgEl: HTMLImageElement | null;
    _canvas: HTMLCanvasElement | null;
    _ctx: CanvasRenderingContext2D | null;
    _offscreenCanvas: HTMLCanvasElement | null;
    _offscreenCtx: CanvasRenderingContext2D | null;
    _gifBuffer: ArrayBuffer | null;
    gifData: GifData | null;
    _duration: number;
    _currFrame: number;
    _repetitionTimes: number;
    _repetition: number;
    _time: number;
    _rAFCallbackQueue: Array<AnyFuncType>;
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
     * 重启
     * @param config
     * @desc 重启播放器，可以更换 gif
     */
    restart(config?: Config): Promise<void>;
    /**
     * @member play
     * play gif
     */
    play(): Promise<undefined>;
    /**
     * pause
     */
    pause(): Promise<void>;
    /**
     * play next frame munually
     * @returns
     */
    nextFrame(): string | undefined;
    /**
     * play prev frame manually
     */
    prevFrame(): string | undefined;
    /**
     * jump
     */
    jump(frameIndex: number): string | undefined;
    /**
     * set speed
     */
    setSpeed(speed: number): boolean;
    _syncGIFTime(): void;
    _getFrameIndexByTime(): number;
    /**
     * togglePlay by
     */
    _togglePlay(): void;
    /**
     * update
     */
    _update(time: number, timeOffset: number): void;
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
    _errCall(msg: string, funcName: EventFuncNameType): undefined;
}
export default GifPlayer;
