

import { User, Group } from 'waend/lib';
import { LoginState, defaultLoginState } from '../components/login';
import { UserData } from '../components/user';

export type AppLayout =
    | 'main'
    | 'login'
    ;


// State Interface


export interface IShapeApp {
    'app/title': string;
    'app/user': string | null;
    'app/layout': AppLayout;

    // 'component/...': ...
    'component/login': LoginState;
    'component/user': UserData;

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
    'component/login': defaultLoginState(),
    'component/user': [],
};
