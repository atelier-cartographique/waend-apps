/*
 * src/index.ts
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


// import layers from './LayerProvider';
// import sources from './SourceProvider';
import WaendMap from './WaendMap';

// export default function (
//     root: Element,
//     defaultProgramUrl: string,
//     mediaUrl: string,
//     projection?: string;
//     layers();
//     sources();
//     return (new WaendMap({ root, defaultProgramUrl, mediaUrl, projection }));
// } 

export interface MapState {
    dirty: boolean;
    defaultProgramUrl: string | null;
    mediaUrl: string | null;
    extent: number[];
    matrix: number[];
    rect: ClientRect;
};

export const defaultMapState =
    (): MapState => ({
        dirty: false,
        defaultProgramUrl: null,
        mediaUrl: null,
        extent: [],
        matrix: [1, 0, 0, 1, 0, 0],
        rect: {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
        },
    });


export type CompQuery = () => MapState;
export type DataQuery = () => any; // in need for a Group type



export const waendMap =
    (comp: CompQuery, data: DataQuery) => {
        const wm = new WaendMap(comp, data);
        return wm;
        // return ({
        //     attach: (root: Element) => wm.getView().attach(root),
        //     render: () => wm.render(),
        // });
    };

export default waendMap;
