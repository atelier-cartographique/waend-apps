
import * as debug from 'debug';
import queries from '../queries/user';
import { dispatch, observe, dispatchK } from './index';
import { getBinder } from 'waend/shell';
import { UserDataTuple } from "src/components/user";


const logger = debug('waend:events/user');


const cond =
    <T>(t: (a: T) => T, f: (a: T) => T) =>
        (c: boolean) =>
            (a: T) => {
                if (c) {
                    return t(a);
                }
                return f(a);
            };

const mod =
    <T>(o: T, k: string, v: any) => {
        return Object.assign({}, o, { [k]: v });
    }

observe('data/user', (user) => {
    if (!user) {
        dispatch('component/user', () => []);
    }
    else {
        dispatch('component/user', () => {
            const data = user.getProperties();
            const newKey = {
                key: '',
                value: '',
                editing: false,
            };
            return (
                [newKey].concat(Object.keys(data).map((k) => {
                    return {
                        key: k,
                        value: data[k],
                        editing: false,
                    }
                })));
        });
    }
});

const dispatchComp = dispatchK('component/user');
const dispatchData = dispatchK('data/user');

const events = {

    loadMaps(uid: string) {
        getBinder()
            .getGroups(uid)
            .then((groups) => {
                dispatch('data/groups', () => groups);
            });
    },

    updateKV(k: string, v: string) {
        const m = cond<UserDataTuple>(
            (t) => mod(mod(t, 'value', v), 'editing', true),
            t => t
        );
        dispatchComp((kv) => (
            kv.slice(0, -1)
                .map(t => mod(t, 'editing', false))
                .map((t) => m(t.key === k)(t))));
    },

    setUserValue(key: string) {
        let val: any;
        dispatchComp((kv) => {
            val = kv.filter((t) => t.key === key).reduce((_acc, t) => t.value, null);
            return kv;
        });
        dispatchData((u) => {
            if (u) {
                getBinder()
                    .update(u, key, val)
                    .then(() => {
                        dispatchData(u => u);
                    });
            }
            return u;
        });
    },

    updateNewKey(k: string) {
        dispatchComp((kv) => (
            kv.slice(0, -1).concat(
                kv.slice(-1).map(t => mod(t, 'key', k))
            )));
    },

    updateNewValue(v: string) {
        dispatchComp((kv) => (
            kv.slice(0, -1).concat(
                kv.slice(-1).map(t => mod(t, 'value', v))
            )));
    },

    createAttribute() {
        const { key, value } = queries.getNewAttribute();
        dispatchData((u) => {
            logger(`createAttribute ${key}: ${value}`);
            if (u) {
                getBinder()
                    .update(u, key, value)
                    .then(() => {
                        dispatchData(u => u);
                    });
            }
            return u;
        });
    },
};

export default events;

logger('loaded');
