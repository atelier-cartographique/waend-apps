/*
 * src/Geometry.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-lib package.
 *
 *  waend-lib is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-lib is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-lib.  If not, see <http://www.gnu.org/licenses/>.
 */


import {
    DirectGeometryObject,
    Feature,
    GeometryObject,
    LineString as GeoJSONLineString,
    Point as GeoJSONPoint,
    Polygon as GeoJSONPolygon,
    Position,
} from 'geojson-iots';
import { bbox, bboxPolygon } from '@turf/turf';




function copy<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}


export type CoordPoint = Position;
export type CoordLinestring = Position[];
export type CoordPolygon = Position[][];
export type Coordinates =
    | CoordPoint
    | CoordLinestring
    | CoordPolygon
    ;

export interface IFeature {
    geometry: DirectGeometryObject;
}


export const isDirectGeometry =
    (g: GeometryObject): g is DirectGeometryObject =>
        g.type !== 'GeometryCollection';


export const mkPoint =
    (coordinates: CoordPoint): GeoJSONPoint => ({ type: 'Point', coordinates });

export const mkLineString =
    (coordinates: CoordLinestring): GeoJSONLineString => ({ type: 'LineString', coordinates });

export const mkPolygon =
    (coordinates: CoordPolygon): GeoJSONPolygon => ({ type: 'Polygon', coordinates });




function geomToFeature(geom: DirectGeometryObject): Feature {
    return {
        type: 'Feature',
        geometry: geom,
        properties: {},
    };
}

export class Geometry {
    protected geometry: DirectGeometryObject;

    constructor(data: DirectGeometryObject) {
        this.geometry = copy(data);
    }

    static fromJSONGeometry(data: DirectGeometryObject) {
        return new Geometry(data);
    }

    static fromJSONFeature(data: Feature) {
        if (data.geometry !== null && isDirectGeometry(data.geometry)) {
            return new Geometry(data.geometry);
        }
        return null;
    }

    static fromGeometry(data: Geometry) {
        return new Geometry(data.geometry);
    }

    clone() {
        return Geometry.fromGeometry(this);
    }

    getType() {
        return this.geometry.type;
    }

    getCoordinates() {
        return copy(this.geometry.coordinates);
    }

    getExtent() {
        return (new Extent(bbox(geomToFeature(this.geometry))));
    }

    toGeoJSON() {
        return copy(this.geometry);
    }
}


export class Point extends Geometry {
    getCoordinates(): CoordPoint {
        return copy<CoordPoint>(<CoordPoint>this.geometry.coordinates);
    }
}


export class LineString extends Geometry {

    getCoordinates(): CoordLinestring {
        return copy<CoordLinestring>(<CoordLinestring>this.geometry.coordinates);
    }

    appendCoordinate(optPoint: Position) {
        const p = new Point(mkPoint(optPoint));
        const geometry = this.geometry as GeoJSONLineString;
        const coords = p.getCoordinates();
        geometry.coordinates.push(coords);
    }

}


export class Polygon extends Geometry {
    getCoordinates(): CoordPolygon {
        return copy<CoordPolygon>(<CoordPolygon>this.geometry.coordinates);
    }
}

export type Rect = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export type ExtentOpt = Extent | Geometry | Rect | number[];

export class Extent {
    protected extent: number[];

    constructor(extent: ExtentOpt) { // whether from an [minx, miny, maxx, maxy] extent or an Extent
        if (extent instanceof Extent) {
            this.extent = extent.getArray();
        }
        else if (extent instanceof Geometry) {
            this.extent = extent.getExtent().getArray();
        }
        else if (('top' in extent) && ('left' in extent)
            && ('right' in extent) && ('bottom' in extent)) {
            const e = <Rect>extent;
            this.extent = [e.left, e.top, e.right, e.bottom];
        }
        else {
            this.extent = copy(<number[]>extent);
        }
    }

    getArray() {
        return copy(this.extent);
    }

    getCoordinates() {
        return copy(this.extent);
    }

    getDictionary(): rbush.BBox {
        return {
            minX: this.extent[0],
            minY: this.extent[1],
            maxX: this.extent[2],
            maxY: this.extent[3],
        };
    }

    clone() {
        return (new Extent(this));
    }

    toPolygon() {
        const tmp = bboxPolygon(this.extent) as Feature;
        return (new Polygon(tmp.geometry as GeoJSONPolygon));
    }

