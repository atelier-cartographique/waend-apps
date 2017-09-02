/*
 * src/list
 * .ts
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
import { Context, ISys, ICommand } from "./waend/shell";
import { Model } from "../lib";
import { dom, getPathComponents, Components, LayerComponents, GroupComponents } from 'waend-util';

const { getDomForModel } = dom;

const printModel: (a: Context, b: ISys) => (c: Model) => void =
    (ctx, sys) => (model) => {
        const modelPath = ctx.resolve(model.id);
        sys.stdout.write([{
            text: model.id,
            fragment: getDomForModel(model, 'name', 'div', 'model-name'),
            commands: [`cc ${modelPath}`]
        }])
    };


const listGroups: (a: Context, b: ISys, c: Components) => Promise<any> =
    (ctx, sys, components) => {

        return (
            ctx.binder
                .getGroups(components.user)
                .then((groups) => {
                    groups.forEach(printModel(ctx, sys));
                    return groups;
                }));
    }


const listLayers: (a: Context, b: ISys, c: GroupComponents) => Promise<any> =
    (ctx, sys, components) => {
        return (
            ctx.binder
                .getLayers(components.user, components.group)
                .then((layers) => {
                    layers.forEach(printModel(ctx, sys));
                    return layers;
                }));
    }


const listFeatures: (a: Context, b: ISys, c: LayerComponents) => Promise<any> =
    (ctx, sys, components) => {
        return (
            ctx.binder
                .getFeatures(components.user, components.group, components.layer)
                .then((features) => {
                    features.forEach(printModel(ctx, sys));
                    return features;
                }));
    }



const list: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (ctx, sys, argv) => {

        if (argv.length === 0) {
            return Promise.reject(new Error('MissingArguments'));
        }

        const components = getPathComponents(ctx.resolve(argv[0]));

        if (!components) {
            return Promise.reject(new Error('InvalidPath'));
        }

        if (components.pathType === 'feature') {
            return Promise.resolve([]); // do we throw an error?
        }
        else if (components.pathType === 'layer') {
            return listFeatures(ctx, sys, components);
        }
        else if (components.pathType === 'group') {
            return listLayers(ctx, sys, components);
        }
        else {
            return listGroups(ctx, sys, components);
        }

    }


export const command: ICommand = {
    name: 'ls',
    command: list
};

