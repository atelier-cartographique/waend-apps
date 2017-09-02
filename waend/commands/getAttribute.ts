/*
 * src/getAttribute.ts
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
import { dom, getPathComponents, Components, FeatureComponents, LayerComponents, GroupComponents } from 'waend-util';
import { ICommand, ISys, Context } from "./waend/shell";
import { Model } from "../lib";


const { getDomForModel, appendText, DIV } = dom;


const makeOutput: (a: ISys, c: Model) => (b: string) => void =
    (sys, model) => (k) => {
        const wrapper = DIV();
        const key = DIV();
        const value = getDomForModel(model, k, 'div', 'key-value');

        appendText(k)(key);

        wrapper.appendChild(key);
        wrapper.appendChild(value);


        sys.stdout.write([{
            fragment: wrapper,
            text: k
        }]);
    };

// TODO: find a name
const xxx: (a: ISys, b?: string) => (c: Model) => Model =
    (sys, key) => (model) => {
        const result = key ? model.get(key, null) : model.getData();
        const keys = key ? [key] : Object.keys(result);
        keys.forEach(makeOutput(sys, model));

        return model;
    }


const getUser: (a: Context, b: ISys, c: string, d: Components) => Promise<Model> =
    (ctx, sys, key, components) => {
        const uid = components.user;

        return (
            ctx.binder
                .getUser(uid)
                .then(xxx(sys, key))
        );
    }


const getGroup: (a: Context, b: ISys, c: string, d: GroupComponents) => Promise<Model> =
    (ctx, sys, key, components) => {
        const uid = components.user;
        const gid = components.group;

        return (
            ctx.binder
                .getGroup(uid, gid)
                .then(xxx(sys, key))
        );
    }


const getLayer: (a: Context, b: ISys, c: string, d: LayerComponents) => Promise<Model> =
    (ctx, sys, key, components) => {
        const uid = components.user;
        const gid = components.group;
        const lid = components.layer;

        return (
            ctx.binder
                .getLayer(uid, gid, lid)
                .then(xxx(sys, key))
        );
    }


const getFeature: (a: Context, b: ISys, c: string, d: FeatureComponents) => Promise<Model> =
    (ctx, sys, key, components) => {
        const uid = components.user;
        const gid = components.group;
        const lid = components.layer;
        const fid = components.feature;

        return (
            ctx.binder
                .getFeature(uid, gid, lid, fid)
                .then(xxx(sys, key))
        );
    }


const getAttr: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (ctx, sys, argv) => {

        if (argv.length === 0) {
            return Promise.reject(new Error('MissingArguments'));
        }

        const components = getPathComponents(ctx.resolve(argv[0]));

        if (!components) {
            return Promise.reject(new Error('InvalidPath'));
        }

        const key: (string | undefined) = argv[1];

        if (components.pathType === 'feature') {
            return getFeature(ctx, sys, key, components);
        }
        else if (components.pathType === 'layer') {
            return getLayer(ctx, sys, key, components);
        }
        else if (components.pathType === 'group') {
            return getGroup(ctx, sys, key, components);
        }
        else {
            return getUser(ctx, sys, key, components);
        }

    }


export const command: ICommand = {
    name: 'get',
    command: getAttr
};
