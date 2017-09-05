
import { query } from './index';
import { Group } from 'waend/lib';
import { UserDataTuple } from "src/components/user";


const attributes = (as: UserDataTuple[]) => as.slice(0, -1).filter(t => t.value !== null);

const queries = {
    getUserName() {
        return (
            query('component/user')
                .reduce((acc, t) => t.key === 'name' ? t.value : acc, 'No Name'));
    },

    getAttributes() {
        return attributes(query('component/user'));
    },

    getNewAttribute() {
        return [{
            key: '',
            value: '',
            editing: false,
        }].concat(query('component/user')).slice(-1).pop();
    },

    getAttributeKeys() {
        return attributes(query('component/user')).map(t => t.key);
    },

    getMaps(): Group[] {
        return query('data/groups');
    },

};

export default queries;
