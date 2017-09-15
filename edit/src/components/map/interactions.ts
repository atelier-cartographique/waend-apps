import * as debug from 'debug';
import { DIV } from '../elements';
import { } from '../keycodes';
import { zoomToMapExtent } from '../../events/map';
import baseInteraction from './interaction-base';
import selectInteraction from './interaction-select';
import traceInteraction from './interaction-trace';
import queries from '../../queries/app';

export const logger = debug('waend:comp/map/inteactions')

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



const renderBase =
    () => DIV({
        className: 'map-interactions base',
        ...baseInteraction,
    },
        zoomToExtent(),
    );

const renderSelect =
    () => DIV({
        className: 'map-interactions select',
        ...selectInteraction,
    });

const renderTrace =
    () => DIV({
        className: 'map-interactions trace',
        ...traceInteraction,
    });

const render =
    () => {
        logger(`render ${queries.getMode()}`)
        switch (queries.getMode()) {
            case 'base': return renderBase();
            case 'select': return renderSelect();
            case 'trace': return renderTrace();
        }
    };


export default render;

logger('loaded');
