import { logger } from './interactions';
import {
    getMouseEventPos,
    onMouseDown,
    onMouseMove,
    onMouseUp as baseMouseUp,
    onWheel,
} from './interaction-base';
import { getFeaturesAt, getState, getSelectedUnder } from '../../queries/map';
import { setSelectedUnder, resetSelection } from '../../events/map';
import { getCoordinateFromPixel } from 'waend/map/queries';




const onMouseUp =
    (event: React.MouseEvent<Element>) => {
        const dist = baseMouseUp(event);
        logger(`select ${dist}`)
        if (dist < 4) {
            const pos = getMouseEventPos(event);
            const ids = getFeaturesAt(getCoordinateFromPixel(getState())(pos));
            if (event.shiftKey) {
                const sel = getSelectedUnder();
                logger(sel, ids);
                setSelectedUnder(sel.concat(ids));
            }
            else {
                resetSelection();
                setSelectedUnder(ids);
            }
        }
    };

export default {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
};
