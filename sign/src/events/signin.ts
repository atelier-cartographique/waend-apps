
import { dispatch } from './index';



const events = {

    updateUsername(n: string) {
        dispatch('component/signin', s => Object.assign(s, { username: n }));
    },

    updatePassword(p: string) {
        dispatch('component/signin', s => Object.assign(s, { password: p }));
    },
};

export default events;