    normalize() {
        let tmp;
        if (this.extent[0] > this.extent[2]) {
            tmp = this.extent[0];
            this.extent[0] = this.extent[2];
            this.extent[2] = tmp;
        }
        if (this.extent[1] > this.extent[3]) {
            tmp = this.extent[1];
            this.extent[1] = this.extent[3];
            this.extent[3] = tmp;
        }
        return this;
    }

    intersects(v: number[]) {
        const r = v;
        const e = this.extent;
        // if it's a point, make it a rect
        if (2 === v.length) {
            r.push(v[0]);
            r.push(v[1]);
        }
        return (
            e[0] <= r[2]
            && r[0] <= e[2]
            && e[1] <= r[3]
            && r[1] <= e[3]
        );
    }

    add(optExtent: any) {
        const extent = (optExtent instanceof Extent) ? optExtent : new Extent(optExtent);
        this.extent[0] = Math.min(this.extent[0], extent.extent[0]);
        this.extent[1] = Math.min(this.extent[1], extent.extent[1]);
        this.extent[2] = Math.max(this.extent[2], extent.extent[2]);
        this.extent[3] = Math.max(this.extent[3], extent.extent[3]);
        return this;
    }

    bound(optExtent: any) {
        const e = (new Extent(optExtent)).getCoordinates();
        const result = new Array(4);

        result[0] = Math.max(e[0], this.extent[0]);
        result[1] = Math.max(e[1], this.extent[1]);
        result[2] = Math.min(e[2], this.extent[2]);
        result[3] = Math.min(e[3], this.extent[3]);
        return (new Extent(result));
    }

    buffer(value: number) {
        const w = this.getWidth();
        const h = this.getHeight();
        const d = Math.sqrt((w * w) + (h * h));
        const dn = d + value;
        const wn = w * (dn / d);
        const hn = h * (dn / d);
        const c = this.getCenter().getCoordinates();
        this.extent = [
            c[0] - (wn / 2),
            c[1] - (hn / 2),
            c[0] + (wn / 2),
            c[1] + (hn / 2),
        ];
        return this;
    }

    maxSquare() {
        const w = this.getWidth();
        const h = this.getHeight();
        if (w < h) {
            const bw = (h - w) / 2;
            this.extent[0] -= bw;
            this.extent[2] += bw;
        }
        else if (h < w) {
            const bh = (w - h) / 2;
            this.extent[1] -= bh;
            this.extent[3] += bh;
        }
        return this;
    }

    minSquare() {
        // TODO
    }

    getHeight() {
        return Math.abs(this.extent[3] - this.extent[1]);
    }

    getWidth() {
        return Math.abs(this.extent[2] - this.extent[0]);
    }

    getBottomLeft() {
        const p = mkPoint([this.extent[0], this.extent[1]]);
        return (new Point(p));
    }

    getBottomRight() {
        const p = mkPoint([this.extent[2], this.extent[1]]);
        return (new Point(p));
    }

    getTopLeft() {
        const p = mkPoint([this.extent[0], this.extent[3]]);
        return (new Point(p));
    }

    getTopRight() {
        const p = mkPoint([this.extent[2], this.extent[3]]);
        return (new Point(p));
    }

    getCenter() {
        const p = mkPoint([
            (this.extent[0] + this.extent[2]) / 2,
            (this.extent[1] + this.extent[3]) / 2,
        ]);
        return (new Point(p));
    }

    getSurface() {
        return this.getHeight() * this.getWidth();
    }
}


export function toDMS(lat: number, lng: number) {
    let latD;
    let latM;
    let latS;
    let lngD;
    let lngM;
    let lngS;
    let latAbs;
    let lngAbs;
    let latAz;
    let lngAz;
    // if (_.isArray(lat)) {
    //     lng = lat[0];
    //     lat = lat[1];
    // }

    latAbs = Math.abs(lat);
    lngAbs = Math.abs(lng);
    latAz = (lat < 0) ? 'S' : 'N';
    lngAz = (lng < 0) ? 'W' : 'E';

    latD = Math.floor(latAbs);
    latM = Math.floor(60 * (latAbs - latD));
    latS = 3600 * (latAbs - latD - latM / 60);


    lngD = Math.floor(lngAbs);
    lngM = Math.floor(60 * (lngAbs - lngD));
    lngS = 3600 * (lngAbs - lngD - lngM / 60);

    return [
        `${latD}°`, `${latM}'`, `${latS.toPrecision(4)}'`, latAz,
        `${lngD}°`, `${lngM}'`, `${lngS.toPrecision(4)}'`, lngAz,
    ].join(' ');
}




