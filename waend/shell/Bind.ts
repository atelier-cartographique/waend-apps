/*
 * src/Bind.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-shell package.
 *
 *  waend-shell is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-shell is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-shell.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as EventEmitter from 'events';
import * as debug from 'debug';
import { Transport } from './Transport';
import { subscribe, ISyncMessage } from './Sync';
import { Semaphore } from './Semaphore';
import { DirectGeometryObject } from 'geojson-iots';
import {
    BaseModelData,
    Feature,
    Geometry,
    Group,
    Layer,
    Model,
    ModelData,
    User,
} from '../lib';
const logger = debug('waend:Bind');




export interface IRecord {
    readonly model: Model;
    readonly comps: string[];
    readonly parent: string | null;
}

export interface IDBStore {
    [propName: string]: IRecord;
}

interface IParser<T> {
    (response: any): T;
}


const db_store: IDBStore = {};

export class DB extends EventEmitter {
    private transport: Transport;

    constructor(t: Transport, private apiUrl: string) {
        super();
        this.transport = t;
    }

    get _db() { return db_store; }

    makePath(comps: string[]) {
        const cl = comps.length;
        if (1 === cl) {
            return `/user/${comps[0]}`;
        }
        else if (2 === cl) {
            return `/user/${comps[0]}/group/${comps[1]}`;
        }
        else if (3 === cl) {
            return `/user/${comps[0]}/group/${comps[1]}/layer/${comps[2]}`;
        }
        else if (4 === cl) {
            return `/user/${comps[0]}/group/${comps[1]}/layer/${comps[2]}/feature/${comps[3]}`;
        }
        throw (new Error('wrong number of comps'));
    }

    getParent(comps: string[]) {
        if (comps.length > 1) {
            return comps[comps.length - 2];
        }
        return null;
    }

    record(comps: string[], model: Model): IRecord {
        const id = model.id;
        const parent = this.getParent(comps);
        let rec: IRecord;
        if (id in this._db) {
            const oldRec = this._db[id];
            oldRec.model._updateData(model.cloneData(), false);
            rec = {
                model: oldRec.model,
                comps: oldRec.comps,
                parent,
            };
        }
        else {
            rec = {
                model,
                comps,
                parent,
            };
        }
        this._db[id] = rec;
        return rec;
    }

    update(model: Model) {
        const self = this;
        const db = this._db;
        const record = db[model.id];
        const path = this.makePath(record.comps);

        const resolver: (a: (b: Model) => void, b: (c: Error) => void) => void =
            (resolve, reject) => {
                const options = {
                    url: this.apiUrl + path,
                    body: model,
                    parse: () => model,
                };
                self.transport
                    .put<Model>(options)
                    .then(() => {
                        db[model.id] = {
                            model,
                            comps: record.comps,
                            parent: record.parent,
                        };
                        resolve(model);
                    })
                    .catch(reject);
            };
        return (new Promise(resolver));
    }

    has(id: string) {
        return (id in this._db);
    }

    get<T extends Model>(id: string) {
        return <T>(this._db[id].model);
    }

    del(id: string) {
        delete this._db[id];
    }

    getComps(id: string) {
        return _.clone(this._db[id].comps);
    }

    lookupKey(prefix: string) {
        const pat = new RegExp(`^${prefix}.*`);
        const keys = Object.keys(this._db);
        return keys.reduce<Array<Model>>((acc, key) => {
            if (key.match(pat)) {
                return acc.concat([this.get(key)]);
            }
            return acc;
        }, []);
    }

    lookup<T extends Model>(predicate: (a: IRecord, b: string) => boolean) {
        const filtered = _.filter(this._db, predicate);
        const result = _.map(filtered, (rec) => <T>rec['model']);
        return result;
    }
}


function objectifyResponse(response: any) {
    if ('string' === typeof response) {
        try {
            return JSON.parse(response);
        }
        catch (err) {
            console.error(err);
            throw (err);
        }
    }
    return response;
}

export class Bind extends EventEmitter {
    private transport: Transport;
    private featurePages: any;
    private groupCache: any;
    db: DB;

    constructor(private apiUrl: string, readonly semaphore: Semaphore) {
        super();
        this.transport = new Transport();
        this.db = new DB(this.transport, apiUrl);
        this.featurePages = {};
        this.groupCache = {};

        this.semaphore.observe<ISyncMessage>('sync',
            (message) => {
                const { channel, event, data } = message;
                if ('update' === event) {
                    const modelData = <ModelData>data;
                    if (this.db.has(modelData.id)) {
                        const model = this.db.get(modelData.id);
                        model._updateData(modelData, false);
                    }
                }
                else if ('create' === event) {
                    const modelData = <ModelData>data;
                    const ctx = channel.type;
                    if ('layer' === ctx) {
                        if (!this.db.has(modelData.id)) {
                            const layerId = channel.id;
                            const feature = new Feature(modelData);
                            const comps = this.getComps(layerId);
                            comps.push(<string>feature.id);
                            this.db.record(comps, feature);
                            this.changeParent(layerId);
                        }
                    }
                }
                else if ('delete' === event) {
                    const ctx = channel.type;
                    if ('layer' === ctx) {
                        const fid = <string>data;
                        if (this.db.has(fid)) {
                            const layerId = channel.id;
                            this.db.del(fid);
                            this.changeParent(layerId);
                        }
                    }
                }
            });
    }

    update(model: Model, key: string, val: any) {
        model.updateProperty(key, val);
        this.semaphore.signal('model:set', { key, model });
        return this.db.update(model);
    }


    updateGeometry(model: Feature, geom: DirectGeometryObject | Geometry) {
        if (geom instanceof Geometry) {
            model.setGeometry(geom.toGeoJSON());
        }
        else {
            model.setGeometry(geom);
        }
        this.semaphore.signal('model:set', { key: 'geom', model });
        return this.db.update(model);
    }

    changeParent(parentId: string) {
        if (this.db.has(parentId)) {
            const parent = this.db.get(parentId);
            logger('binder.changeParent', parent.id);
            this.semaphore.signal('change', { model: parent });
        }
    }

    getMe() {
        const db = this.db;
        const parse: IParser<User> =
            (response) => {
                const u = new User(objectifyResponse(response));
                db.record([u.id], u);
                return u;
            };

        const url = `${this.apiUrl}/auth`;
        return this.transport.get<User>({ url, parse });
    }

    getComps(id: string) {
        return this.db.getComps(id);
    }

    getUser(userId: string) {
        const db = this.db;
        const path = `/user/${userId}`;

        if (db.has(userId)) {
            return Promise.resolve(db.get<User>(userId));
        }
        const parse: IParser<User> =
            (response) => {
                const u = new User(objectifyResponse(response));
                db.record([userId], u);
                return u;
            };
        const url = this.apiUrl + path;
        return this.transport.get({ url, parse });
    }

    getGroup(userId: string, groupId: string) {
        const db = this.db;
        const path = `/user/${userId}/group/${groupId}`;
        if (db.has(groupId)) {
            return Promise.resolve(db.get<Group>(groupId));
        }
        const parse: IParser<Group> =
            (response) => {
                const groupData = objectifyResponse(response);
                const modelData: ModelData = {
                    id: groupData.group.id,
                    properties: groupData.group.properties,
                };
                const g = new Group(modelData);
                const layers = groupData.group.layers;

                db.record([userId, groupId], g);

                for (const layer of layers) {
                    const layerData: ModelData = {
                        id: layer.id,
                        properties: layer.properties,
                    };
                    const l = new Layer(layerData);
                    db.record([userId, groupId, layer.id], l);

                    for (const feature of layer.features) {
                        const f = new Feature(feature);
                        db.record([userId, groupId, layer.id, feature.id], f);
                    }

                    subscribe('layer', layer.id);
                }

                this.semaphore.signal('stop:loader');
                subscribe('group', groupId);
                return g;
            };
        const url = this.apiUrl + path;
        this.semaphore.signal('start:loader', 'downloading map data');
        return this.transport.get({ url, parse });
    }


    getGroups(userId: string) {
        const db = this.db;
        const path = `/user/${userId}/group/`;
        const gc = this.groupCache;

        const parse: IParser<Array<Group>> =
            (response) => {
                const data = objectifyResponse(response);

                const ret: Group[] = [];

                for (const groupData of data.results) {
                    if (db.has(groupData.id)) {
                        ret.push(db.get<Group>(groupData.id));
                    }
                    else if (groupData.id in gc) {
                        ret.push(gc[groupData.id]);
                    }
                    else {
                        const g = new Group(groupData);
                        // we do not record here, it would prevent deep loading a group
                        // db.record(path+g.id, g);
                        gc[groupData.id] = g;
                        ret.push(g);
                    }
                }

                return ret;
            };
        const url = this.apiUrl + path;
        return this.transport.get({ url, parse });
    }

    getLayer(userId: string, groupId: string, layerId: string) {
        const db = this.db;
        const path = `/user/${userId}/group/${groupId}/layer/${layerId}`;
        if (db.has(layerId)) {
            return Promise.resolve(db.get<Layer>(layerId));
        }
        const parse: IParser<Layer> =
            (response) => {
                const l = new Layer(objectifyResponse(response));
                db.record([userId, groupId, layerId], l);
                return l;
            };
        const url = this.apiUrl + path;
        return this.transport.get({ url, parse });
    }

    getLayers(_userId: string, groupId: string) {
        return Promise.resolve(this.db.lookup<Layer>((rec) => rec.parent === groupId));
    }

    getLayersSync(groupId: string) {
        return this.db.lookup<Layer>(rec => rec.parent === groupId);
    }

    getFeature(userId: string, groupId: string, layerId: string, featureId: string) {
        const db = this.db;
        const path = `/user/${userId}/group/${groupId}/layer/${layerId}/feature/${featureId}`;
        if (db.has(featureId)) {
            return Promise.resolve(db.get<Feature>(featureId));
        }
        const parse: IParser<Feature> =
            (response) => {
                const f = new Feature(objectifyResponse(response));
                db.record([userId, groupId, layerId, featureId], f);
                return f;
            };
        const url = this.apiUrl + path;
        return this.transport.get({ url, parse });
    }

    delFeature(userId: string, groupId: string, layerId: string, featureId: string) {
        const feature = <Feature>(this.db.get(featureId));
        const geom = feature.getGeometry();

        const path = `/user/${userId}/group/${groupId}/layer/${layerId}/feature.${geom.getType()}/${featureId}`;

        const url = this.apiUrl + path;
        const db = this.db;

        const parse = () => {
            db.del(featureId);
            this.changeParent(layerId);
        };

        return this.transport.del({ url, parse });
    }

    getFeatures(_userId: string, _groupId: string, layerId: string) {
        return Promise.resolve(
            this.db.lookup<Feature>(rec => rec.parent === layerId));
    }


    setGroup(userId: string, data: BaseModelData) {
        const db = this.db;
        const path = `/user/${userId}/group/`;

        const parse: IParser<Group> =
            (response) => {
                const g = new Group(objectifyResponse(response));
                db.record([userId, g.id], g);
                this.changeParent(userId);
                return g;
            };

        const url = this.apiUrl + path;
        return this.transport.post({
            url,
            parse,
            body: data,
        });
    }

    setLayer(userId: string, groupId: string, data: BaseModelData) {
        const db = this.db;
        const path = `/user/${userId}/group/${groupId}/layer/`;

        const parse: IParser<Layer> =
            (response) => {
                const g = new Layer(objectifyResponse(response));
                db.record([userId, groupId, g.id], g);
                this.changeParent(groupId);
                return g;
            };

        const url = this.apiUrl + path;
        return this.transport.post({
            url,
            parse,
            body: data,
        });
    }

    setFeature(userId: string, groupId: string, layerId: string, data: BaseModelData, batch: boolean) {
        const db = this.db;
        const path = `/user/${userId}/group/${groupId}/layer/${layerId}/feature/`;

        const parse: IParser<Feature> =
            (response) => {
                const f = new Feature(objectifyResponse(response));
                db.record([userId, groupId, layerId, f.id], f);
                if (!batch) {
                    this.changeParent(layerId);
                }
                return f;
            };

        const url = this.apiUrl + path;
        return this.transport.post({
            url,
            parse,
            body: data,
        });
    }


    attachLayerToGroup(guid: string, groupId: string, layerId: string) {
        const path = `/user/${guid}/group/${groupId}/attach/`;

        const data = {
            layer_id: layerId,
            group_id: groupId,
        };

        const url = this.apiUrl + path;
        return this.transport.post({
            url,
            body: data,
            parse: () => data,
        });
    }

    detachLayerFromGroup(userId: string, groupId: string, layerId: string) {
        const path = `/user/${userId}/group/${groupId}/detach/${layerId}`;
        const url = this.apiUrl + path;
        const parse = () => {
            this.changeParent(groupId);
        };
        return this.transport.del({ url, parse });
    }

    matchKeyAsync(prefix: string) {
        const res = this.db.lookupKey(prefix);
        if (res.length > 0) {
            return Promise.resolve(res);
        }
        return Promise.reject('No Match');
    }

    matchKey(prefix: string) {
        return this.db.lookupKey(prefix);
    }
}

let bindInstance: Bind;

export const configure =
    (apiUrl: string, semaphore: Semaphore) => {
        if (bindInstance) {
            throw (new Error('BinderAlreadyConfigured'));
        }
        bindInstance = new Bind(apiUrl, semaphore);
    };

export const getBinder =
    () => {
        if (!bindInstance) {
            throw (new Error('BinderNotConfigured'));
        }
        return bindInstance;
    };
