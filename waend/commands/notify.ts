/*
 * src/notify.ts
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

import SyncHandler from './SyncHandler';

function notify () {
    const self = this;
    const shell = self.shell;
    const stdout = self.sys.stdout;
    const terminal = shell.terminal;
    const container = document.createElement('div');
    const sync = new SyncHandler(container, self);

    const wc = terminal.makeCommand({
        fragment: container,
        text: 'notifications'
    });

    stdout.write(wc);
    sync.start();
    return self.end();
}

export default {
    name: 'notify',
    command: notify
};
