/*
 * src/Console.ts
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


import * as Promise from 'bluebird';

import { semaphore, setenv, Shell, CommandSet } from 'waend-shell';
import { SpanPack, Mutex, Extent } from 'waend-lib';

import { Pager } from "./Pager";
import { Input } from "./Input";
// import { Sidebar } from "./Sidebar";
import { dom } from "waend-util";
import { EndFn, Display, IDisplay } from "./Display";
import * as CMD from 'waend-commands';

const { DIV, px, addClass } = dom;


const shellCommands = [
    CMD.login,
    CMD.changeContext,
    CMD.lookup,
];

const userCommands = [
    CMD.attach,
    CMD.create,
    CMD.getAttribute,
    CMD.setAttribute,
    CMD.printCurrentContext,
    CMD.setRegion,
    CMD.getRegion,
    CMD.bufferRegion,
    CMD.getRegionCenter,
    CMD.printRegion,
    CMD.popRegion,
    CMD.list,
    ...shellCommands
];

const groupCommands = [
    ...userCommands
];

const layerCommands = [
    ...groupCommands
];

const featureCommands = [
    ...layerCommands
];

const commands: CommandSet = [
    shellCommands,
    userCommands,
    groupCommands,
    layerCommands,
    featureCommands
];

export interface IConsole {
    node: Element;
    start: () => Shell;
}

export type ScreenFn = () => IDisplay;

const startDisplay: (a: HTMLElement, b: Extent) => IDisplay =
    (root, rootExtent) => {
        const rootPositioning = root.style.position;
        const [left, top] = rootExtent.getBottomLeft().getCoordinates();
        const width = rootExtent.getWidth();
        const height = rootExtent.getHeight();

        const onShutdown: EndFn =
            () => {
                root.style.position = rootPositioning;
                root.style.transform = `translate(${px(width)}, 0)`;
                return Promise.resolve();
            }

        const display = Display(onShutdown);

        display.node.style.position = 'absolute';
        display.node.style.left = px(left);
        display.node.style.top = px(top);
        display.node.style.width = px(width);
        display.node.style.height = px(height);

        root.style.position = 'absolute';
        root.style.transform = `translate(-${px(width)}, 0)`;

        return display;
    };


export const Console: () => IConsole =
    () => {
        const node = DIV();
        const pager = Pager({ className: 'wc-pager' });
        const input = Input({ className: 'wc-input' });
        // const sidebar = Sidebar({ className: 'wc-sidebar' });

        addClass(node, 'wc-container');
        // node.appendChild(sidebar.node);
        node.appendChild(pager.node);
        node.appendChild(input.node);

        const mutx = new Mutex();

        const runCommand: (a: Shell) => (b: string) => void =
            (shell) => (command) => {
                mutx.get()
                    .then((unlock) => {
                        input.disable();
                        shell.exec(command)
                            .catch((err) => console.log(err))
                            .finally(() => {
                                pager.newPage();
                                input.enable();
                                unlock();
                            });
                    })
                    .catch((err) => {
                        console.error('get mutex', err);
                    });
            };


        const display =
            () => {
                const parent = node.parentElement;
                if (parent) {
                    const rect = parent.getBoundingClientRect();
                    const extent = new Extent(rect);
                    return startDisplay(node, extent);
                }
                throw (new Error('OrphanConsole'));
            }


        const start =
            () => {
                const shell = new Shell(commands);
                setenv<ScreenFn>('screen', display);

                semaphore.observe<string>('command:run', runCommand(shell));

                shell.stdout.on('data',
                    (data: SpanPack) => pager.write(data));
                shell.stderr.on('data',
                    (data: SpanPack) => pager.write(data));

                return shell;
            };



        return { node, start };
    }



