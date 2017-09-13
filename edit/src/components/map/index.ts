
import { DIV } from '../elements';
import { getState, getData, isDirty, checkRect } from '../../queries/map';
import { setRect } from '../../events/map';
import interactions from './interactions';
import wmap from 'waend/map';



const renderFn =
    () => {
        const map = wmap(getState, getData);
        const render =
            () => {
                if (isDirty()) {
                    map.render();
                }
                return (
                    DIV({ className: 'map' },
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
                        interactions()))
                    ;
            };

        return render;
    };

export default renderFn;
