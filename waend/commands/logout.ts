/*
 * src/logout.ts
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


import Transport from '../Transport';

import Promise from 'bluebird';
import config from '../../config';

function logout () {
    const self = this;
    const transport = new Transport();
    const shell = self.shell;


    const resolver = (resolve, reject) => {
        transport.post(config.public.logoutUrl, {
            body: {}
        })
            .then(() => {
                shell.logoutUser();
                resolve();
            })
            .catch(reject);
    };

    return (new Promise(resolver));
}


export default {
    name: 'logout',
    command: logout
};
