/*
 * src/Config.ts
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

import * as Promise from 'bluebird';

interface ConfigStore {
    [key: string]: string;
}

const store: ConfigStore = {};


export const setConfig =
    (k: string, v: string) => store[k] = v;


export const getconfig: (a: string) => Promise<string> =
    (key) => {

        if (key in store) {
            return Promise.resolve(store[key]);
        }

        return (new Promise((resolve, reject) => {
            fetch(`/config/${key}`)
                .then((response) => {
                    if (!response.ok) {
                        reject(new Error(`FaildConfig ${key}`));
                    }
                    return response.text();
                })
                .then((text) => {
                    store[key] = text;
                    resolve(text);
                })
                .catch(reject);
        }));

    }