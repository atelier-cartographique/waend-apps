
import * as debug from 'debug';
import { dispatch, dispatchK, observe } from './index';
import { Extent, Transform } from 'waend/lib';
import { MapState } from 'waend/map';
import { getMapExtent, getDataOption } from '../queries/map';
import { MapInteractionsOptions } from '../components/map/interactions';
import { defaultOverlayData } from '../components/map/overlay';

const logger = debug('waend:events/map');

const dirty = (s: MapState) => ({ ...s, dirty: 'all' } as MapState);
const clean = (s: MapState) => ({ ...s, dirty: 'clean' } as MapState);
const dirtyView = (s: MapState) => ({ ...s, dirty: 'view' } as MapState);
const dirtyData = (s: MapState) => ({ ...s, dirty: 'data' } as MapState);

export const markDirty =
    () => dispatch('component/map', dirty);

export const markClean =
    () => dispatch('component/map', clean);

export const markDirtyData =
    () => dispatch('component/map', dirtyData);


observe('data/map', markDirtyData);

export const setRect =
    (rect: ClientRect) => dispatch('component/map', s => dirtyView({ ...s, rect }));

export const setExtent =
    (extent: number[]) => dispatch('component/map', s => dirtyView({ ...s, extent }));

export const transformExtent =
    (t: Transform) =>
        (extent: number[]) => {
            const NE = t.mapVec2([extent[2], extent[3]]);
            const SW = t.mapVec2([extent[0], extent[1]]);
            dispatch('component/map',
                s => dirtyView({ ...s, extent: [SW[0], SW[1], NE[0], NE[1]] }));
        };

export const bufferExtent =
    (n: number) => dispatch('component/map', (s) => {
        const e = new Extent(s.extent);
        const extent = e.buffer(n).getArray();
        return dirtyView({ ...s, extent });
    });

export const zoomToMapExtent =
    () => dispatch('component/map', (s) => {
        const extent = getMapExtent();
        logger('zoomToExtent', extent);
        return dirtyView({ ...s, extent });
    });


export const updateInteraction =
    (o: MapInteractionsOptions) =>
        dispatch('component/mapInteractions', s => ({ ...s, ...o }));


// overlay

export const overlayId = 'map-overlay-id';

const overlayData = dispatchK('component/mapOverlayData');
const overlayState = dispatchK('component/mapOverlayState');
export const resetOverlay =
    () => overlayData(defaultOverlayData);

export const overlayPlace =
    (fs: any[]) => overlayData((s) => {
        s.layers[0].features = fs;
        logger(`overlayPlace`, s);
        return s;
    });

observe('component/map', s => overlayState(() => s));
// selection

const isIdIn =
    (base: string[]) =>
        (id: string) => base.indexOf(id) >= 0;

export const setSelectedUnder =
    (ids: string[]) => getDataOption().map((g) => {
        logger(`setSelectedUnder ${ids}`);
        const isIn = isIdIn(ids);
        const layers: any[] = g.layers;
        overlayPlace(layers.reduce<any[]>(
            (acc, l) => acc.concat(
                l.features.filter((f: any) => isIn(f.id))), [])
            .map((f: any) => ({
                ...f,
                properties: {
                    style: {
                        strokeStyle: 'blue',
                        strokeWidth: 2,
                    },
                },
            })));
        overlayState(dirtyData);
    });


logger('loaded');
