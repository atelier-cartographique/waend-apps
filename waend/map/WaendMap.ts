/*
 * src/WaendMap.ts
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


import * as _ from 'lodash';
import { Extent, Feature } from "../lib";
import View from './View';
import Source from './Source';
import { pointProject, pointUnproject } from "../util";
import { CompQuery, DataQuery } from './index';



export default class WaendMap {
    private view: View;

    constructor(readonly comp: CompQuery, readonly data: DataQuery) {
        this.view = new View(comp, data);
    }



    projectedExtent(extent: Extent) {
        const bl = pointProject(
            extent.getBottomLeft().getCoordinates());
        const tr = pointProject(
            extent.getTopRight().getCoordinates());
        const pr = [bl[0], bl[1], tr[0], tr[1]];
        return new Extent(pr);
    }

    waendUpdateExtent(_extent: Extent) {
        // this.view.setExtent(this.projectedExtent(extent), this.semaphore);
        // this.render();
    }

    waendUpdateRegion() {
    }

    setVisibility(layerIds: string[]) {
        Object.keys(this.renderers)
            .forEach((id) => {
                const renderer = this.renderers[id];
                const vs = renderer.isVisible();
                const ts = _.indexOf(layerIds, id) >= 0;
                if (ts !== vs) {
                    renderer.setVisibility(ts);
                    renderer.render();
                }
            });

        this.view.reorderLayers(layerIds);
    }

    render() {
        this.view.render();
    }

    waendAddSource() {
        // this.view.addSource(source);
        // const { defaultProgramUrl, mediaUrl } = this.comp()
        // const renderer = new Renderer({
        //     source,
        //     view: this.view,
        //     defaultProgramUrl: defaultProgramUrl,
        //     mediaUrl: mediaUrl,
        // }, this.semaphore);

        // this.renderers[source.id] = renderer;
        // renderer.render();
        const { data } = this.data();
        data.group.layers.forEach((layer: any) => {
            this.view.addSource(layer);
        });
    }

    waendRemoveSource(source: Source) {
        this.renderers[source.id].stop();
        delete this.renderers[source.id];
        this.view.removeSource(source);
    }

    getCoordinateFromPixel(pixel: number[]) {
        const v = [pixel[0], pixel[1]];
        const inverse = this.view.transform.inverse();
        const tv = inverse.mapVec2(v);
        // logger('map.getCoordinateFromPixel', v, inverse.flatMatrix(), tv);
        return pointUnproject(tv);
    }

    getPixelFromCoordinate(coord: number[]) {
        const v = [coord[0], coord[1]];
        const pv = pointProject(v);
        const tv = this.view.transform.mapVec2(pv);
        return tv;
    }

    getView() {
        return this.view;
    }

    getFeatures(extent?: Extent | number[] | rbush.BBox): Feature[] {
        return this.view.getFeatures(extent);
    }
}

