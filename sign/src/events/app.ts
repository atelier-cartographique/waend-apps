
import * as debug from 'debug';
import { dispatch } from './index';
import { AppLayout } from '../shape';
import { User } from "waend/lib";


const logger = debug('waend:events/app');

const events = {

    setLayout(l: AppLayout) {
        dispatch('app/layout', () => l);
    },

    setUser(u: User) {
        dispatch('data/user', () => u);
    },
};

export default events;

logger('loaded');
