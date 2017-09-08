
import { query } from './index';
import { fromNullable } from 'fp-ts/lib/Option';


const queries = {

    getArgs() {
        return query('app/args');
    },

    getUserId() {
        return fromNullable(query('app/user'));
    },

    getLayout() {
        return query('app/layout');
    },

    getTitle() {
        const title = query('app/title');
        const user = query('data/user');
        if (user) {
            const userData = user.getProperties();
            return `${title} - ${userData.name}`;
        }
        return title;
    },

    getMapId() {
        return fromNullable(query('app/mapId'));
    },

};

export default queries;
