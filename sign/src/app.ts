
import * as debug from 'debug';
import { render } from 'react-dom';
import { IShape } from './shape';
import { IStoreInteractions } from './source';
import { getBinder } from "waend/shell";
import events from './events/app';
import queries from './queries/app';
import signin from './components/signin';
import signup from './components/signup';


const logger = debug('waend:app');


const renderSignIn = () => signin();
const renderSignUp = () => signup();

const renderMain = (): React.DOMElement<{}, Element> => {
    switch (queries.getLayout()) {
        case 'signin': return renderSignIn();
        case 'signup': return renderSignUp();
    }
};

const MIN_FRAME_RATE = 16;

export default (store: IStoreInteractions<IShape>) => {

    let lastFrameRequest: number | null = null; let version: number = -1;
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

    const start = () => {
        requestAnimationFrame(updateState);
        getBinder()
            .getMe()
            .then((user) => {
                events.setUser(user);
            })
            .catch(() => {
                events.setLayout('signin');
            });
    };

    return { start };
};


logger('loaded');
