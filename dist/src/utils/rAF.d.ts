import { AnyFuncType } from '../types';
export default function rAF(callbackQueue: Array<AnyFuncType>): {
    cancel(): void;
};
