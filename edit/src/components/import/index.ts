import * as debug from 'debug';
import { DIV, SPAN, BUTTON } from '../elements';
import { Feature, Position } from '../../source/io/geojson';
import { getImportMode, getMapsInView, getTagsInView } from '../../queries/import';

import renderUser from './user';
import { setImportMode, loadMapsInview, pushTag, loadFeaturesInPolygon, showMap } from '../../events/import';
import { ModelData } from 'waend/lib';

const logger = debug('waend:comp/import');


export type ImportMode =
    | 'user'
    | 'server';


export type UserFileImportState =
    | 'fileValidating'
    | 'fileValidated';




export interface ImportState {
    importMap: any | null;
    mode: ImportMode;
    pendingFeatures: Feature[];
    userImport: UserFileImportState;
    coordinates: Position[];
    mapsInViewPort: any[];
    selectedTags: string[];
    selectedFeatures: string[];
}

export const defaultImportState =
    (): ImportState => ({
        importMap: null,
        mode: 'server',
        pendingFeatures: [],
        userImport: 'fileValidated',
        coordinates: [],
        mapsInViewPort: [],
        selectedTags: [],
        selectedFeatures: [],
    });

const renderTag =
    (tag: string) => SPAN({
        className: 'map-tag',
        key: tag,
        onClick: () => pushTag(tag),
    }, tag);

const renderItem =
    (m: ModelData) => {
        const props = m.properties;
        const name = 'name' in props ? props.name : m.id;
        const tags = 'tags' in props ? props.tags : [];
        // logger(`${m.id} ${name} ${tags}`)
        return (
            DIV({ key: m.id },
                SPAN({
                    className: 'map-name',
                    onClick: () => showMap(m.user_id, m.id),
                }, name),
                tags.map(renderTag),
            )
        );
    }

const listMapsInView =
    () => getMapsInView().map(renderItem);

const importSelection =
    () => BUTTON({
        onClick: () => loadFeaturesInPolygon(),
    }, 'Import Selection');

const render =
    () => {
        const nodes: React.ReactNode[] = [];
        switch (getImportMode()) {
            case 'user':
                nodes.push(renderUser());
                break;
            case 'server':
                nodes.push(importSelection());
                nodes.push(getTagsInView().map(renderTag));
                nodes.push(listMapsInView());
                break;
        }
        return DIV({},
            BUTTON({
                onClick: () => {
                    setImportMode('server');
                    loadMapsInview();
                },
            }, 'on wænd'),
            BUTTON({ onClick: () => setImportMode('user') }, 'file'),
            ...nodes);
    };

export default render;

logger('loaded');
