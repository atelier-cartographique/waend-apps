/*
 * src/Worker.ts
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
import { ModelData } from "./Model";
import { PainterCommand } from "./index";
import * as debug from 'debug';

const log = debug('waend:Worker');

export const EventRenderFrame = 'render:frame';
export interface MessageFrame {
    name: 'render:frame';
    id: string;
    extent: number[];
    transform: number[];
}

export const EventCancelFrame = 'render:cancel';
export interface MessageCancel {
    name: 'render:cancel';
    id: string;
}

export const EventRenderInit = 'render:init';
export interface MessageInit {
    name: 'render:init';
    models: ModelData[];
    ack: string;
}

export const EventRenderUpdate = 'render:update';
export interface MessageUpdate {
    name: 'render:update';
    models: ModelData[];
    ack: string;
}

export type TypedMessage = MessageFrame | MessageCancel | MessageInit | MessageUpdate;

export interface ResponseAck {
    name: 'ack',
    id: string;
}

export interface ResponseFrame {
    name: 'frame',
    id: string;
    instructions: PainterCommand[];
}

type Response = ResponseAck | ResponseFrame;


export class WaendWorker extends EventEmitter {
    private worker: Worker;


    constructor(private url: string) {
        super();
    }


    post<T extends TypedMessage>(message: T) {
        log(`send ${message.name}`);
        this.worker.postMessage(message);
    }


    start() {
        this.worker = new Worker(this.url);
        this.worker.addEventListener('message', this.onMessageHandler(), false);
        this.worker.addEventListener('error', this.onErrorHandler(), false);
        this.worker.postMessage({});
    }


    stop() {
        this.worker.terminate();
    }


    onMessageHandler() {
        const handler = (event: MessageEvent) => {
            const data = <Response>event.data;
            log(`recv ${data.name} (${data.id})`);

            switch (data.name) {
                case 'ack':
                    // emitting id allows for simple worker.once(id)
                    this.emit(data.id)
                    break;

                case 'frame':
                    this.emit('frame', data.id, data.instructions);
                    break;
            }
        };

        return handler;
    }


    onErrorHandler() {
        const handler = (event: ErrorEvent) => {
            console.error(event);
        };

        return handler;
    }
}

