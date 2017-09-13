/*
 * src/Renderer.ts
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

import * as _ from 'lodash';
import * as debug from 'debug';
import {
    EventCancelFrame,
    EventRenderFrame,
    EventRenderInit,
    // EventRenderUpdate,
    // Feature,
    PainterCommand,
    WaendWorker,
    getconfig,
} from '../lib';
import Painter from './Painter';
import { CompQuery, DataQuery } from './index';
import { getFeatures, getTransform, getGeoExtent } from './queries';

const logger = debug('waend:map/renderer');


class CanvasRenderer {
    private worker: WaendWorker;
    private pendingUpdate: boolean;
    private isReady: boolean;
    private painter: Painter;
    private visible: boolean;
    // private features: { [propName: string]: Feature };
    private frameId: string;

    constructor(
        readonly comp: CompQuery,
        readonly data: DataQuery,
        readonly layerId: string,
        context: CanvasRenderingContext2D,
    ) {
        this.frameId = 'none';
        this.visible = true;
        this.painter = new Painter(comp, data, context);
        this.initWorker();
    }

    setVisibility(v: boolean) {
        this.visible = v;
    }

    isVisible() {
        return this.visible;
    }

    getNewFrameId() {
        return (`${this.layerId}.${_.uniqueId()}`);
    }

    initWorker() {
        // const layer = this.source.layer;
        getconfig('defaultProgramUrl')
            .then((defaultProgramUrl) => {
                const programUrl = defaultProgramUrl; // FIXME
                this.worker = new WaendWorker(`${programUrl}?l=${this.layerId}`);
                this.worker.start();
                const ack = _.uniqueId('ack.');
                this.worker.once(ack,
                    () => {
                        this.isReady = true;
                        if (this.pendingUpdate) {
                            this.pendingUpdate = false;
                            this.render();
                        }
                    });

                this.worker.on('frame',
                    (id: string, commands: PainterCommand[]) => {
                        if (id === this.frameId) {
                            this.painter.processCommands(commands);
                        }
                    });

                this.worker.post({
                    name: EventRenderInit,
                    models: getFeatures(this.data(), this.layerId),
                    ack,
                });
            })
            .catch(err => logger(err));

        // this.source.on('update',
        //     () => {
        //         const ack = _.uniqueId('ack.');
        //         this.worker.once(ack,
        //             () => { this.render(); });

        //         this.worker.post({
        //             name: EventRenderInit,
        //             models: this.source.toJSON(),
        //             ack
        //         });
        //     });

        // this.source.on('update:feature',
        //     (feature: Feature) => {
        //         const ack = _.uniqueId('ack.');
        //         this.worker.once(ack,
        //             () => { this.render(); });

        //         this.worker.post({
        //             name: EventRenderUpdate,
        //             models: this.source.toJSON([feature]),
        //             ack
        //         });
        //     });



    }

    // drawBackround() {
    //     const we = Region.getWorldExtent();
    //     const painter = this.painter;
    //     let tl = we.getTopLeft().getCoordinates();
    //     let tr = we.getTopRight().getCoordinates();
    //     let br = we.getBottomRight().getCoordinates();
    //     let bl = we.getBottomLeft().getCoordinates();
    //     const trans = this.view.transform.clone();

    //     tl = trans.mapVec2(pointProject(tl));
    //     tr = trans.mapVec2(pointProject(tr));
    //     br = trans.mapVec2(pointProject(br));
    //     bl = trans.mapVec2(pointProject(bl));

    //     const coordinates = [[tl, tr, br, bl]];

    //     painter.save();
    //     painter.set('strokeStyle', '#888');
    //     painter.set('lineWidth', '0.5');
    //     painter.set('fillStyle', '#FFF');
    //     painter.drawPolygon(coordinates, ['closePath', 'stroke', 'fill']);
    //     painter.restore();
    // }

    render() {
        if (!this.isVisible()) {
            this.painter.clear();
            return;
        }
        if (!this.isReady) {
            this.pendingUpdate = true;
            return;
        }

        const ack = _.uniqueId('ack.');
        this.worker.once(ack,
            () => {

                const worker = this.worker;
                logger(this.comp());
                const extent = getGeoExtent(this.comp());
                const transform = getTransform(this.comp()).flatMatrix();

                if (this.frameId) {
                    worker.post({
                        name: EventCancelFrame,
                        id: this.frameId,
                    });
                }

                this.painter.clear();

                this.frameId = this.getNewFrameId();
                worker.post({
                    name: EventRenderFrame,
                    id: this.frameId,
                    transform,
                    extent,
                })


            });

        this.worker.post({
            name: EventRenderInit,
            models: getFeatures(this.data(), this.layerId),
            ack,
        });

    }

    stop() {
        this.worker.stop();
    }
}


export default CanvasRenderer;

logger('loaded');
