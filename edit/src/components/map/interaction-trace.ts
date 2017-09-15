// import { logger } from './interactions';
import {
    getMouseEventPos,
    onMouseDown,
    onMouseMove,
    onMouseUp as baseMouseUp,
    onWheel,
} from './interaction-base';
import { getState } from '../../queries/map';
import { pushPosition } from '../../events/trace';
import { getCoordinateFromPixel } from 'waend/map/queries';




const onMouseUp =
    (event: React.MouseEvent<Element>) => {
        const dist = baseMouseUp(event);
        if (dist < 4) {
            const pos = getCoordinateFromPixel(getState())(getMouseEventPos(event));
            pushPosition(pos);
        }
    };

export default {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
};
