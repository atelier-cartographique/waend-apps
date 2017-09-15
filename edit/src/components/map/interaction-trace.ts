// import { logger } from './interactions';
import {
    getMouseEventPos,
    onMouseDown,
    onMouseMove,
    onMouseUp as baseMouseUp,
    onWheel,
} from './interaction-base';
import { getState } from '../../queries/map';
import { getMode } from '../../queries/trace';
import {
    pushPosition,
    deletePosition,
    insertPosition,
} from '../../events/trace';
import { getCoordinateFromPixel } from 'waend/map/queries';




const onMouseUp =
    (event: React.MouseEvent<Element>) => {
        const dist = baseMouseUp(event);
        if (dist < 4) {
            const pos = getCoordinateFromPixel(getState())(getMouseEventPos(event));
            switch (getMode()) {
                case 'add': return pushPosition(pos);
                case 'insert': return insertPosition(pos);
                case 'delete': return deletePosition(pos);
            }

        }
    };

export default {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
};
