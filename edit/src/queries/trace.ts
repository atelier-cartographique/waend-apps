import * as debug from 'debug';
import { query } from './index';
import { overlayData } from '../components/map/overlay';
import { fromPredicate } from 'fp-ts/lib/Option';
import { TraceStateType, TraceState, TraceStateMode } from '../components/trace';
import { Position } from '../source/io/geojson';
import * as uuid from 'uuid';
// import { getFeatureById } from './map';


const logger = debug('waend:queries/trace');
const get =
    <K extends keyof TraceState>(k: K): TraceState[K] =>
        query('component/trace')[k];

export const isNew = () => get('featureId') === null;
const maybeLineString = fromPredicate((a: TraceStateType) => a === 'LineString');
const maybePolygon = fromPredicate((a: TraceStateType) => a === 'Polygon');

export const isLineString = () => maybeLineString(get('type'))
export const isPolygon = () => maybePolygon(get('type'))


type Co = Position[] | Position[][];
const mkCoordinates =
    (t: TraceStateType): Co =>
        maybeLineString(t)
            .fold<Co>(
            () => [get('coordinates')], // Polygon
            () => get('coordinates'), // LineString
        );

const mkLineFeature =
    () => ({
        id: uuid(),
        properties: {
            style: {
                strokeStyle: 'blue',
                lineWidth: 2,
            },
        },
        geom: {
            type: 'LineString',
            coordinates: mkCoordinates('LineString'),
        },
    });

const mkPolygonFeature =
    () => ({
        id: uuid(),
        properties: {
            style: {
                strokeStyle: 'green',
                lineWidth: 1,
            },
        },
        geom: {
            type: 'Polygon',
            coordinates: mkCoordinates('Polygon'),
        },
    });

const mkFeature =
    (t: TraceStateType) => maybeLineString(t).fold(
        () => ([mkPolygonFeature(), mkLineFeature()]),
        () => ([mkLineFeature()]),
    );

export const getTraceGroup =
    () => overlayData(mkFeature(get('type')));


export const getMode =
    () => get('mode');

export const checkMode =
    (m: TraceStateMode) => fromPredicate(() => get('mode') === m)(m);

logger('loaded');