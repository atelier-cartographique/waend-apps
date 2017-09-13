/*
 * src/LayerProvider.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-map package.
 *
 *  waend-map is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-map is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-map.  If not, see <http://www.gnu.org/licenses/>.
 */

import { EventEmitter } from 'events';
import { Semaphore } from '../shell';
import Source from './Source';


export class LayerProvider extends EventEmitter {
    private sources: Source[];

    constructor(private semaphore: Semaphore) {
        super();
        this.sources = [];

        this.semaphore.observe<Source[]>('source:change',
            this.update.bind(this));
    }

    clearSources() {
        this.sources.forEach((source) => {
            this.semaphore.signal('layer:layer:remove', source);
        });
        this.sources = [];
    }

    addSource(source: Source) {
        this.sources.push(source);
        this.semaphore.signal('layer:layer:add', source);
    }

    update(sources: Source[]) {
        this.semaphore.signal('layer:update:start', this);
        this.clearSources();
        sources.forEach((source) => this.addSource(source));
        this.semaphore.signal('layer:update:complete', this);
    }


};



export default function (semaphore: Semaphore): LayerProvider {
    return new LayerProvider(semaphore);
};

