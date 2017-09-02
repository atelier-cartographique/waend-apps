
import queries from '../../queries/login';
import events from '../../events/login';
import { DIV, INPUT, BUTTON } from '../elements';


export type Mode = 'login' | 'register';

export interface LoginState {
    mode: Mode;
    username: string;
    password: string;
}

export const defaultLoginState =
    (): LoginState => ({
        mode: 'login',
        username: '',
        password: '',
    });


const opposite =
    (m: Mode): Mode => {
        switch (m) {
            case 'login': return 'register';
            case 'register': return 'login';
        }
    }

const toggleMode =
    () => events.setMode(opposite(queries.getMode()));

const handler =
    (m: Mode) => () => {
        const un = queries.getUsername();
        const pw = queries.getPassword();
        switch (m) {
            case 'login':
                events.login(un, pw);
                break;
            case 'register':
                events.register(un, pw);
                break;
        }
    };

const label =
    (m: Mode) => {
        switch (m) {
            case 'login': return 'Login';
            case 'register': return 'Register';
        }
    };

const render =
    () => (
        DIV({ className: 'login' },
            DIV({ onClick: toggleMode }, `switch to ${label(opposite(queries.getMode()))}`),
            DIV({}, INPUT({
                type: 'text',
                placeholder: 'username',
                onChange(e) {
                    events.updateName(e.target.value);
                },
            })),
            DIV({}, INPUT({
                type: 'password',
                placeholder: 'password',
                onChange(e) {
                    events.updatePassword(e.target.value);
                },
            })),
            DIV({}, BUTTON({
                onClick: handler(queries.getMode()),
            }, label(queries.getMode()))))
    );

export default render;
