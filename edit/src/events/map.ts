
import * as debug from 'debug';
import { dispatch, observe } from './index';
import { Extent, Transform } from 'waend/lib';
import { MapState } from 'waend/map';
import { getMapExtent } from '../queries/map';
import { MapInteractionsOptions } from '../components/map/interactions';

const logger = debug('waend:events/map');

const dirty = (s: MapState) => ({ ...s, dirty: true });
const clean = (s: MapState) => ({ ...s, dirty: false });

export const markDirty =
    () => dispatch('component/map', dirty);

export const markClean =
    () => dispatch('component/map', clean);



observe('data/map', markDirty);

export const setRect =
    (rect: ClientRect) => dispatch('component/map', s => dirty({ ...s, rect }));

export const setExtent =
    (extent: number[]) => dispatch('component/map', s => dirty({ ...s, extent }));

export const transformExtent =
    (t: Transform) =>
        (extent: number[]) => {
            const NE = t.mapVec2([extent[2], extent[3]]);
            const SW = t.mapVec2([extent[0], extent[1]]);
            dispatch('component/map',
                s => dirty({ ...s, extent: [SW[0], SW[1], NE[0], NE[1]] }));
        };

export const bufferExtent =
    (n: number) => dispatch('component/map', (s) => {
        const e = new Extent(s.extent);
        const extent = e.buffer(n).getArray();
        return dirty({ ...s, extent });
    });

export const zoomToMapExtent =
    () => dispatch('component/map', (s) => {
        const extent = getMapExtent();
        logger('zoomToExtent', extent);
        return dirty({ ...s, extent });
    });


export const updateInteraction =
    (o: MapInteractionsOptions) =>
        dispatch('component/mapInteractions', s => ({ ...s, ...o }));

logger('loaded');
