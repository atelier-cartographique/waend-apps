import * as debug from 'debug';
import { DIV, INPUT, BUTTON } from '../elements';
import {
    getFeatureById,
    getSelectedUnder,
    isFeatureSelected,
} from '../../queries/map';
import { getInputValue } from '../../queries/input';
import { setInputValue } from '../../events/input';
import events from '../../events/app';
import { fromPredicate } from 'fp-ts/lib/Option';
import { addToSelection, removeFromSelection } from '../../events/map';

const logger = debug('waend:comp/select');

const renderItemDetail =
    (selected: boolean) =>
        (id: string, name: string) => {

            const setName =
                () =>
                    getFeatureById(id)
                        .map(f =>
                            getInputValue(`${id}.name`)
                                .map(v =>
                                    events.updateFeature({
                                        ...f,
                                        properties: { ...f.properties, name: v },
                                    }),
                            ),
                    );


            const action = selected ?
                () => removeFromSelection(id) :
                () => addToSelection(id);
            if (name === id) {
                return (
                    DIV({ key: id },
                        INPUT({
                            type: 'checkbox',
                            checked: selected,
                            onClick: action,
                        }),
                        INPUT({
                            type: 'text',
                            placeholder: id,
                            value: getInputValue(`${id}.name`).fold(() => '', v => v),
                            onChange: e => setInputValue(`${id}.name`, e.target.value),
                        }),
                        BUTTON({ onClick: setName }, 'update name')));
            }
            return (
                DIV({ key: id },
                    INPUT({
                        type: 'checkbox',
                        checked: selected,
                        onClick: action,
                    }),
                    INPUT({
                        type: 'text',
                        value: getInputValue(`${id}.name`).fold(() => name, v => v),
                        onChange: e => setInputValue(`${id}.name`, e.target.value),
                    }),
                    BUTTON({ onClick: setName }, 'update name')));
        };
const renderSelected = renderItemDetail(true);
const renderNotSelected = renderItemDetail(false);

const renderItem =
    (id: string) =>
        getFeatureById(id).fold(
            () => null,
            (feature) => {
                const id: string = feature.id;
                const props = feature.properties;
                const name: string = 'name' in props ? props.name : id;

                return fromPredicate<string>(a => isFeatureSelected(a))(id)
                    .fold(
                    () => renderNotSelected(id, name),
                    () => renderSelected(id, name),
                );
            },
        );

const filterNotNull =
    <T>(a: (T | null)[]): T[] => {
        const r: T[] = [];
        a.forEach(i => { if (i) r.push(i); });
        return r;
    };

const render =
    () => {
        const items = filterNotNull(getSelectedUnder().map(renderItem).filter(i => i !== null));
        return DIV({}, ...items);
    };

export default render;

logger('loaded');
