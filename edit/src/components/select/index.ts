import * as debug from 'debug';
import { DIV, INPUT, BUTTON } from '../elements';
import {
    getSelectedUnder,
    isFeatureSelected,
} from '../../queries/select';
import { getInputValue } from '../../queries/input';
import { setInputValue } from '../../events/input';
import events from '../../events/app';
import { fromPredicate } from 'fp-ts/lib/Option';
import {
    addToSelection,
    removeFromSelection,
} from '../../events/select';
import { getFeatureById } from '../../queries/map';

const logger = debug('waend:comp/select');

export interface SelectState {
    selectedUnder: string[];
    selection: string[];
}

export const defaultSelectState =
    (): SelectState => ({
        selectedUnder: [],
        selection: [],
    });

const renderItemDetail =
    (selected: boolean) =>
        (id: string, name: string) => {
            const titleSelect = selected ? 'selected' : 'select';
            const checked = selected ? 'btn-feature-select checked' : 'btn-feature-select unchecked';
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
                        BUTTON({
                            onClick: action,
                            className: checked,
                            title: titleSelect,
                        }, '•'),
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
                    BUTTON({
                        onClick: action,
                        className: checked,
                        title: titleSelect,
                    }, '•'),
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

const selectedItems =
    () => {
        const items = filterNotNull(getSelectedUnder().map(renderItem).filter(i => i !== null));
        return DIV({
            className: 'selecteditems'
        }, ...items);
    };

const styleTools =
    () =>
        DIV({
            className: 'styletools',
        }, 'here will be the style tools');

const render =
    () => {

        return DIV({}, selectedItems(), styleTools());
    };

export default render;

logger('loaded');
