
import { dispatch } from './index';



const events = {

    updateName(n: string) {
        dispatch('component/signup', s => Object.assign(s, { name: n }));
    },

    updateUsername(n: string) {
        dispatch('component/signup', s => Object.assign(s, { username: n }));
    },

    updatePassword(p: string) {
        dispatch('component/signup', s => Object.assign(s, { password: p }));
    },
};

export default events;

