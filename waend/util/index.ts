
import * as proj4 from 'proj4';
import { vec2 } from 'gl-matrix';
import {
    Transform, Model, CoordPolygon, CoordLinestring, CoordPoint
} from "../lib";

// export * from './dom';

export function getModelName(model: Model) {
    const name = model.get('name', null);
    if (name) {
        return JSON.stringify(name);
    }
    return `•${model.id.substr(0, 6)}`;
}


export function copy<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

export interface UserComponents {
    pathType: 'user';
    user: string;
}
export interface GroupComponents {
    pathType: 'group';
    user: string;
    group: string;
}
export interface LayerComponents {
    pathType: 'layer';
    user: string;
    group: string;
    layer: string;
}
export interface FeatureComponents {
    pathType: 'feature';
    user: string;
    group: string;
    layer: string;
    feature: string;
}

export type Components = UserComponents | GroupComponents | LayerComponents | FeatureComponents;

export const getPathComponents: (a: string) => (Components | null) =
    (path) => {
        const comps = path.split('/').slice(1);

        if (4 === comps.length) {
            return {
                pathType: 'feature',
                user: comps[0],
                group: comps[1],
                layer: comps[2],
                feature: comps[3],
            };
        }
        else if (3 === comps.length) {
            return {
                pathType: 'layer',
                user: comps[0],
                group: comps[1],
                layer: comps[2],
            };
        }
        else if (2 === comps.length) {
            return {
                pathType: 'group',
                user: comps[0],
                group: comps[1],
            };
        }
        else if (1 === comps.length) {
            return {
                pathType: 'user',
                user: comps[0],
            };
        }

        return null;
    }




export function pathKey(objOpt: any, pathOpt: string, def: any): any {
    const path = pathOpt.split('.');
    let obj: any = objOpt;
    for (let i = 0, len = path.length; i < len; i++) {
        if (!obj || (typeof obj !== 'object')) {
            return def;
        }
        const p = path[i];
        obj = obj[p];
    }
    if (obj === undefined) {
        return def;
    }
    return obj;
}


// GEOM
// EPSILON does not exist in es5
export const EPSILON = 2.220446049250313e-16;

export function isZero(val: number) {
    return Math.abs(val) <= EPSILON;
}


export function vecDist<T extends (vec2 | number[])>(v1: T, v2: T): number {
    const dx = v2[0] - v1[0];
    const dy = v2[1] - v1[1];
    return Math.sqrt((dx * dx) + (dy * dy));
}


export function vecAdd<T extends (vec2 | number[])>(v1: T, v2: T, a: number): [number, number] {
    const t = a / vecDist(v1, v2);
    const rx = v1[0] + (v2[0] - v1[0]) * t;
    const ry = v1[1] + (v2[1] - v1[1]) * t;
    return [rx, ry];
}


export function vecEquals(v1: number[], v2: number[]) {
    return (vecDist(v1, v2) < EPSILON);
}

export function vecCenter(v1: number[], v2: number[]) {
    const x = v1[0] + ((v2[0] - v1[0]) / 2);
    const y = v1[1] + ((v2[1] - v1[1]) / 2);
    return [x, y];
}




export function lineAngle<T extends (vec2 | number[])>(start: T, end: T): number {
    const d = [end[0] - start[0], end[1] - start[1]];
    const theta = Math.atan2(-d[1], d[0]) * 360.0 / 6.2831853071795;
    const theta_normalized = theta < 0 ? theta + 360 : theta;
    if (theta_normalized > 360) {
        return 0;
    }
    return theta_normalized;
}

export function transformExtent(extent: number[], T: Transform) {
    const min = extent.slice(0, 2);
    const max = extent.slice(2);
    T.mapVec2(vec2.clone(min));
    T.mapVec2(vec2.clone(max));
    return min.concat(max);
}


function floorVec2<T extends (vec2 | number[])>(v: T) {
    v[0] = Math.floor(v[0]);
    v[1] = Math.floor(v[1]);
    return v;
}


export const polygonTransform = (T: Transform, coordinates: CoordPolygon) => {
    for (let i = 0; i < coordinates.length; i++) {
        const ringLength = coordinates[i].length;
        for (let ii = 0; ii < ringLength; ii++) {
            coordinates[i][ii] = T.mapVec2(coordinates[i][ii]);
        }
    }
    return coordinates;
};


export const lineTransform = (T: Transform, coordinates: CoordLinestring) => {
    for (let i = 0; i < coordinates.length; i++) {
        coordinates[i] = T.mapVec2(coordinates[i]);
        // coordinates[i] = floorVec2(T.mapVec2(coordinates[i]));
    }
    return coordinates;
};


export const polygonFloor = (coordinates: CoordPolygon) => {
    for (let i = 0; i < coordinates.length; i++) {
        const ringLength = coordinates[i].length;
        for (let ii = 0; ii < ringLength; ii++) {
            coordinates[i][ii] = floorVec2(coordinates[i][ii]);
            // coordinates[i][ii] = floorVec2(T.mapVec2(coordinates[i][ii]));
        }
    }
    return coordinates;
};


export const lineFloor = (coordinates: CoordLinestring) => {
    for (let i = 0; i < coordinates.length; i++) {
        coordinates[i] = floorVec2(coordinates[i]);
        // coordinates[i] = floorVec2(T.mapVec2(coordinates[i]));
    }
    return coordinates;
};


// GEO

export const { forward, inverse } = proj4(proj4.WGS84, 'EPSG:3857');

export function projectExtent(extent: number[]) {
    const p0 = extent.slice(0, 2);
    const p1 = extent.slice(2);
    const min = forward(p0);
    const max = forward(p1);

    return min.concat(max);
}

export function unprojectExtent(extent: number[]) {
    const p0 = extent.slice(0, 2);
    const p1 = extent.slice(2);
    const min = inverse(p0);
    const max = inverse(p1);

    return min.concat(max);
}




export const polygonProject = (coordinates: CoordPolygon) => {
    for (let i = 0; i < coordinates.length; i++) {
        const ringLength = coordinates[i].length;
        for (let ii = 0; ii < ringLength; ii++) {
            coordinates[i][ii] = forward(coordinates[i][ii]);
        }
    }
    return coordinates;
};

export const lineProject = (coordinates: CoordLinestring) => {
    for (let i = 0; i < coordinates.length; i++) {
        coordinates[i] = forward(coordinates[i]);
    }
    return coordinates;
};

export const pointProject = (coordinates: CoordPoint) => {
    coordinates = forward(coordinates);

    return coordinates;
};

export const pointUnproject = (coordinates: CoordPoint) => {
    coordinates = inverse(coordinates);

    return coordinates;
};



// export function layerExtent(layer: Layer) {
//     const path = layer.getPath();

//     return (
//         getBinder()
//             .getFeatures(path[0], path[1], path[2])
//             .then(features => {
//                 let extent;

//                 for (const feature of features) {
//                     if (extent) {
//                         addExtent(feature, extent);
//                     }
//                     else {
//                         extent = feature.getGeometry().getExtent();
//                     }
//                 }

//                 return extent;
//             })
//     );
// }

