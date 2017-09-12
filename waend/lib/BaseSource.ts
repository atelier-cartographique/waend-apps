/*
 * src/BaseSource.ts
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

import * as rbush from 'rbush';
import { EventEmitter } from 'events';
import { Extent } from './Geometry';
import { GeoModel } from './Model';

interface Index {
    [propName: string]: number;
}

interface RBushItem extends rbush.BBox {
    id: string;
}

export class BaseSource<T extends GeoModel> extends EventEmitter {
    private tree: rbush.RBush<RBushItem>;
    private index: Index;
    private features: Array<T>

    constructor() {
        super();
        this.tree = rbush<RBushItem>();
        this.index = {};
        this.features = [];
    }

    clear() {
        this.index = {};
        this.features = [];
        this.tree.clear();
    }

    addFeature(f: T, skipSpatialIndex = false) {
        this.features.push(f);
        this.index[f.id] = this.features.length - 1;
        if (!skipSpatialIndex) {
            const geom = f.getGeometry();
            const baseExtent = geom.getExtent().getDictionary();
            const extent = { id: f.id, ...baseExtent };
            this.tree.insert(extent);
        }
        this.emit('add', f);
    }

    removeFeature(id: string) {
        this.features.splice(this.index[id], 1);
        delete this.index[id];
        this.buildTree();
    }

    buildTree() {
        const features = this.features;
        this.tree.clear();
        const items: RBushItem[] = features.map(feature => ({
            id: feature.id, ...(feature.getExtent().getDictionary())
        }));
        this.tree.load(items);
    }

    getLength() {
        return this.features.length;
    }

    getFeature(id: string) {
        return this.features[this.index[id]];
    }

    getFeatures(opt_extent?: Extent | number[] | rbush.BBox) {
        const features = [];
        if (opt_extent) {
            let extent: rbush.BBox;
            if (opt_extent instanceof Extent) {
                extent = opt_extent.getDictionary();
            }
            else if (Array.isArray(opt_extent)) { // we assume [minx, miny, maxx, maxy]
                extent = (new Extent(opt_extent)).getDictionary();
            }
            else { // proper rbush dictionary?
                extent = opt_extent;
            }

            const items = this.tree.search(extent)
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const featureIndex = this.index[item.id];
                features.push(this.features[featureIndex]);
            }
        }
        else {
            return this.features;
        }
        return features;
    }
}




