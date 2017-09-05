
import { query } from './index';


const queries = {
    getName() {
        return query('component/signup').name;
    },

    getUsername() {
        return query('component/signup').username;
    },

    getPassword() {
        return query('component/signup').password;
    },

};

export default queries;
