/*
 * src/feature/getGeometry.ts
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


import _ from 'lodash';

function getGeometry () {
    const self = this;
    const args = _.toArray(arguments);
    const format = args.shift();
    const sys = self.sys;
    const geom = self.data.getGeometry();

    sys.stdout.write(JSON.stringify(geom.toGeoJSON()));
    return self.end(geom);
}


export default {
    name: 'getGeometry',
    command: getGeometry
};
