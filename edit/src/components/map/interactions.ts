import * as debug from 'debug';
import { DIV } from '../elements';
import { } from '../keycodes';
import { zoomToMapExtent, updateInteraction, transformExtent, setExtent } from '../../events/map';
import { getInteractionState, getState as getMapState } from '../../queries/map';
import { vecDist } from 'waend/util';
import { Transform, Extent } from 'waend/lib';
import { getCoordinateFromPixel, getExtent } from 'waend/map/queries';

const logger = debug('waend:comp/map/inteactions')

export interface MapInteractionsState {
    isZooming: boolean;
    isMoving: boolean;
    isPanning: boolean;
    isStarted: boolean;
    startPoint: number[];
}

export type MapInteractionsOptions = Partial<MapInteractionsState>;

export const defaultMapInteractionsState =
    (): MapInteractionsState => ({
        isZooming: false,
        isMoving: false,
        isPanning: false,
        isStarted: false,
        startPoint: [0, 0],
    });

const zoomToExtent =
    () => DIV({
        className: 'zoom-extent',
        onClick: () => {
            zoomToMapExtent();
        },
    }, 'z');


const getMouseEventPos =
    <T>(ev: React.MouseEvent<T>) => {
        const isWheel = ev.nativeEvent instanceof WheelEvent;
        const isMouse = ev.nativeEvent instanceof MouseEvent;
        if (isMouse || isWheel) {
            const target = ev.target as Element;
            const trect = target.getBoundingClientRect();
            const node = target.parentElement;
            if (node) {
                const nrect = node.getBoundingClientRect();
                return [
                    ev.clientX - (nrect.left - trect.left),
                    ev.clientY - (nrect.top - trect.top)
                ];
            }
        }
        return [0, 0];
    }

const onMouseDown =
    (event: React.MouseEvent<Element>) => {
        event.preventDefault();
        event.stopPropagation();
        updateInteraction({
            startPoint: getMouseEventPos(event),
            isStarted: true,
            isPanning: !event.shiftKey,
        });
    };

const onMouseMove =
    (_event: React.MouseEvent<Element>) => {
        const { isStarted, isPanning, isMoving } = getInteractionState();
        if (isStarted) {
            if (isPanning) {
                // drawPanControl(getMouseEventPos(event));
            }
            else {
                // drawZoomControl(getMouseEventPos(event));
            }

            if (!isMoving) {
                updateInteraction({ isMoving: true });
            }

        }
    };

const onMouseUp =
    (event: React.MouseEvent<Element>) => {
        const { startPoint, isStarted, isPanning } = getInteractionState();
        if (isStarted) {
            const endPoint = getMouseEventPos(event);
            const dist = vecDist(startPoint, endPoint);
            const gcp = getCoordinateFromPixel(getMapState());

            if (dist > 4) {
                const startCoordinates = gcp(startPoint);
                const endCoordinates = gcp(endPoint);
                if (isPanning) {
                    const tr = new Transform();
                    const extent = getExtent(getMapState());
                    tr.translate(startCoordinates[0] - endCoordinates[0],
                        startCoordinates[1] - endCoordinates[1]);
                    transformExtent(tr)(extent.getArray());
                }
                else {
                    setExtent(startCoordinates.concat(endCoordinates));
                }
            }
            // else { /* a missed click? */
            //     navigator.centerOn(startPoint);
            // }

            updateInteraction({
                isStarted: false,
                isZooming: false,
                isMoving: false,
            });
        }
    };

const getStep =
    (extent: Extent) => {
        const width = extent.getWidth();
        const height = extent.getHeight();
        const diag = Math.sqrt((width * width) + (height * height));

        return (diag / 20);
    };

const zoom =
    (s: number) =>
        <T>(event: React.WheelEvent<T>) => {
            const tr = new Transform();
            const pos = getCoordinateFromPixel(getMapState())(getMouseEventPos(event));
            const extent = getExtent(getMapState());
            const val = getStep(extent);
            tr.scale(s, s, pos);
            logger(`zoomIn ${-val} ${tr.getScale()}`);
            transformExtent(tr)(extent.getArray());
        };

const zoomIn = zoom(.8);

const zoomOut = zoom(1.2);

const onWheel =
    (event: React.WheelEvent<Element>) => {
        if (Math.abs(event.deltaY) > 2) {
            if (event.deltaY < 0) {
                zoomIn(event);
            }
            else {
                zoomOut(event);
            }
        }
    };


const render =
    () => DIV({
        className: 'map-interactions',

        onMouseDown,
        onMouseMove,
        onMouseUp,
        onWheel,

    },
        zoomToExtent(),
    );


export default render;

logger('loaded');
