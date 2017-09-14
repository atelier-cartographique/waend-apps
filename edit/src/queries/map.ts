
import * as debug from 'debug';
import { query } from './index';
import { fromNullable, none } from 'fp-ts/lib/Option';
import { Geometry, Extent, RBushItem, GeoModel } from 'waend/lib';
import * as rbush from 'rbush';
import { overlayData } from '../components/map/overlay';

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
export const getDataOption = () => fromNullable(query('data/map'))
export const getData =
    () => getDataOption().fold(
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
    () => query('component/map').dirty !== 'clean';

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

export const getInteractionState =
    () => query('component/mapInteractions');


export const getOverlayState = () => query('component/mapOverlayState');
export const getOverlayDataOption = () => fromNullable(query('component/mapOverlayData'));
export const getOverlayData =
    () => getOverlayDataOption().fold(
        () => ({}),
        (group: any) => overlayData(
            group.layers[0].features.map((f: any) => {
                if (isFeatureSelected(f.id)) {
                    logger(`SELECTED ${f.id}`, f)
                    return {
                        ...f,
                        properties: {
                            style: {
                                strokeStyle: 'red',
                                strokeWidth: 3,
                            },
                        },
                    };
                }
                return {
                    ...f,
                    properties: {
                        style: {
                            strokeStyle: 'blue',
                            strokeWidth: 1,
                        },
                    },

                }
            })),
    );
export const isOverlayDirty =
    () => query('component/mapOverlayState').dirty !== 'clean';


export const getFeaturesIn =
    (e: Extent) => {
        const tree = rbush<RBushItem>();
        const layers: any[] = getData().layers;
        const features =
            layers
                .reduce<any[]>((acc, l) => acc.concat(l.features), [])
                .map((a: any) => new GeoModel(a));
        const items: RBushItem[] =
            features
                .map((m) => ({
                    id: m.id,
                    ...(m.getExtent().getDictionary()),
                }));
        tree.load(items);

        return (
            tree
                .search(e.getDictionary())
                .map(i => i.id));
    };

export const getFeaturesAt =
    (pos: number[]) => {
        logger(`getFeaturesAt ${pos}`);
        return getFeaturesIn(new Extent(pos.concat(pos)));
    };

const isIdIn =
    (base: string[]) =>
        (id: string) => base.indexOf(id) >= 0;

export const getSelectedUnder =
    () => query('component/mapInteractions').selectedUnder;

export const getSelection =
    () => query('component/mapInteractions').selection;

export const getFeatureById =
    (id: string) =>
        getDataOption()
            .map(g => g.layers as any[])
            .map(ls => ls.reduce(
                (_acc, l) => l.features.find((f: any) => f.id === id), null))
            .fold(() => none, a => fromNullable(a));


export const isFeatureSelected =
    (id: string) => isIdIn(query('component/mapInteractions').selection)(id);

logger('loaded');
