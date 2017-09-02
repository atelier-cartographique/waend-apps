
import { query } from './index';
import { Group, ModelProperties } from 'waend/lib';

const getData =
    (): ModelProperties => {
        const user = query('data/user');
        if (user) {
            return user.getData();
        }
        return {};
    };

const queries = {
    getUserName() {
        const data = getData();
        if ('name' in data) {
            return data.name.toString();
        }
        return 'Missing Name';
    },

    getAttributeKeys() {
        return Object.keys(getData());
    },

    getAttributeValue(key: string, def = '') {
        const data = getData();
        if (key in data) {
            return data[key].toString();
        }
        return def;
    },

    getMaps(): Group[] {
        return query('data/groups');
    },

};

export default queries;
