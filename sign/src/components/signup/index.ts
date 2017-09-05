
import queries from '../../queries/signup';
import events from '../../events/signup';
import authEvents from '../../events/auth';
import appEvents from '../../events/app';
import { DIV, INPUT, BUTTON, H1, SPAN, A, LABEL } from '../elements';



export interface SignUpState {
    name: string;
    username: string;
    password: string;
}

export const defaultSignUpState =
    (): SignUpState => ({
        name: '',
        username: '',
        password: '',
    });




const handler =
    () => {
        const name = queries.getName();
        const un = queries.getUsername();
        const pw = queries.getPassword();

        authEvents.register(name, un, pw);
    };

const gotToSignIn = () => appEvents.setLayout('signin');


const render =
    () => (
        DIV({ className: 'signup' },
            H1({}, 'sign up'),
            DIV({ className: 'form' },
                LABEL({}, 'username'),
                INPUT({
                    type: 'text',
                    onChange(e) {
                        events.updateName(e.target.value);
                    },
                }),
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
                    'Get started'
                )
            ),
            SPAN({},
                'Alreday have an account ? ',
                A({ onClick: gotToSignIn, href: '#' }, 'Sign in to Wænd'),
            )
        )
    );

export default render;
