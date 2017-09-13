
import * as debug from 'debug';
import { query } from './index';
import { fromNullable } from 'fp-ts/lib/Option';
import { Geometry, Extent } from 'waend/lib';

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

export const getState = () => query('component/map');
export const getData =
    () => fromNullable(query('data/map')).fold(
        () => ({}),
        group => group,
    );

const getGroupName = pathKey('group.properties.name', 'UnNamed');

export const getMapName =
    () => fromNullable(query('data/map')).fold(
        () => 'NoMap',
        getGroupName,
    );

export const isDirty =
    () => query('component/map').dirty;

export const checkRect =
    (r: ClientRect) => {
        const sr = query('component/map').rect;
        return r.width === sr.width && r.height === sr.height;
    };


const featureExtent =
    (f: any) => Geometry.fromJSONGeometry(f.geom).getExtent().getArray();

const layerExtent =
    (layer: any) => {
        const features: any[] = layer.features;
        const initialValue = [0, 0, 0, 0];
        return (features.reduce((acc: number[], f: any, n: number) => {
            if (n === 0) {
                return featureExtent(f);
            }
            return (new Extent(acc)).add(featureExtent(f)).getArray();
        }, initialValue) as number[]);
    };

export const getLayerExtent =
    (idx: number) => fromNullable(query('data/map')).fold(
        () => [0, 0, 0, 0],
        group => fromNullable(group.layers).fold(
            () => [0, 0, 0, 0],
            layers => layerExtent(layers[idx])),
    );

export const getMapExtent =
    () => fromNullable(query('data/map')).fold(
        () => [0, 0, 0, 0],
        group => fromNullable(group.layers).fold(
            () => [0, 0, 0, 0],
            (layers: any[]) => layers.reduce((acc: number[], l: any) => {
                return (new Extent(acc)).add(layerExtent(l)).getArray();
            }, layerExtent(layers[0]))),
    ) as number[];

logger('loaded');


