/*
 * src/delFeature.ts
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

// 'use strict';

import Promise from 'bluebird';

function delFeature (id) {
    const binder = this.binder;
    const shell = this.shell;
    const self = this;
    const uid = this.getUser();
    const gid = this.getGroup();
    const lid = this.getLayer();
    const fid = this.getFeature() || id;
    const inFeature = !!(this.getFeature());

    const resolver = (resolve, reject) => {
        binder.delFeature(uid, gid, lid, fid)
            .then(() => {
                shell.historyPushContext([uid, gid, lid])
                    .then(() => {
                        resolve(0);
                    })
                    .catch(reject);
            })
            .catch(reject);
    };

    if (uid && gid && lid && fid) {
        if (inFeature) {
            return (new Promise(resolver));
        }
        else {
            return binder.delFeature(uid, gid, lid, fid);
        }
    }

    return Promise.reject('MissigArgumentOrWrongContext');
}


export default {
    name: 'del_feature',
    command: delFeature
};
