/*
 * src/index.ts
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

import { CoordPolygon, CoordLinestring } from './Geometry';


export * from './BaseSource';
export * from './Geometry';
export * from './Stream';
export * from './Transform';
export * from "./Config";
export * from "./Model";
export * from "./Mutex";
export * from "./Worker";


// painting

export type ImageAdjust = 'none' | 'fit' | 'cover';

export interface ImageOptions {
    image: string;
    adjust: ImageAdjust;
    clip: boolean;
    rotation?: number;
}

export type PolygonEnd = 'closePath' | 'stroke' | 'fill' | 'clip';
export type PolygonEnds = PolygonEnd[];
export type ClipCommand = 'end' | 'begin';
export type ContextValue = boolean | string | number | number[];
export type DrawingInstructionBase = [string];
export type DrawingInstructionPoint = [string, number, number];
export type DrawingInstructionQuadratic = [string, number, number, number, number];
export type DrawingInstructionBezier = [string, number, number, number, number, number, number];

export type DrawingInstruction =
    | DrawingInstructionBase
    | DrawingInstructionPoint
    | DrawingInstructionQuadratic
    | DrawingInstructionBezier;

export type PainterCommandApplyTexture = ['applyTexture', string];
export type PainterCommandClear = ['clear'];
export type PainterCommandClearRect = ['clearRect', number[]];
export type PainterCommandEndTexture = ['endTexture'];
export type PainterCommandImage = ['image', CoordPolygon, number[], ImageOptions];
export type PainterCommandInstructions = ['instructions', DrawingInstruction[]];
export type PainterCommandLine = ['line', CoordLinestring];
export type PainterCommandPolygon = ['polygon', CoordPolygon, PolygonEnds];
export type PainterCommandRestore = ['restore'];
export type PainterCommandSave = ['save'];
export type PainterCommandSet = ['set', string, ContextValue];
export type PainterCommandStartTexture = ['startTexture', string];
export type PainterCommandTransform = ['transform', number, number, number, number, number, number];

export type PainterCommand =
    | PainterCommandClear
    | PainterCommandApplyTexture
    | PainterCommandClearRect
    | PainterCommandEndTexture
    | PainterCommandImage
    | PainterCommandInstructions
    | PainterCommandLine
    | PainterCommandPolygon
    | PainterCommandRestore
    | PainterCommandSave
    | PainterCommandSet
    | PainterCommandStartTexture
    | PainterCommandTransform;