/*
 * src/feature/setGeometry.ts
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

import _ from 'lodash';

import Geometry from '../../Geometry';

function setGeometry (geoJSON) {
    const self = this;
    const feature = self.data;
    let geom;

    if (geoJSON) {
        try {
            const data = JSON.parse(geoJSON);
            geom = new Geometry.Geometry(data);
        }
        catch (err) {
            return this.endWithError(err);
        }
    }
    else {
        geom = self.shell.env.DELIVERED;
    }


    return feature.setGeometry(geom);
    // sys.stdout.write(geom.format(format));
    // return self.end(feature);
}


export default {
    name: 'setGeometry',
    command: setGeometry
};
