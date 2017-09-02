/*
 * src/Mutex.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-lib package.
 *
 *  waend-lib is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-lib is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-lib.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import * as debug from 'debug';
const logger = debug('waend:Mutex');


export type Unlock = () => void;
type Resolver = (a: (b: Unlock) => void, c: (d: Error) => void) => void;

export class Mutex extends EventEmitter {

    private queue: number;

    constructor(private queueLength = 128) {
        super();
        this.queue = 0;
        this.setMaxListeners(this.queueLength);
    }

    get(): Promise<Unlock> {
        logger('mutex.get', this.queue);

        const unlock: Unlock =
            () => {
                logger('mutex.unlock', this.queue);
                this.queue -= 1;
                this.emit('unlock', this.queue);
            };

        if (this.queue > 0) {
            const resolver: Resolver =
                (resolve, reject) => {
                    if (this.queue >= this.queueLength) {
                        return reject(new Error('QueueLengthExceeded'));
                    }
                    const index = this.queue;
                    this.queue += 1;
                    logger('mutex.queue', this.queue);

                    const listener: (a: number) => void =
                        (q) => {
                            if (q <= index) {
                                this.removeListener('unlock', listener);
                                resolve(unlock);
                            }
                        };

                    this.on('unlock', listener);
                };
            return (new Promise(resolver));
        }

        this.queue += 1;
        return Promise.resolve(unlock);
    }

}

