/*
 * src/Display.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-console package.
 *
 *  waend-console is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-console is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-console.  If not, see <http://www.gnu.org/licenses/>.
 */



import * as Promise from 'bluebird';
import { uniqueId } from 'lodash';
import { dom } from 'waend-util';

const { addClass, DIV, removeElement } = dom;

export interface IDisplay {
    node: HTMLElement;
    shutdown: () => void;
}

export type EndFn = (a: HTMLElement) => Promise<void>;

export const Display: (a: EndFn) => IDisplay =
    (onShutdown) => {
        const id = uniqueId('wc-display-');
        const node = DIV();
        let isOn = true;

        addClass(node, 'wc-display');
        node.setAttribute('id', id);


        const shutdown =
            () => {
                if (isOn) {
                    isOn = false;
                    // here I wonder if a `finally` would do better
                    onShutdown(node)
                        .then(() => removeElement(node))
                        .catch(() => removeElement(node));
                }
            }

        return { node, shutdown };
    }