/*
 * src/History.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-console package.
 *
 *  waend-console is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-console is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-console.  If not, see <http://www.gnu.org/licenses/>.
 */


type HistMoveFn = () => string;

export interface IHistory {
    forward: HistMoveFn;
    backward: HistMoveFn;
    push: (a: string) => void;
}



export const History: () => IHistory =
    () => {
        const commands: string[] = [];
        let currentIndex = -1;

        const resetIndex =
            () => {
                currentIndex = commands.length - 1;
                return currentIndex;
            }

        const push: (a: string) => number =
            (cmd) => {
                if (commands.length > 0) {
                    const lastCmd = commands[commands.length - 1];
                    if (lastCmd === cmd) {
                        return currentIndex;
                    }
                }
                commands.push(cmd);
                return resetIndex();
            }

        const backward: HistMoveFn =
            () => {
                if (commands.length > 0) {
                    currentIndex -= 1;
                    if (currentIndex < 0) {
                        currentIndex = +1;
                    }
                    return commands[currentIndex];
                }
                return '';
            }

        const forward: HistMoveFn =
            () => {
                if (commands.length > 0) {
                    currentIndex += 1;
                    if (currentIndex > (commands.length - 1)) {
                        currentIndex = -1;
                    }
                    return commands[currentIndex];
                }
                return '';
            }

        return { push, backward, forward };
    }
