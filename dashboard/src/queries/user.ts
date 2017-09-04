
import { query } from './index';
import { Group, ModelProperties } from 'waend/lib';

const getData =
    (): ModelProperties => {
        const user = query('data/user');
        if (user) {
            return user.getProperties();
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

    getAttributes() {
        return query('component/user').slice(0, -1);
    },

    getNewAttribute() {
        return query('component/user').slice(-1)[0];
    },

    getAttributeKeys() {
        return query('component/user').slice(0, -1).map(t => t.key);
    },

    getMaps(): Group[] {
        return query('data/groups');
    },

};

export default queries;
