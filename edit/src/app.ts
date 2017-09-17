
import * as debug from 'debug';
import { render } from 'react-dom';
import { IShape } from './shape';
import { IStoreInteractions } from './source';
import { getBinder } from 'waend/shell';
import events from './events/app';
import queries from './queries/app';
import mainC from './components/main';
import { fromNullable } from 'fp-ts/lib/Option';
import { User } from 'waend/lib';
import { DIV } from './components/elements';


const logger = debug('waend:app');
const MIN_FRAME_RATE = 16;

const parseArgs =
    (user: User, args: string[]) => {
        events.setArgs(args);
        if (args.length > 0) {
            switch (args[0]) {
                case 'new':
                    events.setNewState('initial');
                    break;
                default:
                    events.loadMap(user.id, args[0]);
            }
        }
    };



const wrapMain =
    (n: React.ReactNode) => DIV({ className: 'edit' }, n);

const renderMain = (): React.DOMElement<{}, Element> => {
    switch (queries.getLayout()) {
        case 'main': return wrapMain(mainC());
    }
};


export default (store: IStoreInteractions<IShape>) => {

    let lastFrameRequest: number | null = null;
    let version: number = -1;
    let frameRate = MIN_FRAME_RATE;
    const root = document.createElement('div');
    document.body.appendChild(root);


    const updateState = (ts: number) => {
        let offset: number = 0;
        const stateVersion = store.version();
        if (lastFrameRequest !== null) {
            offset = ts - lastFrameRequest;
        }
        else {
            lastFrameRequest = ts;
        }

        if (offset >= frameRate && (version !== stateVersion)) {
            version = stateVersion;
            lastFrameRequest = ts;
            logger(`render version ${stateVersion}`);
            try {
                const startRenderTime = performance.now();
                render(renderMain(), root);
                const renderTime = performance.now() - startRenderTime;
                if (renderTime > frameRate) {
                    frameRate = renderTime;
                }
                else if (frameRate > MIN_FRAME_RATE) {
                    frameRate -= 1;
                }
            }
            catch (err) {
                logger(`could not render ${err}`);
                throw err;
                // requestAnimationFrame(updateState);
            }
        }
        requestAnimationFrame(updateState);
    };

    const start = (wc: any) => {
        requestAnimationFrame(updateState);
        const args = fromNullable(wc.args);
        getBinder()
            .getMe()
            .then((user) => {
                events.setUser(user);
                args.map((a) => parseArgs(user, a));
            })
            .catch(() => {
                document.location.assign('/sign/');
            });
    };

    return { start };
};


logger('loaded');
