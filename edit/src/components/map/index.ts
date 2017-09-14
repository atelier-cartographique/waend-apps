import * as debug from 'debug';
import { DIV } from '../elements';
import { getState, getData, checkRect, isDirty } from '../../queries/map';
import { setRect, markClean } from '../../events/map';
import interactions from './interactions';
import wmap from 'waend/map';

const logger = debug('waend:comp/map');
let ru = 0;
const un = () => { ru += 1; return ru; };

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
        const mapKey = `map-view-${un()}`;
        // const checkSize =
        //     window.addEventListener('resize', )

        const render =
            () => {
                if (isDirty()) {
                    map.render();
                    markClean();
                }
                return (
                    DIV({ className: 'map' },
                        DIV({
                            className: 'map-view',
                            key: mapKey,
                            ref: (node) => {
                                // const u = un();
                                if (node) {
                                    map.getView().attach(node);
                                    const r = node.getBoundingClientRect();
                                    if (!checkRect(r)) {
                                        setRect(r);
                                    }
                                    // const i = setInterval(() => {
                                    //     if (!node) {
                                    //         clearInterval(i);
                                    //         return;
                                    //     }
                                    //     if (!checkRect(r)) {
                                    //         setRect(r);
                                    //     }
                                    //     logger(`node[${u}] width ${node.getBoundingClientRect().width}`)
                                    // }, 1000);
                                }
                            },
                        }),
                        interactions()))
                    ;
            };

        return render;
    };

export default renderFn;
logger('loaded');