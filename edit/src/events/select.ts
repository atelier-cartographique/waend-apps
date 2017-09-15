import { dispatchK } from './index';
import { makeOverlayDirty } from './map';

// selection
const select = dispatchK('component/select');


export const setSelectedUnder =
    (ids: string[]) => {
        select(s => ({ ...s, selectedUnder: ids }));
        makeOverlayDirty();
    };


export const addToSelection =
    (id: string) => {
        select(s => ({ ...s, selection: s.selection.concat([id]) }));
        makeOverlayDirty();
    };


export const removeFromSelection =
    (id: string) => {
        select(s => ({ ...s, selection: s.selection.filter(i => i !== id) }));
        makeOverlayDirty();
    };


export const resetSelection =
    () => {
        select(s => ({ ...s, selection: [] }));
        makeOverlayDirty();
    };
