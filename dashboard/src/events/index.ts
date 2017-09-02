/**
 * events/index.ts
 */

import * as debug from 'debug';
import { IStoreInteractions, IReducer } from '../source';
import { IShape } from '../shape/index';


const logger = debug('sdi:events');


export interface IEventData { }

// export interface IDispatch {
//     (handler: IReducer): void;
// }

let storeRef: IStoreInteractions<IShape>;

export const configure = (store: IStoreInteractions<IShape>) => {
    logger('configure');
    if (storeRef) {
        throw (new Error('DispatchAlreadyConfigured'));
    }
    storeRef = store;
};

export const dispatch = <K extends keyof IShape>(key: K, handler: IReducer<IShape, IShape[K]>): void => {
    if (!storeRef) {
        throw (new Error('DispatchNotConfigured'));
    }
    storeRef.dispatch(key, handler);
};

export const observe = <K extends keyof IShape>(key: K, handler: (a: IShape[K]) => void): void => {
    if (!storeRef) {
        setTimeout(() => {
            observe(key, handler);
        }, 1);
    }
    else {
        storeRef.observe(key, handler);
    }
};


export const reset = (n: number): void => {
    if (!storeRef) {
        throw (new Error('DispatchNotConfigured'));
    }

    storeRef.reset(n);
};


logger('loaded');
