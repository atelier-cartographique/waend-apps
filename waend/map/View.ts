/*
 * src/View.ts
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

// 'use strict';

import * as debug from 'debug';
// import Navigator from './Navigator';
import { DataQuery, CompQuery } from './index';
import Renderer from './Renderer';
import { getLayers, getRect } from './queries';

const logger = debug('waend:map/view');

const document = window.document;

export interface Context extends CanvasRenderingContext2D {
    id: string;
}

export interface DispositifDeRendu {
    id: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    renderer: Renderer;
}

const findR =
    (id: string) =>
        (ddr: DispositifDeRendu[]) => ddr.find(r => r.id === id);

export default class View {
    private root: Element | null;
    private ddr: DispositifDeRendu[];
    readonly navigator: Navigator;



    constructor(readonly comp: CompQuery, readonly data: DataQuery) {
        this.ddr = [];

        // this.navigator = new Navigator({
        //     'container': this.root,
        //     'map': this.map,
        //     'view': this
        // });

        // window.addEventListener('resize', () => this.resize());
        // semaphore.on('map:resize', () => this.resize());

    }



    attach(root?: Element) {
        if (root) {
            this.root = root;
            this.ddr.forEach((r) => {
                root.appendChild(r.canvas);
            });
        }
        else {
            this.root = null;
        }
    }

    render() {
        this.reorderLayers()
            .forEach(r => r.renderer.render());
    }

    resize() {
        const rect = getRect(this.comp());
        this.ddr.forEach((r) => {
            r.canvas.width = rect.width;
            r.canvas.height = rect.height;
        });

        // if (this.navigator) {
        //     this.navigator.resize();
        // }

    }


    // translate(dx: number, dy: number) {
    //     this.transform.translate(dx, dy);
    //     return this;
    // }

    // scale(sx: number, sy: number) {
    //     this.transform.translate(sx, sy);
    //     return this;
    // }


    // getLayer(layerId: string) {
    //     const idx = _.findIndex(this.sources, source => layerId === source.id);
    //     if (idx < 0) {
    //         return null;
    //     }
    //     return this.sources[idx];
    // }

    // getCanvas(layerId: string) {
    //     const idx = _.findIndex(this.canvas, cvns => layerId === cvns.id);
    //     if (idx < 0) {
    //         return null;
    //     }
    //     return this.canvas[idx];
    // }

    // getContext(layerId: string) {
    //     const idx = _.findIndex(this.contexts, ctx => layerId === ctx.id);
    //     if (idx < 0) {
    //         return null;
    //     }
    //     return this.contexts[idx];
    // }

    // getFeatures(extent?: Extent | number[] | rbush.BBox) {
    //     return (
    //         this.sources.reduce<Feature[]>(
    //             (acc, s) => acc.concat(s.getFeatures(extent)), [])
    //     );
    // }

    createCanvas() {
        const canvas = document.createElement('canvas');
        const rect = getRect(this.comp());

        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        // canvas.style.zIndex = (-this.canvas.length).toString();
        // this.canvas.push(canvas);
        // this.root.insertBefore(canvas, this.navigator.getNode());
        return canvas;
    }

    createContext(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        // here should go some sort of init.
        if (!ctx) {
            throw (new Error('Failed to create a 2d context'));
        }
        return ctx;
    }

    addSource(source: any) {
        // if (!this.navigator.isStarted) {
        //     this.navigator.start();
        // }

        const id: string = source.id;
        const canvas = this.createCanvas();
        const context = this.createContext(canvas);
        const renderer = new Renderer(this.comp, this.data, id, context);
        const r: DispositifDeRendu = {
            id,
            canvas,
            context,
            renderer,
        };
        this.ddr.push(r);
        return r;
    }

    // removeSource(source: Source) {
    //     if (!!(this.getLayer(source.id))) {
    //         this.sources = _.reject(this.sources, l => l.id === source.id);
    //         this.contexts = _.reject(this.contexts, c => c.id === source.id);

    //         const canvasElement = document.getElementById(source.id);
    //         if (canvasElement) {
    //             this.root.removeChild(canvasElement);
    //         }
    //         this.canvas = _.reject(this.canvas, c => c.id === source.id);
    //     }
    //     return this;
    // }

    reorderLayers() {
        return getLayers(this.data())
            .map((layer: any, idx: number) => {
                let r = findR(layer.id)(this.ddr);
                if (!r) {
                    r = this.addSource(layer);
                }
                r.canvas.style.zIndex = (-idx).toString();
                return r;
            });
    }

    forEachImage(fn: (a: ImageData) => void) {
        const rect = getRect(this.comp());
        this.ddr.forEach((r) => {
            fn(r.context.getImageData(0, 0, rect.width, rect.height));
        });
    }
}

logger('loaded');
