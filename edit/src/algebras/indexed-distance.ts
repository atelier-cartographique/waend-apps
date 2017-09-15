
import { toNativeComparator } from 'fp-ts/lib/Ord';
import { Ordering } from 'fp-ts/lib/Ordering';
import { Position } from '../source/io/geojson';
import { vecDist, vecCenter } from 'waend/util';

export interface Distance {
    d: number;
}

export interface IndexedDistance extends Distance {
    o1: number;
}

export interface IndexedDistance2 extends Distance {
    o1: number;
    o2: number;
}

const compare =
    <T extends Distance>(a: T, b: T): Ordering =>
        (a.d < b.d ? 'LT' : a.d > b.d ? 'GT' : 'EQ');



export const mkIndexedDistance =
    (ls: Position[]) =>
        (o1: number, p: Position): IndexedDistance =>
            ({
                o1,
                d: vecDist(p, ls[o1]),
            });

export const mkIndexedDistance2 =
    (ls: Position[]) =>
        (o1: number, o2: number, p: Position): IndexedDistance2 =>
            ({
                o1,
                o2,
                d: vecDist(p, vecCenter(ls[o1], ls[o2])),
            });

export const comparator = toNativeComparator(compare);

