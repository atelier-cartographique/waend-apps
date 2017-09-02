/*
 * src/filter.ts
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
import debug from 'debug';
const logger = debug('waend:command:filter');


function filter (pattern, flags) {
    const self = this;
    const shell = self.shell;
    const stdin = self.sys.stdin;
    const stdout = self.sys.stdout;
    const stderr = self.sys.stderr;
    const re = new RegExp(pattern, flags);



    const resolver = (resolve, reject) => {

        let depth = 0;

        const end = () => {
            logger('end', depth);
            depth -= 1;
            if(depth <= 0){
                resolve();
            }
        };

        const runFilter = () => {
            const line = stdin.read();
            if(!!line) {
                depth += 1;
                logger('inline', depth);
                line
                    .then(data => {
                        let match = false;
                        for (let i = 0; i < data.length; i++) {
                            const str = _.result(data[i], 'toString');
                            if(str && str.match(re)){
                                match = true;
                                break;
                            }
                        }
                        if (match) {
                            stdout.write(...data);
                        }
                    })
                    .catch(err => {
                        stderr.write(err);
                    })
                    .finally(() => {
                        end();
                        runFilter();
                    });
            }
            else {
                end();
            }
        };

        runFilter();
    };

    return self.end(resolver);
}

export default {
    name: 'filter',
    command: filter
};
