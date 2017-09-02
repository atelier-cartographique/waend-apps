
import * as debug from 'debug';
import { dispatch } from './index';
import { getBinder } from 'waend/shell';


const logger = debug('waend:events/user');


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
