/*
 * src/Pager.ts
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

import { SpanPack, PackPage } from "waend-lib";
import { semaphore } from 'waend-shell';
import { dom } from "waend-util";
import { asElement } from "./Command";

const { addClass, DIV, SPAN, appendText } = dom;

export interface PagerOptions {
    className: string;
}

type WriteFn = (a: SpanPack) => void;

interface IPager {
    node: Element;
    write: WriteFn;
    newPage: () => IPage;
}

interface IPage {
    node: Element;
    write: WriteFn;
}


const makePage: () => IPage =
    () => {
        const node = DIV();
        const docker = SPAN();
        const packList: PackPage = [];

        appendText('<dock>')(docker);
        addClass(docker, 'wc-page-docker icon-docker');
        node.appendChild(docker);

        docker.addEventListener('click', () => {
            semaphore.signal('page:dock', packList);
        }, false);

        const write: WriteFn =
            (pack) => {
                packList.push(pack);
                const line = makeLine(pack);
                node.appendChild(line);
            }

        return { node, write };
    }


const makeLine: (a: SpanPack) => Element =
    (pack) => {
        const line = DIV();
        addClass(line, 'wc-line');

        return (
            pack.reduce((elem, span) => {
                const fragment = asElement(span);
                elem.appendChild(fragment);
                return elem;
            }, line)
        );
    }


export const Pager: (a: PagerOptions) => IPager =
    (options) => {
        const node = DIV();
        const pages: IPage[] = [];
        let pageIndex = -1;

        addClass(node, options.className);

        const currentPage: () => IPage =
            () => {
                if (pageIndex >= 0) {
                    return pages[pageIndex];
                }
                return newPage();
            }


        const newPage: () => IPage =
            () => {
                const page = makePage();
                pages.push(page);
                node.appendChild(page.node);
                pageIndex = pages.length - 1;
                return page;
            }


        const write: WriteFn =
            (pack) => {
                currentPage().write(pack);
            }

        return { node, write, newPage };
    };
