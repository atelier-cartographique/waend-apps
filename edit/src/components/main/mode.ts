import { DIV, SPAN } from '../elements';
import events from '../../events/app';
import queries from '../../queries/app';
import { AppMode } from '../../shape';
import { fromPredicate } from 'fp-ts/lib/Option';


const renderMode =
    (m: AppMode, label: string) =>
        fromPredicate(pm => pm === m)(queries.getMode())
            .fold(
            () => SPAN({
                onClick: () => events.setMode(m),
            }, label),
            () => SPAN({
                className: 'active',
            }, label),
        );

type Arg = [AppMode, string];
const argList: Arg[] = [
    ['base', 'Info'],
    ['select', 'Select'],
    ['trace.line', 'Line'],
    ['trace.polygon', 'Polygon'],
    ['import', 'Import'],
];

const modes =
    () => argList.map(t => renderMode(t[0], t[1]));


const render =
    () => DIV({ className: 'mode' }, ...modes());

export default render;
