import AMZGif from '..';
import { AnyFuncType } from '../types';
/**
 * base skin class
 */
export default class SkinBase {
    constructor(amzGif: AMZGif);
    cache: {
        [x: string]: unknown;
    };
    keys: Array<string>;
    watch: {
        [x: string]: AnyFuncType;
    };
    amzGif: AMZGif;
    init(): void;
    /**
     * check changes of data
     */
    dirtyChecking(): void;
    /**
     * get value by key from amzGif
     */
    getValue(key: string): any;
}
