/**
 * queries/index.ts
 */

import * as debug from 'debug';
import { IStoreInteractions } from '../source';
import { IShape } from '../shape';

const logger = debug('sdi:queries');
let storeRef: IStoreInteractions<IShape>;


export type IQuery<K extends keyof IShape> = (key: K) => IShape[K];
export interface IQueryOptions { }


export const configure = (store: IStoreInteractions<IShape>) => {
    logger('configure');
    if (storeRef) {
        throw (new Error('GetPathAlreadyConfigured'));
    }
    storeRef = store;
};


export const query = <K extends keyof IShape>(key: K): IShape[K] => {
    if (!storeRef) {
        throw (new Error('GetPathNotConfigured'));
    }

    return (storeRef.get(key));
};


logger('loaded');
