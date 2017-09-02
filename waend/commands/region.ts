/*
 * src/region.ts
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


import { format } from 'util';
import * as Promise from 'bluebird';
import { Context, ISys, region, getenv, ICommand } from "./waend/shell";
import { Geometry, Extent } from "../lib";

const setRegion: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (_ctx, _sys, argv) => {

        const fromEnv = getenv<Extent | Array<number> | Geometry>('DELIVERED');
        let extent: Extent | null;

        if ((argv.length < 4) && (!fromEnv)) {
            return Promise.reject(new Error('MissingArguments'));
        }

        if (argv.length >= 4) {
            extent = new Extent([
                parseFloat(argv[0]),
                parseFloat(argv[1]),
                parseFloat(argv[2]),
                parseFloat(argv[3])
            ]);
        }
        else if (fromEnv) {
            try {
                extent = new Extent(fromEnv);
            }
            catch (_e) {
                extent = null;
            }
        }
        else {
            extent = null;
        }

        if (!extent) {
            return Promise.reject(new Error('NothingAsAnExtent'));
        }

        region.push(extent);
        return Promise.resolve(region.get().getArray());
    }

export const setRegionCmd: ICommand = {
    command: setRegion,
    name: 'region-set'
};


const getRegion: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (_ctx, _sys, _argv) => {
        const r = region.get();
        return Promise.resolve(r.getArray());
    }

export const getRegionCmd: ICommand = {
    command: getRegion,
    name: 'region-get'
};



const popRegion: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (_ctx, _sys, _argv) => {
        const r = region.pop();
        if (!r) {
            return Promise.reject(new Error('NoMoreRegionToPop'));
        }
        return Promise.resolve(r.getArray());
    }

export const popRegionCmd: ICommand = {
    command: popRegion,
    name: 'region-pop'
};


const getCenter: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (_ctx, sys, _argv) => {
        const r = region.get();
        const center = r.getCenter().getCoordinates();
        sys.stdout.write([{ text: `[${center[0]} ${center[1]}]` }]);
        return Promise.resolve(center);
    }

export const getCenterCmd: ICommand = {
    command: getCenter,
    name: 'region-center'
};


const printRegion: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (_ctx, sys, argv) => {
        const r = region.get();
        const NE = r.getTopRight().getCoordinates();
        const SW = r.getBottomLeft().getCoordinates();
        let f = '%d %d %d %d';
        if (argv.length >= 1) {
            f = argv[0];
        }
        sys.stdout.write([{ text: format(f, SW[0], SW[1], NE[0], NE[1]) }]);
        return Promise.resolve(r.getArray());
    }

export const printRegionCmd: ICommand = {
    command: printRegion,
    name: 'region-print'
};


const bufferRegion: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (_ctx, _sys, argv) => {
        if (argv.length === 0) {
            return Promise.reject(new Error('MissingArgument'));
        }
        const r = region.get();

        r.buffer(parseFloat(argv[0]));
        region.push(r);
        return Promise.resolve(r.getArray());
    }

export const bufferRegionCmd: ICommand = {
    command: bufferRegion,
    name: 'region-buffer'
};


