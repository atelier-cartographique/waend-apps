/*
 * src/changeContext.ts
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


import * as Promise from "bluebird";
import { Context, ISys, ICommand } from "./waend/shell";


const cc: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (ctx, _sys, argv) => {

        if (argv.length === 0) {
            return ctx.endWithError(new Error('NothingToChangeTo'));
        }

        const opt_path = argv[0];
        // slice(1) here because Context.resolve will 
        // always returns a leading '/' and then 
        // split('/') will always start 
        // with a leading empty string
        const comps = ctx.resolve(opt_path).split('/').slice(1);
        return ctx.shell.switchContext(comps);
    }

export const command: ICommand = {
    name: 'cc',
    command: cc
};
