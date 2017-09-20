import * as debug from 'debug';
import { DIV, BUTTON, INPUT } from '../elements';
import { getInputValue } from '../../queries/input';
import { setInputValue } from '../../events/input';
import appEvents from '../../events/app';
import appQueries from '../../queries/app';

const logger = debug('waend:comp/info');

const tagsToString =
    (tags: string[]) => tags.join(',');
const stringToTags =
    (tags: string) => tags.split(',').map(s => s.trim());

const mapName =
    () => appQueries.getMapProperties().fold(
        () => '',
        props => 'name' in props ? props.name : '',
    );
const mapTags =
    () => appQueries.getMapProperties().fold(
        () => '',
        props => 'tags' in props ? tagsToString(props.tags) : '',
    );

const save =
    () => DIV({},
        BUTTON({
            onClick: () => {
                const name = getInputValue('map.name').fold(
                    () => mapName(),
                    n => n as string,
                );
                const tags = getInputValue('map.tags').fold(
                    () => stringToTags(mapTags()),
                    stringToTags,
                );

                appEvents.updateMap({ name, tags });
            },
        }, 'save'))

const name =
    () => DIV({},
        DIV({}, 'Title'),
        INPUT({
            type: 'text',
            value: getInputValue(`map.name`).fold(() => mapName(), v => v),
            onChange: e => setInputValue(`map.name`, e.target.value),
        }));

const tags =
    () => DIV({},
        DIV({}, 'Tags'),
        INPUT({
            type: 'text',
            placeholder: 'comma separated list',
            value: getInputValue(`map.tags`).fold(() => mapTags(), v => v),
            onChange: e => setInputValue(`map.tags`, e.target.value),
        }));

const render =
    () => DIV({ className: 'info' },
        name(),
        tags(),
        save(),
    );


export default render;

logger('loaded');
