/*
 * src/login.ts
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
import { stringify } from 'querystring';
import { User } from "../lib";
import {
    ICommand, Context, Transport,
    getenv, ISys, PostOptions
} from 'waend-shell';

/*
{
    text: string;
    fragment?: Element;
    commands?: string[];
}
*/

const login: (a: Context, b: ISys, c: string[]) => Promise<any> =
    (ctx, sys, argv) => {
        const transport = new Transport();
        const shell = ctx.shell;
        const stdout = sys.stdout;
        const stdin = sys.stdin;
        const binder = ctx.binder;
        const loginUrl = getenv<string>('LOGIN_URL');

        if (!loginUrl) {
            return Promise.reject(new Error('NoLoginUrlOnEnv'));
        }

        const remoteLogin: (a: string, b: string) => Promise<User> =
            (username, password) => {
                const options: PostOptions<void> = {
                    url: loginUrl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: stringify({ username, password }),
                    parse: () => { },
                };

                return transport.post(options)
                    .then(() => (
                        binder.getMe()
                            .then(user => {
                                shell.loginUser(user);
                                const cmd1 = {
                                    commands: [`cc /${user.id}`, 'get'],
                                    text: 'my public infos'
                                };
                                const cmd2 = {
                                    commands: [`cc /${user.id}`, 'lg'],
                                    text: 'my maps'
                                };
                                stdout.write([cmd1, cmd2]);
                                return user;
                            })
                    ));
            };

        if (argv.length >= 2) {
            return remoteLogin(argv[0], argv[1]);
        }
        else if (argv.length === 1) {
            stdout.write([{ text: 'password:' }]);
            return (
                stdin.read()
                    .then((span) => remoteLogin(argv[0], span[0].text))
            );
        }


        stdout.write([{ text: 'e-mail:' }]);
        return (
            stdin.read()
                .then((spanUsername) => {
                    const username = spanUsername[0].text;
                    stdout.write([{ text: 'password:' }]);
                    stdin.read()
                        .then(spanPassword => {
                            const password = spanPassword[0].text;
                            return remoteLogin(username, password);
                        });
                })
        );

    }

export const command: ICommand = {
    name: 'login',
    command: login
};

