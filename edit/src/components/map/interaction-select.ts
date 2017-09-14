import { onWheel, getMouseEventPos } from './interaction-base';
import { getFeaturesAt, getState } from '../../queries/map';
import { setSelectedUnder } from '../../events/map';
import { getCoordinateFromPixel } from 'waend/map/queries';

const onMouseDown =
    (_event: React.MouseEvent<Element>) => {

    };

const onMouseMove =
    (_event: React.MouseEvent<Element>) => {

    };

const onMouseUp =
    (_event: React.MouseEvent<Element>) => {

    };

const onClick =
    (event: React.MouseEvent<Element>) => {
        const pos = getMouseEventPos(event);
        const ids = getFeaturesAt(getCoordinateFromPixel(getState())(pos));
        setSelectedUnder(ids);
    };




export default {
    onClick,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
};
