import * as debug from 'debug';
import { DIV } from '../elements'
import {
    getFeatureById,
    getSelectedUnder,
    isFeatureSelected,
} from '../../queries/map';
import { fromPredicate } from 'fp-ts/lib/Option';
import { addToSelection, removeFromSelection } from '../../events/map';

const logger = debug('waend:comp/select');

const renderItem =
    (id: string) =>
        getFeatureById(id).fold(
            () => null,
            (feature) => {
                const id: string = feature.id;
                const props = feature.properties;
                const name: string = 'name' in props ? props.name : id;
                // logger(`${id} ${isFeatureSelected(id)}`);
                return fromPredicate<string>(a => isFeatureSelected(a))(id)
                    .fold(
                    () => DIV({
                        className: 'interactive',
                        onClick: () => addToSelection(id),
                    }, name),
                    () => DIV({
                        className: 'interactive selected',
                        onClick: () => removeFromSelection(id),
                    }, name),
                )
            }
        );

const filterNotNull =
    <T>(a: (T | null)[]): T[] => {
        const r: T[] = [];
        a.forEach(i => { if (i) r.push(i) });
        return r;
    };

const render =
    () => {
        const items = filterNotNull(getSelectedUnder().map(renderItem).filter(i => i !== null));
        return DIV({}, ...items);
    };

export default render;

logger('loaded')