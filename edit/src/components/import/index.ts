import { DIV, SPAN } from '../elements';
import { Feature, Position } from '../../source/io/geojson';
import { getImportMode, getMapsInView } from '../../queries/import';
import appEvents from '../../events/app';

import renderUser from './user';
import { setImportMode, loadMapsInview } from '../../events/import';


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
}

export const defaultImportState =
    (): ImportState => ({
        mode: 'server',
        pendingFeatures: [],
        userImport: 'fileValidated',
        coordinates: [],
        mapsInViewPort: [],
    });

export const listMapsInView =
    () =>
        getMapsInView()
            .map(m =>
                DIV({},
                    DIV({
                        onClick: () => appEvents.loadMap(m.user_id, m.id)
                    }, m.id),
                    ...(Object.keys(m.properties)
                        .map(k =>
                            DIV({},
                                SPAN({}, k),
                                SPAN({}, m.properties[k]))))));

const render =
    () => {
        const nodes: React.ReactNode[] = [];
        switch (getImportMode()) {
            case 'user':
                nodes.push(renderUser());
                break;
            case 'server':
                nodes.push(listMapsInView());
                break;
        }
        return DIV({},
            SPAN({ onClick: () => setImportMode('user') }, 'user'),
            SPAN({
                onClick: () => {
                    setImportMode('server');
                    loadMapsInview();
                },
            }, 'server'), ...nodes);
    };

export default render;
