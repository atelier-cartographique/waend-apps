import * as debug from 'debug';
import { DIV } from '../elements';
import appQueries from '../../queries/app';
import { getState, getData, checkRect, isDirty } from '../../queries/map';
import { setRect, markClean } from '../../events/map';
import interactions from './interactions';
import overlay from './overlay';
import wmap from 'waend/map';
import { getImportData } from '../../queries/import';

const logger = debug('waend:comp/map');
// let ru = 0;
// const un = () => { ru += 1; return ru; };

// const onResize =
//     (node: Element) =>
//         () => {
//             const r = node.getBoundingClientRect();
//             if (!checkRect(r)) {
//                 setRect(r);
//             }
//         }

const renderFn =
    () => {
        const map = wmap(getState, getData);
        const importMap = wmap(getState, getImportData);
        const overlayInst = overlay();

        const render =
            () => {
                if (isDirty()) {
                    map.render();
                    if (appQueries.getMode() === 'import') {
                        importMap.render();
                    }
                    markClean();
                }
                const maps: React.ReactNode[] = [
                    DIV({
                        className: 'map-view',
                        ref: (node) => {
                            if (node) {
                                map.getView().attach(node);
                                const r = node.getBoundingClientRect();
                                if (!checkRect(r)) {
                                    setRect(r);
                                }
                            }
                        },
                    }),
                ];
                if (appQueries.getMode() === 'import') {
                    maps.push(DIV({
                        className: 'import-view',
                        ref: (node) => {
                            if (node) {
                                importMap.getView().attach(node);
                            }
                        },
                    }));
                }
                return (
                    DIV({ className: 'map' },
                        ...maps,
                        overlayInst(),
                        interactions()))
                    ;
            };

        return render;
    };

export default renderFn;
logger('loaded');