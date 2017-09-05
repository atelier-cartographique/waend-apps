
import { query } from './index';


const queries = {
    getUsername() {
        return query('component/signin').username;
    },

    getPassword() {
        return query('component/signin').password;
    },

};

export default queries;
