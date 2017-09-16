import { DIV, H1, A } from '../elements';
import events from '../../events/app';
import queries from '../../queries/app';
// import { getMapName } from '../../queries/map';
import mapViewFunction from '../map';
import mode from './mode';
import select from '../select';
import trace from '../trace';


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

const header =
    () => DIV({
        className:'header',
    }, A({
        href:'../dashboard/',
    }, 'dasboard'));

const mapView = mapViewFunction();

const sidebar =
(child:React.ReactNode) => DIV({
    className:'sidebar',
}, child);

const renderSelect =
    () => DIV({}, header(), mode(), mapView(), sidebar(select()));
const renderTrace =
    () => DIV({}, header(), mode(), mapView(), sidebar(trace()));

const renderWithMap =
    () => {
        switch (queries.getMode()) {
            case 'base':
            case 'select': return renderSelect();
            case 'trace': return renderTrace();
        }
        // return (
        //     DIV({},
        //         `:: ${getMapName()} ::`,
        //         DIV({
        //             onClick: () => events.setMode('base'),
        //         }, 'BASE'),
        //         DIV({
        //             onClick: () => events.setLayout('import'),
        //         }, 'IMPORT'),
        //         DIV({
        //             onClick: () => events.setMode('select'),
        //         }, 'SELECT'),
        //         mapView(),
        //     )
        // );
    };

const render =
    () => {
        return (
            queries.getMap()
                .fold(
                renderNoMap,
                renderWithMap));
    };

export default render;
