
import * as debug from 'debug';
import * as Promise from 'bluebird';
import { dispatch } from './index';
import { query } from '../queries';
import { AppLayout, NewState, AppMode } from '../shape';
import { User, getconfig } from 'waend/lib';
import { fromNullable, none } from 'fp-ts/lib/Option';
import { getBinder, Transport } from 'waend/shell';
import { markDirty, zoomToMapExtent, markDirtyData, markOverlayDirty } from './map';
import { getDataOption } from '../queries/map';
import { Properties, DirectGeometryObject } from '../source/io/geojson';
import appQueries from '../queries/app';
import { resetSelection } from './select';
import { resetLine, resetPolygon } from './trace';
import { resetImport, revertMap } from './import';


const logger = debug('waend:events/app');
const transport = new Transport();

export const fetchGroup =
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
        dispatch('app/mode', (cm) => {
            if ('import' === cm) {
                revertMap();
            }
            return m;
        });
        switch (m) {
            case 'select':
                resetSelection();
                break;
            case 'trace.line':
                resetLine();
                break;
            case 'trace.polygon':
                resetPolygon();
                break;
            case 'import':
                resetImport();
                break;
        }
        markOverlayDirty();
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

        return (
            getconfig('apiUrl')
                .then(apiUrl => fetchGroup(apiUrl)(uid, gid, parse))
                .then(data => dispatch('data/map', () => data.group))
                .then(() => dispatch('app/mapId', () => gid))
                .then(() => dispatch('app/layerIndex', () => 0))
                .then(zoomToMapExtent)
                .then(markDirty)
                .then(() => logger(`loadMap ${gid} LOADED`))
                .catch(err => logger(`Failed loading ${err}`)));
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
                        fromNullable(query('app/mapId'))
                            .map(mid => events.loadMap(uid, mid));
                    })
                    .catch(() => dispatch('app/new', () => <NewState>'failed'));
            });
    },

    createFeature(geom: DirectGeometryObject, properties: Properties) {
        return (new Promise((resolve, reject) => {
            fromNullable(query('data/user'))
                .map(user =>
                    getDataOption()
                        .map((g) => {
                            const uid: string = user.id;
                            const gid: string = g.id;
                            return (
                                appQueries
                                    .getCurrentLayer()
                                    .map((layer) => {
                                        const lid = layer.id;
                                        getBinder()
                                            .setFeature(uid, gid, lid, {
                                                layer_id: lid,
                                                user_id: uid,
                                                properties: properties === null ? {} : properties,
                                                geom,
                                            }, false)
                                            .then((created) => {
                                                resolve(created);
                                                dispatch('data/map', (m) => {
                                                    m.layers.forEach((l: any) => {
                                                        if (l.id === lid) {
                                                            l.features.push(created.cloneData());
                                                        }
                                                    });
                                                    return m;
                                                });
                                            })
                                            .then(markDirtyData)
                                            .catch(reject);
                                        return lid;
                                    }));
                        })
                        .fold(() => none, s => s))
                .chain(r => r)
                .fold(reject, lid => lid);
        }));
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
                                    id: feature.id,
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

    updateMap(props: any) {
        fromNullable(query('data/user'))
            .map((user) => {
                getDataOption()
                    .map(g =>
                        getconfig('apiUrl')
                            .then(apiUrl => transport.put({
                                url: `${apiUrl}/user/${user.id}/group/${g.id}`,
                                body: updateModelProperties(g, props),
                                parse: a => a,
                            }))
                            .then(() =>
                                dispatch('data/map',
                                    s => updateModelProperties(s, props))),
                );
            });
    }
};


const updateModelProperties =
    (m: any, properties: any) => ({
        ...m,
        properties: {
            ...m.properties,
            ...properties,
        },
    });


export default events;

logger('loaded');
