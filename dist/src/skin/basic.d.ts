import AMZGif from '../player';
import SkinBase from './base';
export default class BasicSkin extends SkinBase {
    constructor(amzGif: AMZGif);
    playDiv: HTMLDivElement | null;
    playImg: HTMLImageElement | null;
    loadingDiv: HTMLDivElement | null;
    loadingImg: HTMLImageElement | null;
    loadingImgRoate: number;
    init(): void;
    genMask(width: number, height: number): HTMLDivElement;
    setWatch(): void;
    handlePlay(): void;
}
