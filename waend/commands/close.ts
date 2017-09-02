/*
 * src/close.ts
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

import Geometry from '../Geometry';

function close (sGeom) {
    const self = this;
    const env = self.shell.env;
    const binder = self.binder;
    const stdout = self.sys.stdout;
    const stdin = self.sys.stdin;
    const terminal = self.shell.terminal;
    const current = self.current();
    const uid = current[0];
    const gid = current[1];
    const lid = current[2];
    let geom;


    try { // args
        geom = Geometry.format.GeoJSON.read(sGeom);
    }
    catch (err) {
        try{ // stdout
            geom = Geometry.format.GeoJSON.read(self.sys.stdout.readSync());
        }
        catch (err) {
            try { // env
                if (env.DELIVERED
                    && env.DELIVERED.toGeoJSON) {
                    geom = env.DELIVERED;
                }
                else {
                    geom = Geometry.format.GeoJSON.read(env.DELIVERED); // if this last one throws, well, means we can stop
                }
            }
            catch (err) {
                throw (err);
            }
        }

    }

    if ('LineString' === geom.getType()) {
        const coords = geom.getCoordinates();
        coords.push(coords[0]);
        const poly = new Geometry.Polygon([coords]);
        return this.end(poly);
    }
    else{
        return this.end(geom);
    }
    return this.end();
}



export default {
    name: 'close',
    command: close
};
