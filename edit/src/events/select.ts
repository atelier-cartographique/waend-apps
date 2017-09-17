import * as debug from 'debug';
import { dispatchK } from './index';
import { markOverlayDirty } from './map';
import { defaultSelectState } from '../components/select';

const logger = debug('waend:events/select');
// selection
const select = dispatchK('component/select');


export const setSelectedUnder =
    (ids: string[]) => {
        select(s => ({ ...s, selectedUnder: ids }));
        markOverlayDirty();
    };


export const addToSelection =
    (id: string) => {
        select((s) => {
            const isUnder = s.selectedUnder.indexOf(id) >= 0;
            return {
                ...s,
                selection: s.selection.concat([id]),
                selectedUnder: isUnder ? s.selectedUnder : s.selectedUnder.concat([id]),
            };
        });

        markOverlayDirty();
    };


export const removeFromSelection =
    (id: string) => {
        select(s => ({ ...s, selection: s.selection.filter(i => i !== id) }));
        markOverlayDirty();
    };


export const resetSelection =
    () => {
        select(() => defaultSelectState());
        markOverlayDirty();
    };


logger('loaded');
