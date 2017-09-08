

import { User, Group } from 'waend/lib';
import { ImportState, defaultImportState } from '../components/import';

export type AppLayout =
    | 'main'
    | 'import'
    ;


// State Interface


export interface IShapeApp {
    'app/title': string;
    'app/user': string | null;
    'app/layout': AppLayout;
    'app/args': string[];
    'app/mapId': string | null;

    // 'component/...': ...
    'component/import': ImportState;

    // 'port/...': ...
}


export interface IShapeData {
    'data/user': User | null;
    'data/groups': Group[];
}

export type IShape = IShapeApp & IShapeData;

// Initial Application State 

export const appShape: IShapeApp = {
    'app/title': 'dashboard',
    'app/user': null,
    'app/layout': 'main',
    'app/args': [],
    'app/mapId': null,
    'component/import': defaultImportState(),
};
