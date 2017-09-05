
import { query } from './index';
import { Group } from 'waend/lib';



const queries = {
    getUserName() {
        return (
            query('component/user')
                .reduce((acc, t) => t.key === 'name' ? t.value : acc, 'No Name'));
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
