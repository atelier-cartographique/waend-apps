
import { query } from './index';


const queries = {

    getUserId() {
        return query('app/user');
    },

    getLayout() {
        return query('app/layout');
    },

    getTitle() {
        const title = query('app/title');
        const user = query('data/user');
        if (user) {
            const userData = user.getData();
            return `${title} - ${userData.name}`;
        }
        return title;
    },

};

export default queries;
