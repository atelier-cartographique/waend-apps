import { dispatchK } from './index';
import { markOverlayDirty } from './map';

// selection
const select = dispatchK('component/select');


export const setSelectedUnder =
    (ids: string[]) => {
        select(s => ({ ...s, selectedUnder: ids }));
        markOverlayDirty();
    };


export const addToSelection =
    (id: string) => {
        select(s => ({ ...s, selection: s.selection.concat([id]) }));
        markOverlayDirty();
    };


export const removeFromSelection =
    (id: string) => {
        select(s => ({ ...s, selection: s.selection.filter(i => i !== id) }));
        markOverlayDirty();
    };


export const resetSelection =
    () => {
        select(s => ({ ...s, selection: [] }));
        markOverlayDirty();
    };
