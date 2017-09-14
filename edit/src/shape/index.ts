

import { User, Group } from 'waend/lib';
import { ImportState, defaultImportState } from '../components/import';
import { MapState, defaultMapState } from 'waend/map';
import { MapInteractionsState, defaultMapInteractionsState } from '../components/map/interactions';
import { defaultOverlayData } from '../components/map/overlay';

export type AppLayout =
    | 'main'
    | 'import'
    ;


export type NewState = 'initial' | 'processing' | 'done' | 'failed' | null;

export type AppMode =
    | 'base'
    | 'select'
    ;

// State Interface


export interface IShapeApp {
    'app/title': string;
    'app/user': string | null;
    'app/layout': AppLayout;
    'app/args': string[];
    'app/mapId': string | null;
    'app/new': NewState;
    'app/layerIndex': number;
    'app/mode': AppMode;


    // 'component/...': ...
    'component/import': ImportState;
    'component/map': MapState;
    'component/mapOverlayData': any;
    'component/mapOverlayState': MapState;
    'component/mapInteractions': MapInteractionsState;

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
    'app/mode': 'base',
    'app/title': 'edit',
    'app/user': null,
    'app/layout': 'main',
    'app/args': [],
    'app/mapId': null,
    'app/new': null,
    'app/layerIndex': -1,
    'component/import': defaultImportState(),
    'component/map': defaultMapState(),
    'component/mapInteractions': defaultMapInteractionsState(),
    'component/mapOverlayData': defaultOverlayData(),
    'component/mapOverlayState': defaultMapState(),
};
