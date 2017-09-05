
import { stringify } from 'querystring';
import * as debug from 'debug';
import { getconfig } from 'waend/lib';
import { Transport, PostOptions, getBinder } from 'waend/shell';


const logger = debug('waend:events/auth');


const events = {

    register(name: string, email: string, password: string) {
        const transport = new Transport();

        getconfig('registerUrl')
            .then((registerUrl) => {
                const options: PostOptions<void> = {
                    url: registerUrl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: stringify({ name, email, password }),
                    parse: () => { },
                };

                return transport.post(options);
            })
            .then(() => getBinder().getMe())
            .then(() => {
                window.location.assign('/dashboard');
            });

    },

    login(username: string, password: string) {
        const transport = new Transport();

        getconfig('loginUrl')
            .then((loginUrl) => {
                const options: PostOptions<void> = {
                    url: loginUrl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: stringify({ username, password }),
                    parse: () => { },
                };

                return transport.post(options);
            })
            .then(() => getBinder().getMe())
            .then(() => {
                window.location.assign('/dashboard');
            });

    },
};

export default events;

logger('loaded');
