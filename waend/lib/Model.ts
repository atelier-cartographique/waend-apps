/*
 * src/Model.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-lib package.
 *
 *  waend-lib is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-lib is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-lib.  If not, see <http://www.gnu.org/licenses/>.
 */

import { isEqual } from 'lodash';
import { Geometry, Extent } from './Geometry';
import { DirectGeometryObject } from 'geojson-iots';


export function pathKey(objOpt: any, pathOpt: string, def: any): any {
    const path = pathOpt.split('.');
    let obj: any = objOpt;
    for (let i = 0, len = path.length; i < len; i += 1) {
        if (!obj || (typeof obj !== 'object')) {
            return def;
        }
        const p = path[i];
        obj = obj[p];
    }
    if (obj === undefined) {
        return def;
    }
    return obj;
}


// const keys =
//     (o: any) => Object.keys(o);

// const fold =
//     (a: (ks: string[], o: any) => any) =>
//         (b: (ks: string[], o: any) => any) =>
//             (ks: string[]) =>
//                 (o: any) =>
//                     (typeof o === 'object') ? b(ks, o) : a(ks, o);
// const mark =
//     (f: (ks: string[], a: any) => any) =>
//         (ks: string[]) =>
//             (o: any) => {
//                 const folder = fold(f)((lks, lo) => mark(f)(lks)(lo));
//                 return keys(o).map(k => folder(ks.concat([k]))(o[k]));



// TODO spec params and style interfaces

export interface ModelProperties {
    [propName: string]: any;
}

export interface BaseModelData {
    properties: ModelProperties;
    geom?: DirectGeometryObject;
    [propName: string]: any;
}

export interface ModelData extends BaseModelData {
    id: string;
}




export class Model {
    readonly id: string;
    name: string;

    constructor(protected data: ModelData) {
        // super();
        this.id = data.id;
    }

    has(prop: string) {
        return (prop in this.data.properties);
    }

    get(key: string, def: any): any {
        return pathKey(this.data.properties, key, def);
    }

    getProperties(): ModelProperties {
        return JSON.parse(JSON.stringify(this.data.properties));
    }

    updateProperty(key: string, val: any) {
        const keys = key.split('.');
        const props = this.data.properties;
        if (1 === keys.length) {
            props[key] = val;
        }
        else {
            const kl = keys.length;
            let currentDict = props;
            let k;
            for (let i = 0; i < kl; i++) {
                k = keys[i];
                if ((i + 1) === kl) {
                    currentDict[k] = val;
                }
                else {
                    if (!(k in currentDict)) {
                        currentDict[k] = {};
                    }
                    else { // if (!_.isObject(currentDict[k])) {
                        currentDict[k] = {};
                    }
                    currentDict = currentDict[k];
                }
            }
        }
    }

    delProperty(key: string) {
        this.updateProperty(key, null);
    }

    toJSON() {
        return JSON.stringify(this.data);
    }

    cloneData(): ModelData {
        return JSON.parse(this.toJSON());
    }

    _updateData(data: ModelData, _silent: boolean) {
        const props = this.data.properties;
        const newProps = data.properties;
        const changedProps: string[] = [];
        const changedAttrs: string[] = [];
        // const changedKeys = difference(Object.keys(props), Object.keys(newProps)).concat(difference(Object.keys(newProps), Object.keys(props)));

        Object.keys(props).forEach((k) => {
            const v = props[k];
            if (!isEqual(v, newProps[k])) {
                changedProps.push(k);
            }
        });

        Object.keys(this.data).forEach((k) => {
            if ('properties' !== k) {
                const v = this.data[k];
                if (!isEqual(v, data[k])) {
                    changedAttrs.push(k);
                }
            }
        });


        this.data = data;
        // if (!silent
        //     && ((changedAttrs.length > 0)
        //         || (changedProps.length > 0)
        //         || (changedKeys.length > 0))) {
        //     this.emit('set:data', data);

        //     changedProps.forEach((k) => {
        //         this.emit('set', k, data.properties[k]);
        //     }, this);
        // }
    }

}


export default Model;

// models

export class User extends Model {
    type: 'user';
}

export class Group extends Model {
    type: 'group';
}


export class Layer extends Model {
    type: 'layer';

    // getGroup() {
    //     const path = this.getPath();
    //     return getBinder().getGroup(path[0], path[1]);
    // }

    // isVisible() {
    //     const resolver = (yes: () => void, no: () => void) => {
    //         this.getGroup()
    //             .then(group => {
    //                 const visibleList = group.get('params.visible', null);
    //                 if (null === visibleList) {
    //                     return yes();
    //                 }
    //                 if (visibleList.indexOf(this.id) < 0) {
    //                     return no();
    //                 }
    //                 yes();
    //             })
    //             .catch(no);
    //     };
    //     return (new Promise(resolver));
    // }
}

export class GeoModel extends Model {
    // type: 'geometry'; 

    getGeometry() {
        const geom = this.data.geom as DirectGeometryObject;
        return (new Geometry(geom));
    }

    getExtent(): Extent {
        const geom = this.data.geom as DirectGeometryObject;
        return (new Geometry(geom)).getExtent();
    }
}

export class Feature extends GeoModel {
    type: 'feature';

    setGeometry(geom: DirectGeometryObject) {
        this.data.geom = geom;
    }
}

