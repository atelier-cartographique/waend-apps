/*
 * src/Stream.ts
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

import { EventEmitter } from 'events';
import * as Promise from 'bluebird';


export enum Status {
    Open,
    Close
}

export interface Span {
    text: string;
    // fragment?: Element;
    commands?: string[];
    json?: string;
}

export type SpanPack = Span[];
export type PackPage = SpanPack[];



export class Stream extends EventEmitter {
    private entries: SpanPack[];
    private openStatus: Status;

    constructor(status: Status = Status.Open) {
        super();
        this.entries = [];
        this.openStatus = status;
    }

    open() {
        this.openStatus = Status.Open;
    }

    close() {
        this.openStatus = Status.Close;
    }

    isOpened() {
        return (this.openStatus === Status.Open);
    }

    write(pack: SpanPack) {
        if (this.isOpened()) {
            this.entries.push(pack);
            this.emit('data', pack);
        }
    }

    read(): Promise<SpanPack> {
        if (this.isOpened) {
            const entry = this.entries.shift();
            if (entry) {
                return Promise.resolve(entry);
            }
            else {
                const resolver: (a: (b: SpanPack) => void) => void =
                    (resolve) => {
                        this.once('data',
                            (entry: SpanPack) => {
                                resolve(entry);
                                this.entries.shift();
                            });
                    };
                return (new Promise(resolver));
            }
        }
        return Promise.reject(new Error('stream is closed'));
    }

    readSync() {
        if (this.isOpened()) {
            return this.entries.shift();
        }
        return null;
    }

    dump() {
        const entries = this.entries;
        this.entries = [];
        return entries;
    }
};

