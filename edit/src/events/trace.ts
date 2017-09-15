import * as debug from 'debug';
import { dispatchK } from './index';
import { markOverlayDirty } from './map';
import { Position } from '../source/io/geojson';
import { TraceStateMode } from '../components/trace';
import { mkIndexedDistance, mkIndexedDistance2, comparator } from '../algebras/indexed-distance';
import { fromNullable } from 'fp-ts/lib/Option';
import { insertAt, deleteAt } from 'fp-ts/lib/Array';

const logger = debug('waend:events/trace');
const trace = dispatchK('component/trace');

export const pushPosition =
    (p: Position) => {
        trace(s => ({ ...s, coordinates: s.coordinates.concat([p]) }));
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
    }

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
    }

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



export const setMode =
    (mode: TraceStateMode) => trace(s => ({ ...s, mode }));


logger('loaded');
