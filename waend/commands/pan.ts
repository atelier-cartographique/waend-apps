/*
 * src/pan.ts
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

import region from '../Region';
import Transform from '../Transform';


function panRegion (dir, val) {
    const extent = region.get().extent;
        T = new Transform();
    dir = dir.toUpperCase();
    if ('N' === dir){
        T.translate(0, val);
    }
    else if ('S' === dir){
        T.translate(0, -val);
    }
    else if ('E' === dir){
        T.translate(val, 0);
    }
    else if ('W' === dir){
        T.translate(-val, 0);
    }

    const NE = T.mapVec2([extent[2], extent[3]]);
    const SW = T.mapVec2([extent[0], extent[1]]);

    const newExtent = [SW[0], SW[1], NE[0], NE[1]];
    region.push(newExtent);
    return this.end(newExtent);
}

export default {
    name: 'pan',
    command: panRegion
};
