
import * as debug from 'debug';
import { dispatch } from './index';
import { query } from '../queries';
import { AppLayout } from '../shape';
import { User } from 'waend/lib';
import { fromNullable } from "fp-ts/lib/Option";
import { getBinder } from "waend/shell";


const logger = debug('waend:events/app');

const events = {

    setLayout(l: AppLayout) {
        dispatch('app/layout', () => l);
    },

    setUser(u: User) {
        dispatch('data/user', () => u);
    },

    createMap() {
        fromNullable(query('data/user'))
            .map((user) => {
                const uid = user.id;
                getBinder()
                    .setGroup(uid, {
                        properties: {
                            name: `Untitled ${(new Date()).toLocaleDateString()}`,
                        },
                    })
                    .then((group) => {
                        dispatch('app/mapId', () => group.id);
                        return group.id;
                    })
                    .then((gid) => {
                        return (
                            getBinder()
                                .setLayer(uid, gid, { properties: {} }));
                    })
                    .then((a) => {
                        logger(`All went well and smooth with layer creation ${a.id}`);
                    })
                    .catch(err => logger(`Failed to create map ${err}`));
            });
    },
};

export default events;

logger('loaded');
