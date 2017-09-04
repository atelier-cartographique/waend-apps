

import maps from './maps';
import user from './user';
import { DIV } from "../elements";

export interface UserDataTuple {
    key: string;
    value: any;
    editing: boolean;
}

export type UserData = UserDataTuple[];

const render =
    () => (
        DIV({ className: 'dashboard' },
            user(),
            maps())
    );

export default render;
