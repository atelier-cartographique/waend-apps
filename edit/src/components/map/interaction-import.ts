import {
    // getMouseEventPos,
    onMouseDown,
    onMouseUp,
    onWheel,
} from './interaction-base';
// import { getState, getInteractionState } from '../../queries/map';
// import { getCoordinateFromPixel } from 'waend/map/queries';
// import { updateInteraction } from '../../events/map';


// const onMouseMove =
//     (event: React.MouseEvent<Element>) => {
//         const { isStarted, isMoving } = getInteractionState();
//         if (isStarted) {
//             if (!isMoving) {
//                 updateInteraction({ isMoving: true });
//             }
//             else if (getMode() === 'move') {
//                 const pos = getCoordinateFromPixel(getState())(getMouseEventPos(event));
//                 movePosition(pos);
//             }
//         }

//     };


// const onMouseUp =
//     (event: React.MouseEvent<Element>) => {
//         checkMode('move').fold(
//             () => {
//                 const dist = baseMouseUp(event);
//                 if (dist < 4) {
//                     const pos = getCoordinateFromPixel(getState())(getMouseEventPos(event));
//                     switch (getMode()) {
//                         case 'add': return pushPosition(pos);
//                         case 'insert': return insertPosition(pos);
//                         case 'delete': return deletePosition(pos);
//                     }

//                 }
//             },
//             () => {
//                 updateInteraction({
//                     isStarted: false,
//                     isZooming: false,
//                     isMoving: false,
//                 });
//                 setMode('add');
//             },
//         );
//     };

export default {
    onMouseDown,
    // onMouseMove,
    onMouseUp,
    onWheel,
};
