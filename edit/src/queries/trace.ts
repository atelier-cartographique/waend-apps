import * as debug from 'debug';
import { query } from './index';
import { overlayData } from '../components/map/overlay';
import { fromPredicate } from 'fp-ts/lib/Option';
import { TraceStateType, TraceState } from '../components/trace';
import { Position } from '../source/io/geojson';
// import { getFeatureById } from './map';


const logger = debug('waend:queries/trace');
const get =
    <K extends keyof TraceState>(k: K): TraceState[K] =>
        query('component/trace')[k];


// tslint:disable-next-line:variable-name
const CoordOption = fromPredicate((a: TraceStateType) => a === 'LineString');

type Co = Position[] | Position[][];
const mkCoordinates =
    (): Co =>
        CoordOption(get('type'))
            .fold<Co>(
            () => [get('coordinates')], // Polygon
            () => get('coordinates'), // LineString
        );

const mkFeature =
    () => ({
        properties: {
            style: {
                strokeStyle: 'blue',
                lineWidth: 2,
            },
        },
        geom: {
            type: get('type'),
            coordinates: mkCoordinates(),
        },
    });

export const getTraceGroup =
    () => overlayData([mkFeature()]);


export const getMode =
    () => get('mode');

logger('loaded');