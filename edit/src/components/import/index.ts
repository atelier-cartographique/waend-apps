import * as debug from 'debug';
import { DIV, SPAN, BUTTON } from '../elements';
import { Feature, Position } from '../../source/io/geojson';
import { getImportMode, getMapsInView, getTagsInView } from '../../queries/import';
import appEvents from '../../events/app';

import renderUser from './user';
import { setImportMode, loadMapsInview, pushTag } from '../../events/import';
import { ModelData } from 'waend/lib';

const logger = debug('waend:comp/import');


export type ImportMode =
    | 'user'
    | 'server';


export type UserFileImportState =
    | 'fileValidating'
    | 'fileValidated';


export interface ImportState {
    mode: ImportMode;
    pendingFeatures: Feature[];
    userImport: UserFileImportState;
    coordinates: Position[];
    mapsInViewPort: any[];
    selectedTags: string[];
}

export const defaultImportState =
    (): ImportState => ({
        mode: 'server',
        pendingFeatures: [],
        userImport: 'fileValidated',
        coordinates: [],
        mapsInViewPort: [],
        selectedTags: [],
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
        logger(`${m.id} ${name} ${tags}`)
        return (
            DIV({ key: m.id },
                SPAN({
                    className: 'map-name',
                    onClick: () => appEvents.loadMap(m.user_id, m.id),
                }, name),
                tags.map(renderTag),
            )
        );
    }

const listMapsInView =
    () => getMapsInView().map(renderItem);

const render =
    () => {
        const nodes: React.ReactNode[] = [];
        switch (getImportMode()) {
            case 'user':
                nodes.push(renderUser());
                break;
            case 'server':
                nodes.push(getTagsInView().map(renderTag));
                nodes.push(listMapsInView());
                break;
        }
        logger(nodes);
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
