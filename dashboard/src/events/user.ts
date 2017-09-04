
import * as debug from 'debug';
import { dispatch, observe } from './index';
import { getBinder } from 'waend/shell';


const logger = debug('waend:events/user');


observe('data/user', (user) => {
    if (!user) {
        dispatch('component/user', () => []);
    }
    else {
        dispatch('component/user', () => {
            const data = user.getData();
            return Object.keys(data).map((k) => {
                return {
                    key: k,
                    value: data[k],
                }
            });
        });
    }
});

const events = {

    loadMaps(uid: string) {
        getBinder()
            .getGroups(uid)
            .then((groups) => {
                dispatch('data/groups', () => groups);
            });
    },

    setUserValue(key: string, val: string) {
        dispatch('data/user', (u) => {
            if (u) {
                getBinder()
                    .update(u, key, val)
                    .then(() => {
                        dispatch('data/user', u => u);
                    });
            }
            return u;
        });
    },
};

export default events;

logger('loaded');
