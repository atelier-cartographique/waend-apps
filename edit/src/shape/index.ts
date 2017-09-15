

import { User, Group } from 'waend/lib';
import { ImportState, defaultImportState } from '../components/import';
import { MapState, defaultMapState } from 'waend/map';
import { MapInteractionsState, defaultMapInteractionsState } from '../components/map/interactions';
import { SelectState, defaultSelectState } from '../components/select';

export type AppLayout =
    | 'main'
    | 'import'
    ;


export type NewState = 'initial' | 'processing' | 'done' | 'failed' | null;

export type AppMode =
    | 'base'
    | 'select'
    ;

export interface InputState {
    [key: string]: string | number;
}

// State Interface


export interface IShapeApp {
    'app/args': string[];
    'app/layerIndex': number;
    'app/layout': AppLayout;
    'app/mapId': string | null;
    'app/mode': AppMode;
    'app/new': NewState;
    'app/title': string;
    'app/user': string | null;


    // 'component/...': ...
    'component/import': ImportState;
    'component/input': InputState;
    'component/map': MapState;
    'component/mapInteractions': MapInteractionsState;
    'component/mapOverlayState': MapState;
    'component/select': SelectState;

    // 'port/...': ...
}


export interface IShapeData {
    'data/user': User | null;
    'data/groups': Group[];
    'data/map': any;
}

export type IShape = IShapeApp & IShapeData;

// Initial Application State 

export const appShape: IShapeApp = {
    'app/args': [],
    'app/layerIndex': -1,
    'app/layout': 'main',
    'app/mapId': null,
    'app/mode': 'base',
    'app/new': null,
    'app/title': 'edit',
    'app/user': null,
    'component/import': defaultImportState(),
    'component/input': {},
    'component/map': defaultMapState(),
    'component/mapInteractions': defaultMapInteractionsState(),
    'component/mapOverlayState': defaultMapState(),
    'component/select': defaultSelectState(),
};
