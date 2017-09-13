
import { dispatch, observe } from './index';
import { Extent } from 'waend/lib';
import { MapState } from 'waend/map';

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


export const bufferExtent =
    (n: number) => dispatch('component/map', (s) => {
        const e = new Extent(s.extent);
        const extent = e.buffer(n).getArray();
        return dirty({ ...s, extent });
    });
