
import * as debug from 'debug';
import { dispatch } from './index';
import { query } from '../queries';
import { AppLayout, NewState, AppMode } from '../shape';
import { User, getconfig } from 'waend/lib';
import { fromNullable } from 'fp-ts/lib/Option';
import { getBinder, Transport } from 'waend/shell';
import { markDirty, zoomToMapExtent } from './map';


const logger = debug('waend:events/app');
const transport = new Transport();

const fetchGroup =
    (apiUrl: string) =>
        (uid: string, gid: string, parse: (a: any) => any) => {
            return (
                transport.get({
                    url: `${apiUrl}/user/${uid}/group/${gid}`,
                    parse,
                })
            );
        };

const events = {

    setMode(m: AppMode) {
        dispatch('app/mode', () => m);
    },

    setLayout(l: AppLayout) {
        dispatch('app/layout', () => l);
    },

    setArgs(args: string[]) {
        dispatch('app/args', () => args);
    },

    setUser(u: User) {
        dispatch('data/user', () => u);
        dispatch('app/user', () => u.id);
    },

    setNewState(s: NewState) {
        dispatch('app/new', () => s);
    },

    loadMap(uid: string, gid: string) {
        // getBinder()
        //     .getGroup(uid, gid)
        //     .then((group) => { dispatch('data/map', () => group); return group; })
        //     .then(group => dispatch('app/mapId', () => group.id))
        //     .then(() => dispatch('app/layerIndex', () => 0))
        //     .catch(() => logger('Failed loading'));

        const parse =
            (data: any) => data;

        getconfig('apiUrl')
            .then(apiUrl => fetchGroup(apiUrl)(uid, gid, parse))
            .then(data => dispatch('data/map', () => data.group))
            .then(() => dispatch('app/mapId', () => gid))
            .then(() => dispatch('app/layerIndex', () => 0))
            .then(zoomToMapExtent)
            .then(markDirty)
            .catch(err => logger(`Failed loading ${err}`));
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
