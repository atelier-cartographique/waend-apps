
import { Ord } from 'fp-ts/lib/Ord';
import { Ordering } from 'fp-ts/lib/Ordering';
import { Position } from '../source/io/geojson';
import { vecDist } from 'waend/util';

export interface IndexedDistance {
    o1: number;
    o2: number;
    d: number;
}

const equals =
    (a: IndexedDistance, b: IndexedDistance) => a.d === b.d;

const compare =
    (a: IndexedDistance, b: IndexedDistance): Ordering =>
        (a.d < b.d ? 'LT' : a.d > b.d ? 'GT' : 'EQ');

export const ordIDistance: Ord<IndexedDistance> = {
    equals,
    compare,
};


export const mkIndexedDistance =
    (seg: Position[]) =>
        (o1: number, o2: number, p: Position) =>
            vecDist(p, seg[o1]) + vecDist(p, seg[o2]);

