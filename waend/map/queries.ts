import { MapState } from './index';
import { Transform, Extent } from '../lib';
import { Region } from '../shell';
import { pointProject, pointUnproject } from '../util';



// type placeholders - got no time thes days
export type Group = any;
export type Layer = any;
export type Feature = any;

export const getLayers =
    (data: Group): Layer[] => {
        if ('layers' in data) {
            return data.layers;
        }
        return [];
    };


export const getFeatures =
    (data: Group, lid: string): Feature[] => {
        const layer = getLayers(data).find(l => l.id === lid);
        if (!layer) {
            return [];
        }
        return layer.features;
    };

export const projectedExtent =
    (extent: Extent) => {
        const bl = pointProject(
            extent.getBottomLeft().getCoordinates());
        const tr = pointProject(
            extent.getTopRight().getCoordinates());
        const pr = [bl[0], bl[1], tr[0], tr[1]];
        return new Extent(pr);
    };

export const getExtent =
    (s: MapState) => {
        return (new Extent(s.extent));
    };

export const getProjectedExtent =
    (s: MapState) => {
        return projectedExtent(getExtent(s));
    };

export const getRect =
    (state: MapState) => {
        return state.rect;
    };


export const getAdjustedExtent =
    (state: MapState) => {
        const extent = getProjectedExtent(state);
        const rect = getRect(state);
        const sx = rect.width / Math.abs(extent.getWidth());
        const sy = rect.height / Math.abs(extent.getHeight());
        const s = (sx < sy) ? sx : sy;
        const center = extent.getCenter().getCoordinates();
        const aExtent = extent.getArray();
        if (sx < sy) {
            // adjust extent height
            const newHeight = rect.height * (1 / s);

            const adjH = newHeight / 2;
            aExtent[1] = center[1] - adjH;
            aExtent[3] = center[1] + adjH;
        }
        else {
            // adjust extent width
            const newWidth = rect.width * (1 / s);

            const adjW = newWidth / 2;
            aExtent[0] = center[0] - adjW;
            aExtent[2] = center[0] + adjW;
        }
        return (new Extent(aExtent));
    };

export const getTransform =
    (state: MapState) => {
        const extent = getAdjustedExtent(state);
        const rect = getRect(state);
        const targetCenter = [rect.width / 2, rect.height / 2];
        const sourceCenter = extent.getCenter().getCoordinates();
        const sx = rect.width / Math.abs(extent.getWidth());
        const sy = rect.height / Math.abs(extent.getHeight());
        const s = (sx < sy) ? sx : sy;
        const trX = (targetCenter[0] - sourceCenter[0]) * s;
        const trY = (targetCenter[1] - sourceCenter[1]) * s;
        const axis = [targetCenter[0], targetCenter[1]];

        const t = new Transform();
        t.translate(trX, -trY);
        t.scale(s, -s, axis);
        return t;
    };


export const getGeoExtent =
    (state: MapState) => {
        const pWorld = Region.getWorldExtent().getCoordinates();
        const minPWorld = pointProject([pWorld[0], pWorld[1]]);
        const maxPWorld = pointProject([pWorld[2], pWorld[3]]);
        const pExtent = getAdjustedExtent(state).bound(minPWorld.concat(maxPWorld));
        const projectedMin = pExtent.getBottomLeft().getCoordinates();
        const projectedMax = pExtent.getTopRight().getCoordinates();
        const min = pointUnproject(projectedMin);
        const max = pointUnproject(projectedMax);
        return min.concat(max);
    };

export const getProjectedPointOnView =
    (state: MapState, x: number, y: number) => {
        const v = [x, y];
        const inv = getTransform(state).inverse();
        return inv.mapVec2(v);
    };

export const getViewPointProjected =
    (state: MapState, x: number, y: number) => {
        const v = [x, y];
        return getTransform(state).mapVec2(v);
    };


export const getCoordinateFromPixel =
    (state: MapState, pixel: number[]) => {
        const v = [pixel[0], pixel[1]];
        const inverse = getTransform(state).inverse();
        const tv = inverse.mapVec2(v);
        // logger('map.getCoordinateFromPixel', v, inverse.flatMatrix(), tv);
        return pointUnproject(tv);
    }

export const getPixelFromCoordinate =
    (state: MapState, coord: number[]) => {
        const v = [coord[0], coord[1]];
        const pv = pointProject(v);
        const tv = getTransform(state).mapVec2(pv);
        return tv;
    }