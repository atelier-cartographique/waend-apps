
import queries from '../../queries/signin';
import events from '../../events/signin';
import authEvents from '../../events/auth';
import appEvents from '../../events/app';
import { DIV, INPUT, BUTTON, H1, A, SPAN, LABEL } from '../elements';


export interface SignInState {
    username: string;
    password: string;
}

export const defaultSignInState =
    (): SignInState => ({
        username: '',
        password: '',
    });


const handler =
    () => {
        const un = queries.getUsername();
        const pw = queries.getPassword();
        authEvents.login(un, pw);
    };

const gotToSignUp = () => appEvents.setLayout('signup');

const render =
    () => (
        DIV({ className: 'signin' },
            H1({}, 'sign in'),
            DIV({ className: 'form' },
                LABEL({}, 'e-mail'),
                INPUT({
                    type: 'email',
                    onChange(e) {
                        events.updateUsername(e.target.value);
                    },
                }),
                LABEL({}, 'password'),
                INPUT({
                    type: 'password',
                    onChange(e) {
                        events.updatePassword(e.target.value);
                    },
                }),
                BUTTON({
                    onClick: handler,
                    className: 'validate',
                },
                    'Sign in')
            ),
            SPAN({},
                'Don\'t have an account ? ',
                A({ onClick: gotToSignUp, href: '#' }, 'sign up for Wænd'), ))
    );

export default render;

