
import * as debug from 'debug';
import { dispatch } from './index';
import { query } from '../queries';
import { AppLayout, NewState, AppMode } from '../shape';
import { User, getconfig } from 'waend/lib';
import { fromNullable } from 'fp-ts/lib/Option';
import { getBinder, Transport } from 'waend/shell';
import { markDirty, zoomToMapExtent, markDirtyData } from './map';
import { getDataOption } from '../queries/map';


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

const idid =
    (id: string) =>
        (a: any) => a.id === id;

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
                dispatch('app/new', () => 'processing' as NewState);
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


    updateFeature(feature: any) {
        fromNullable(query('data/user'))
            .map((user) => {
                getDataOption()
                    .map((g) => {
                        const uid: string = user.id;
                        const gid: string = g.id;
                        const lid: string | null = g.layers.reduce((acc: string | null, l: any) => {
                            if (l.features.find(idid(feature.id))) {
                                return l.id;
                            }
                            return acc;
                        }, null);
                        if (lid) {
                            getBinder()
                                .setFeature(uid, gid, lid, {
                                    user_id: uid,
                                    layer_id: lid,
                                    geom: feature.geom,
                                    properties: feature.properties,
                                }, false)
                                .then(() => {
                                    dispatch('data/map', (m) => {
                                        return fromNullable(m.layers.find(idid(lid)))
                                            .map((l: any) => fromNullable(l.features.findIndex(idid(feature.id))).map((idx: number) => {
                                                l.features[idx] = feature;
                                            }))
                                            .fold(() => m, () => m);
                                    });
                                })
                                .then(markDirtyData)
                                .catch(err => logger(`updateFeature error ${err}`));
                        }
                    });
            });
    },
};

export default events;

logger('loaded');
