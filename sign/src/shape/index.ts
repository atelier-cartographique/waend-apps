

import { User } from 'waend/lib';
import { SignInState, defaultSignInState } from '../components/signin';
import { SignUpState, defaultSignUpState } from '../components/signup';

export type AppLayout =
    | 'signin'
    | 'signup'
    ;


// State Interface


export interface IShapeApp {
    'app/title': string;
    'app/user': string | null;
    'app/layout': AppLayout;

    // 'component/...': ...
    'component/signin': SignInState;
    'component/signup': SignUpState;

    // 'port/...': ...
}


export interface IShapeData {
    'data/user': User | null;
}

export type IShape = IShapeApp & IShapeData;

// Initial Application State 

export const appShape: IShapeApp = {
    'app/title': 'sign',
    'app/user': null,
    'app/layout': 'signin',
    'component/signin': defaultSignInState(),
    'component/signup': defaultSignUpState(),
};
