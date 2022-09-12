import AMZGif from "..";
/**
 * base skin class
 */
export default class SkinBase {
    constructor(amzGif: AMZGif);
    cache: {
        [x: string]: any;
    };
    keys: Array<string>;
    watch: {
        [x: string]: Function;
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
