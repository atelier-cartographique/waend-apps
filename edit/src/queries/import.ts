import * as debug from 'debug';
import { query } from './index';
import { overlayData } from '../components/map/overlay';
import { ImportMode } from '../components/import';
import { fromPredicate } from 'fp-ts/lib/Option';
import * as uuid from 'uuid';
import { ModelData } from 'waend/lib';

const logger = debug('waend:queries/import');


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


const matchTags =
    (tags: string[]) =>
        (map: ModelData) => {
            if ('tags' in map.properties && Array.isArray(map.properties.tags)) {
                const m = map.properties.tags.reduce(
                    (acc: boolean, t: string) => (acc ? acc : tags.indexOf(t) >= 0),
                    false);
                logger(`matchTags ${tags} ${map.properties.tags} => ${m}`)
                return m
            }
            return false;
        }

export const getMapsInView =
    (): ModelData[] => {
        const { mapsInViewPort, selectedTags } = query('component/import');
        if (selectedTags.length === 0) {
            return mapsInViewPort;
        }
        return mapsInViewPort.filter(matchTags(selectedTags));
    }

export const getTagsInView =
    (): string[] => {
        const { mapsInViewPort } = query('component/import');
        return (
            mapsInViewPort
                .filter(m => 'tags' in m.properties && Array.isArray(m.properties.tags))
                .map(m => m.properties.tags)
                .reduce<string[]>((acc, ts: string[]) => acc.concat(ts), [] as string[])
                .reduce((acc, t) => acc.indexOf(t) < 0 ? acc.concat([t]) : acc, [] as string[]));

    }

export const checkImportMode =
    (m: ImportMode) => fromPredicate(() => getImportMode() === m)(m);

logger('loaded');