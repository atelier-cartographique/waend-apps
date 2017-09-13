
import * as debug from 'debug';
import { query } from './index';
import { fromNullable } from 'fp-ts/lib/Option';

const logger = debug('waend:queries/map');

const pathKey =
    <T>(pathOpt: string, def: T) =>
        (objOpt: any): T => {
            const path = pathOpt.split('.');
            let obj: any = objOpt;
            for (let i = 0, len = path.length; i < len; i += 1) {
                if (!obj || (typeof obj !== 'object')) {
                    return def;
                }
                const p = path[i];
                obj = obj[p];
            }
            if (obj === undefined) {
                return def;
            }
            return obj;
        };

const getGroupName = pathKey('group.properties.name', 'UnNamed');

export const getMapName =
    () => fromNullable(query('data/map')).fold(
        () => 'NoMap',
        getGroupName,
    );

logger('loaded');


