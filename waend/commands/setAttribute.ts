/*
 * src/setAttribute.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-command package.
 *
 *  waend-command is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-command is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-command.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as Promise from 'bluebird';
import { ICommand, ISys, Context, getenv } from "./waend/shell";
import { Model, BaseModelData } from "../lib";
import { Components, GroupComponents, LayerComponents, FeatureComponents, getPathComponents } from "../util";



const setUser: (a: Context, b: Components, c: string, d: any) => Promise<Model> =
    (ctx, components, key, value) => {
        const uid = components.user;

        return (
            ctx.binder
                .getUser(uid)
                .then((model) => ctx.binder.update(model, key, value))
        );
    }


const setGroup: (a: Context, b: GroupComponents, c: string, d: any) => Promise<Model> =
    (ctx, components, key, value) => {
        const uid = components.user;
        const gid = components.group;

        return (
            ctx.binder
                .getGroup(uid, gid)
                .then((model) => ctx.binder.update(model, key, value))
        );
    }


const setLayer: (a: Context, b: LayerComponents, c: string, d: any) => Promise<Model> =
    (ctx, components, key, value) => {
        const uid = components.user;
        const gid = components.group;
        const lid = components.layer;

        return (
            ctx.binder
                .getLayer(uid, gid, lid)
                .then((model) => ctx.binder.update(model, key, value))
        );
    }


const setFeature: (a: Context, b: FeatureComponents, c: string, d: any) => Promise<Model> =
    (ctx, components, key, value) => {
        const uid = components.user;
        const gid = components.group;
        const lid = components.layer;
        const fid = components.feature;

        return (
            ctx.binder
                .getFeature(uid, gid, lid, fid)
                .then((model) => ctx.binder.update(model, key, value))
        );
    }



const setAttr: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (ctx, _sys, argv) => {
        if (argv.length < 2) {
            return Promise.reject(new Error('TooFewArguments'));
        }


        const components = getPathComponents(ctx.resolve(argv[0]));

        if (!components) {
            return Promise.reject(new Error('InvalidPath'));
        }

        const fromDelivered = getenv<BaseModelData>('DELIVERED');
        const key: string = argv[1];
        let value: any;

        if (argv.length > 2) {
            value = JSON.parse(argv[2]);
        }
        else if (fromDelivered) {
            value = fromDelivered;
        }

        if (!value) {
            return Promise.reject(new Error('NoValue'));
        }

        if (components.pathType === 'feature') {
            return setFeature(ctx, components, key, value);
        }
        else if (components.pathType === 'layer') {
            return setLayer(ctx, components, key, value);
        }
        else if (components.pathType === 'group') {
            return setGroup(ctx, components, key, value);
        }
        else {
            return setUser(ctx, components, key, value);
        }
    }


export const command: ICommand = {
    name: 'set',
    command: setAttr
};
