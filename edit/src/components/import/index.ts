import { DIV } from '../elements';
import { Feature } from '../../source/io/geojson';
import { getImportMode } from '../../queries/import';

import renderUser from './user';


export type ImportMode =
    | 'user'
    | 'server';


export type UserImportState =
    | 'validating'
    | 'validated';


export interface ImportState {
    mode: ImportMode;
    pendingFeatures: Feature[];
    userImport: UserImportState;
}

export const defaultImportState =
    (): ImportState => ({
        mode: 'user',
        pendingFeatures: [],
        userImport: 'validated',
    });

const render =
    () => {
        switch (getImportMode()) {
            case 'user': return renderUser();
            case 'server': return DIV({}, 'not yet there');
        }
    };

export default render;
