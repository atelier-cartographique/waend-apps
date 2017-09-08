
import { query } from './index';
import { some, none } from 'fp-ts/lib/Option';


const queries = {

    getUserId() {
        const u = query('app/user');
        return u ? some(u) : none;
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

};

export default queries;
