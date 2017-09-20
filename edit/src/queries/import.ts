import { query } from './index';
import { overlayData } from '../components/map/overlay';
import { ImportMode } from '../components/import';
import { fromPredicate } from 'fp-ts/lib/Option';
import * as uuid from 'uuid';



export const getPendingFeatures =
    () => query('component/import').pendingFeatures;

export const getImportMode =
    () => query('component/import').mode;

export const getImportCoordinates =
    () => query('component/import').coordinates;

const closeCoordinates =
    () => {
        const coords = getImportCoordinates().slice();
        if (coords.length > 2) {
            coords.push(coords[0]);
        }
        return coords;
    }

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
            coordinates: closeCoordinates(),
        },
    });

export const getImportGroup =
    () => overlayData([mkLineFeature()]);


export const getMapsInView =
    () => query('component/import').mapsInViewPort;

export const checkImportMode =
    (m: ImportMode) => fromPredicate(() => getImportMode() === m)(m);