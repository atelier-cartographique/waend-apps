/*
 * src/WebHistory.ts
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


import * as url from 'url';
import { IEventChangeContext, semaphore } from 'waend-shell';


type HistoryPopFn = (a: PopStateEvent) => void;
type HistoryPushFn = (a: IEventChangeContext) => void;

interface IUrl extends url.Url {
    fragment: string;
    comps: string[];
}


const getUrl: (a: string) => IUrl =
    (fragmentRoot) => {
        const purl = <IUrl>url.parse(window.location.href);
        const queryString = purl.query;

        if (queryString) {
            purl.query = {};
            const pairs = (<string>queryString).split('&');
            pairs.forEach((pair) => {
                const spair = pair.split('=');
                purl.query[spair[0]] = decodeURIComponent(spair[1]);
            });
        }

        // backbone based
        const trailingSlash = /\/$/;
        const routeStripper = /^[#\/]|\s+$/g;
        let fragment = purl.pathname || "";
        const root = fragmentRoot ? fragmentRoot.replace(trailingSlash, '') : "";
        if (!fragment.indexOf(root)) {
            fragment = fragment.substr(root.length);
        }
        fragment.replace(routeStripper, '');
        let path = fragment.split('/');
        while (path.length > 0 && 0 === path[0].length) {
            path = path.slice(1);
        }
        purl.fragment = fragment;
        purl.comps = path;

        return purl;
    };



export const initHistory: (a: string, b: HistoryPopFn) => string[] =
    (fragmentRoot, historyPopContext) => {
        const purl = getUrl(fragmentRoot);

        const historyPush: HistoryPushFn =
            (event) => {
                const { path } = event;
                window.history.pushState(
                    path,
                    '',
                    fragmentRoot + path.join('/')
                );
            };

        window.onpopstate = historyPopContext;

        let firstEvent = true;
        semaphore.observe<IEventChangeContext>(
            'shell:change:context', (event) => {
                if (firstEvent) {
                    firstEvent = false;
                }
                else {
                    historyPush(event);
                }
            });

        return purl.comps;
    };




