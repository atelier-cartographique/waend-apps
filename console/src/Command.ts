/*
 * src/Commands.ts
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


import { Span } from 'waend-lib';
import { semaphore } from 'waend-shell';
import { dom } from "waend-util";

const { addClass, SPAN } = dom;

const onClick: (a: string[]) => (b: MouseEvent) => void =
    (commands) => (event) => {
        event.preventDefault();
        commands.forEach((command) => {
            semaphore.signal('command:run', command);
        });
    }

const fromFragment: (a: Element, b?: string[]) => Element =
    (fragment, commands) => {
        if (commands) {
            fragment.addEventListener('click',
                onClick(commands), false);
        }
        return fragment;
    }


export const asElement: (a: Span) => Element =
    (span) => {
        if (span.fragment) {
            return fromFragment(span.fragment, span.commands);
        }

        const element = SPAN();
        const textElement = document.createTextNode(span.text);

        addClass(element, 'wc-command');
        element.appendChild(textElement);

        if (span.commands) {
            addClass(element, 'clickable');
            element.addEventListener('click',
                onClick(span.commands), false);
        }
        return element;
    }

