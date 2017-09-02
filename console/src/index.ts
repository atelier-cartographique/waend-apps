/*
 * src/index.ts
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


import { getconfig } from 'waend-lib';
import { Bind, getBinder, setenv, configure as initSync } from 'waend-shell';
// import createMap from 'waend-map';
import { Console } from './Console';
import { initHistory } from "./WebHistory";

const withBinder: (a: Bind) => void =
    (binder) => {
        // const elementWC = document.querySelector('#wc');
        // const elementMap = document.querySelector('#map');
        const elementWC = document.createElement('div');
        // const elementMap = document.createElement('div');
        elementWC.id = 'wc';
        // elementMap.id = 'map';
        document.body.appendChild(elementWC);
        // document.body.appendChild(elementMap);

            const wcons = Console();
            elementWC.appendChild(wcons.node);
            const shell = wcons.start();


            binder.getMe()
                .then(user => { shell.loginUser(user); })
                .catch(() => 0);


            getconfig('loginUrl').then((url) => setenv('LOGIN_URL', url));
            getconfig('notifyUrl').then(initSync);


            const historyPopContext: (a: PopStateEvent) => void =
                (event) => {
                    if (event.state) {
                        shell.switchContext(event.state);
                    }
                };

            shell.switchContext(initHistory('/console/', historyPopContext));

    }

const init = () => {
    getconfig('apiUrl')
        .then((apiUrl) => {
            withBinder(getBinder(apiUrl));
        })
}

document.onreadystatechange = () => {
    if ('interactive' === document.readyState) {
        init();
    }
};
