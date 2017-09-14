import { DIV, H1 } from '../elements';
import events from '../../events/app';
import queries from '../../queries/app';
import { getMapName } from '../../queries/map';
import mapViewFunction from '../map';


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

const mapView = mapViewFunction();

const renderMap =
    () => {
        return (
            DIV({},
                `:: ${getMapName()} ::`,
                DIV({
                    onClick: () => events.setMode('base'),
                }, 'BASE'),
                DIV({
                    onClick: () => events.setLayout('import'),
                }, 'IMPORT'),
                DIV({
                    onClick: () => events.setMode('select'),
                }, 'SELECT'),
                mapView(),
            )
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
