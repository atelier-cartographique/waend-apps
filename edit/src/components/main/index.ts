import { DIV, H1 } from '../elements';
import events from '../../events/app';
import queries from '../../queries/app';
import { Model } from 'waend/lib';


const renderNew =
    () => {
        return DIV({},
            H1({}, 'Creating New Map'));
    };

const renderNoMap =
    () => {
        return (
            queries.getNew()
                .fold(
                () => DIV({}, '???'),
                (s) => {
                    switch (s) {
                        case 'initial':
                            events.createMap();
                            return DIV({}, 'init');
                        case 'processing': return renderNew();
                        case 'done': return DIV({}, 'done');
                        case 'failed': return DIV({}, 'failed');
                    }
                })
        );
    };

const renderMap =
    (map: Model) => {
        return (
            DIV({},
                `:: ${(<Model>map).get('name', '--')} ::`,
                DIV({
                    onClick: () => events.setLayout('import'),
                }, 'IMPORT'))
        );
    };


const render =
    () => {
        return (
            queries.getMap()
                .fold(
                renderNoMap,
                renderMap));
    };

export default render;
