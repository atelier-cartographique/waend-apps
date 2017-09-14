import { DIV, SPAN } from '../elements';
import events from '../../events/app';
import queries from '../../queries/app';
import { AppMode } from '../../shape';
import { fromPredicate } from 'fp-ts/lib/Option';

const renderMode =
    (m: AppMode) =>
        fromPredicate(pm => pm === m)(queries.getMode())
            .fold(
            () => SPAN({
                onClick: () => events.setMode(m),
            }, m),
            () => SPAN({
                className: 'active',
            }, m),
        );

const modes =
    () => ['base', 'select'].map(renderMode);

const render =
    () => DIV({ className: 'mode' }, ...modes());

export default render;
