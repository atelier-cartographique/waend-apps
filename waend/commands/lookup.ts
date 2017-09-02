/*
 * src/lookup.ts
 *
 * 
 * Copyright (C) 2015-2017 Pierre Marchand <pierremarc07@gmail.com>
 * Copyright (C) 2017 Pacôme Béru <pacome.beru@gmail.com>
 *
 *  License in LICENSE file at the root of the repository.
 *
 *  This file is part of waend-command package.
 *
 *  waend-command is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  waend-command is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with waend-command.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as Promise from 'bluebird';
import { getconfig, SpanPack } from "../lib";
import { Transport, Context, ISys, ICommand } from 'waend-shell';

// const API_URL = config.public.apiUrl;

interface Properties {
    [key: string]: any;
}

interface Result {
    id: string;
    user_id: string;
    properties: Properties;
}

interface ScoredResult extends Result {
    score: number;
}

interface ResultMatrix {
    [id: string]: ScoredResult;
}

interface LookupResult {
    page: number;
    totalCount: number;
    pageSize: number;
    pageCount: number;
    results?: Result[];
}


const makeSpan: (a: ScoredResult) => SpanPack =
    (data) => {
        return [
            {
                text: `${data.properties.name} (${data.score})`,
                commands: [`cc /${data.user_id}/${data.id}`]
            }
        ];
    };

const printResult: (a: Context, b: ISys) => (c: LookupResult) => ScoredResult[] =
    (_ctx, sys) => (data) => {
        if (data.results) {

            const results = data.results.reduce((acc, result) => {
                if (!(result.id in acc)) {
                    acc[result.id] = {
                        score: 0,
                        ...result
                    };
                }
                acc[result.id].score += 1;
                return acc;
            }, <ResultMatrix>{});

            const sortedResults =
                Object.keys(results)
                    .map((k) => results[k])
                    .sort((a, b) => a.score - b.score);

            sortedResults.forEach((result) => {
                sys.stdout.write(makeSpan(result));
            });

            return sortedResults;
        }
        return [];
    };


const lookup: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (ctx, sys, argv) => {

        if (argv.length === 0) {
            return Promise.reject(new Error('MissingArguments'));
        }

        const resolver: (a: (b: ScoredResult[]) => void, c: (d: any) => void) => void =
            (resolve, reject) => {
                getconfig('apiUrl')
                    .then((apiUrl) => {
                        const transport = new Transport();
                        const options = {
                            url: `${apiUrl}/group/${argv[0]}`,
                            parse: printResult(ctx, sys),
                        }
                        transport
                            .get<ScoredResult[]>(options)
                            .then(resolve)
                            .catch(reject);

                    }, reject);
            };

        return (new Promise(resolver));
    }


export const command: ICommand = {
    name: 'lookup',
    command: lookup
};
