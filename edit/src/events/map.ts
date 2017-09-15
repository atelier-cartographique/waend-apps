
import * as debug from 'debug';
import { dispatch, dispatchK, observe } from './index';
import { Extent, Transform } from 'waend/lib';
import { MapState } from 'waend/map';
import { getMapExtent } from '../queries/map';
import { MapInteractionsOptions } from '../components/map/interactions';

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

const overlayState =
    dispatchK('component/mapOverlayState');
export const markOverlayClean =
    () => overlayState(clean);
export const markOverlayDirty =
    () => overlayState(dirty);



observe('component/map', s => {
    if (s.dirty !== 'clean') {
        overlayState(() => s);
    }
});


logger('loaded');
