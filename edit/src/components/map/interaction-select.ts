import { logger } from './interactions';
import {
    getMouseEventPos,
    onMouseDown,
    onMouseMove,
    onMouseUp as baseMouseUp,
    onWheel,
} from './interaction-base';
import { getFeaturesAt, getState } from '../../queries/map';
import { setSelectedUnder } from '../../events/map';
import { getCoordinateFromPixel } from 'waend/map/queries';




const onMouseUp =
    (event: React.MouseEvent<Element>) => {
        const dist = baseMouseUp(event);
        logger(`select ${dist}`)
        if (dist < 4) {
            const pos = getMouseEventPos(event);
            const ids = getFeaturesAt(getCoordinateFromPixel(getState())(pos));
            setSelectedUnder(ids);
        }
    };

export default {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
};
