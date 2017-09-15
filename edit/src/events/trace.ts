import * as debug from 'debug';
import { dispatchK } from './index';
import { markOverlayDirty } from './map';
import { Position } from '../source/io/geojson';
import { TraceStateMode } from '../components/trace';

const logger = debug('waend:events/trace');
const trace = dispatchK('component/trace');

export const pushPosition =
    (p: Position) => {
        logger(p);
        trace(s => ({ ...s, coordinates: s.coordinates.concat([p]) }));
        markOverlayDirty();
    };

export const setMode =
    (mode: TraceStateMode) => trace(s => ({ ...s, mode }));


logger('loaded');
