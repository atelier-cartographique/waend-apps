import queries from '../../queries/user';
import events from '../../events/user';
import { DIV, H1, INPUT, BUTTON, SPAN } from '../elements';
import { UserDataTuple } from "src/components/user";




const addAttribute =
    (t: UserDataTuple) => (
        DIV({ className: 'add-attribute' },
            INPUT({
                value: t.key,
                placeholder: 'key',
                onChange: e => events.updateNewKey(e.target.value),
            }),
            INPUT({
                value: t.value,
                placeholder: 'value',
                onChange: e => events.updateNewValue(e.target.value),
            }),
            BUTTON({
                className: 'add',
                onClick: () => events.createAttribute(),
            }, '+'),
        ));



const render =
    () => {
        const kv = queries.getAttributes().map((t) => {
            return DIV({},
                SPAN({}, t.key),
                INPUT({
                    value: t.value,
                    onChange: (e) => {
                        events.updateKV(t.key, e.target.value);
                    },
                    onBlur: () => events.setUserValue(t.key)
                }),
                BUTTON({
                    className: 'remove',
                    onClick: () => events.deleteKey(t.key),
                }, '-'));
        });
        return (
            DIV({ className: 'user' },
                H1({}, queries.getUserName()),
                DIV({ className: 'attributes' }, ...kv),
                addAttribute(queries.getNewAttribute()))
        );
    };

export default render;
