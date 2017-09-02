

import maps from './maps';
import user from './user';
import { DIV } from "../elements";



const render =
    () => (
        DIV({ className: 'dashboard' },
            user(),
            maps())
    );

export default render;
