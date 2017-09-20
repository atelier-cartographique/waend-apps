import {
    getMouseEventPos,
    onMouseDown,
    onMouseUp as baseMouseUp,
    onWheel,
    onMouseMove,
} from './interaction-base';
import { checkImportMode } from '../../queries/import';
import { getState } from '../../queries/map';
import { getCoordinateFromPixel } from 'waend/map/queries';
import { updateInteraction } from '../../events/map';
import { pushPosition } from '../../events/import';




const onMouseUp =
    (event: React.MouseEvent<Element>) => {
        checkImportMode('server').fold(
            () => { // user mode
                updateInteraction({
                    isStarted: false,
                    isZooming: false,
                    isMoving: false,
                });
            },
            () => { // server mode
                const dist = baseMouseUp(event);
                if (dist < 4) {
                    const pos = getCoordinateFromPixel(getState())(getMouseEventPos(event));
                    pushPosition(pos);
                }
            },
        );
    };

export default {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
};
