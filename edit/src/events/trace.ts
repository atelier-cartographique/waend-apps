import * as debug from 'debug';
import { dispatchK } from './index';
import { markOverlayDirty } from './map';
import { Position } from '../source/io/geojson';
import { TraceStateMode, defaultTraceState } from '../components/trace';
import { mkIndexedDistance, mkIndexedDistance2, comparator } from '../algebras/indexed-distance';
import { fromNullable } from 'fp-ts/lib/Option';
import { insertAt, deleteAt, modifyAt, last, head } from 'fp-ts/lib/Array';
import { getPixelFromCoordinate } from 'waend/map/queries';
import { MapState } from 'waend/map';
import { vecDist } from 'waend/util';
import { mkLineString, mkPolygon } from 'waend/lib';
import { getState } from '../queries/map';
import appEvents from '../events/app';
import { addToSelection } from './select';

const logger = debug('waend:events/trace');
const trace = dispatchK('component/trace');

const logF = <T>(name: string, a: T) => {
    logger(`${name} => ${a}`);
    return a;
};
// const optionTrue = fromPredicate<boolean>(b => b)


export const resetLine =
    () => trace(() => ({ ...defaultTraceState(), type: 'LineString' }));

export const resetPolygon =
    () => trace(() => ({ ...defaultTraceState(), type: 'Polygon' }));


const pixelDistance =
    (s: MapState) =>
        (ps: Position[]) => {
            const gpc = getPixelFromCoordinate(s);
            const fp = gpc(ps[0]);
            return ps.map(p => logF(`gpc ${p}`, gpc(p)))
                .map(p => logF(`vecDist`, vecDist(fp, p)))
                .reduce((acc, v) => acc + v, 0);
        };


const checkLineEnd =
    (ps: Position[], p: Position) => last(ps).fold(
        () => false,
        lp => logF('pixelDistance', pixelDistance(getState())([lp, p])) < 4,
    );
const checkPolygonEnd =
    (ps: Position[], p: Position) => head(ps).fold(
        () => false,
        lp => logF('pixelDistance', pixelDistance(getState())([lp, p])) < 4,
    );

const createFeature =
    (t: 'LineString' | 'Polygon') =>
        (ps: Position[]) => {
            const geom = t === 'LineString' ? mkLineString(ps) : mkPolygon([ps]);
            appEvents.createFeature(geom, {})
                // .then((feature: any) => trace(s => ({ ...s, featureId: feature.id })))
                .then((feature: any) => {
                    logger(`createFeature success ${feature}`)
                    appEvents.setMode('select');
                    addToSelection(feature.id);
                })
                .catch(err => logger(`createFeature err ${err}`));
        };


export const pushPosition =
    (p: Position) => {
        trace((s) => {
            if (s.type === 'LineString' && checkLineEnd(s.coordinates, p)) {
                createFeature(s.type)(s.coordinates);
                return s;
            }
            else if (s.type === 'Polygon' && checkPolygonEnd(s.coordinates, p)) {
                const coordinates = s.coordinates.concat([s.coordinates[0]]);
                createFeature(s.type)(coordinates);
                return ({ ...s, coordinates });
            }
            return ({ ...s, coordinates: s.coordinates.concat([p]) });
        });
        markOverlayDirty();
    };


const getInsertIndex =
    (ls: Position[], p: Position) => {
        if (ls.length < 2) {
            return ls.length;
        }
        const mid = mkIndexedDistance2(ls);
        const initial = [mid(0, 1, p)];
        return (
            fromNullable(
                ls.reduce((acc, _lp, i) =>
                    (i > 0 ? acc.concat([mid(i - 1, i, p)]) : acc), initial)
                    .sort(comparator)[0])
                .fold(
                () => 0,
                dix => dix.o2));
    };

const getCloserIndex =
    (ls: Position[], p: Position) => {
        const mid = mkIndexedDistance(ls);
        const initial = [mid(0, p)];
        return (
            fromNullable(ls.slice(1)
                .reduce((acc, _lp, i) => acc.concat([mid(i, p)]), initial)
                .sort(comparator)[0])
                .fold(
                () => 0,
                dix => dix.o1));
    };

export const insertPosition =
    (p: Position) => {
        trace((s) => {
            return {
                ...s,
                coordinates: insertAt(
                    getInsertIndex(s.coordinates, p),
                    p,
                    s.coordinates,
                ).fold(() => s.coordinates, a => a),
            };
        });
        markOverlayDirty();
    };

export const deletePosition =
    (p: Position) => {
        trace((s) => {
            return {
                ...s,
                coordinates: deleteAt(
                    getCloserIndex(s.coordinates, p),
                    s.coordinates,
                ).fold(() => s.coordinates, a => a),
            };
        });
        markOverlayDirty();
    };

export const movePosition =
    (p: Position) => {
        logger(`movePosition ${p}`);
        trace((s) => {
            return {
                ...s,
                coordinates: modifyAt(
                    getCloserIndex(s.coordinates, p),
                    () => p,
                    s.coordinates,
                ).fold(() => s.coordinates, a => a),
            };
        });
        markOverlayDirty();
    };


export const setMode =
    (mode: TraceStateMode) => trace(s => ({ ...s, mode }));


logger('loaded');
