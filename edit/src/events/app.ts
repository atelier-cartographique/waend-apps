
import * as debug from 'debug';
import { dispatch } from './index';
import { query } from '../queries';
import { AppLayout, NewState } from '../shape';
import { User } from 'waend/lib';
import { fromNullable } from "fp-ts/lib/Option";
import { getBinder } from "waend/shell";


const logger = debug('waend:events/app');

const events = {

    setLayout(l: AppLayout) {
        dispatch('app/layout', () => l);
    },

    setArgs(args: string[]) {
        dispatch('app/args', () => args);
    },

    setUser(u: User) {
        dispatch('data/user', () => u);
    },

    setNewState(s: NewState) {
        dispatch('app/new', () => s);
    },

    loadMap(uid: string, gid: string) {
        getBinder()
            .getGroup(uid, gid)
            .then(group => dispatch('app/map', () => group))
            .catch(() => logger('Failed loading'));
    },

    createMap() {
        fromNullable(query('data/user'))
            .map((user) => {
                const uid = user.id;
                dispatch('app/new', () => <NewState>'processing');
                getBinder()
                    .setGroup(uid, {
                        status_flag: 0,
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
                        dispatch('app/new', () => <NewState>'done');
                    })
                    .catch(() => dispatch('app/new', () => <NewState>'failed'));
            });
    },
};

export default events;

logger('loaded');
