import { DIV, H1, A, INPUT } from '../elements';
import events from '../../events/app';
import queries from '../../queries/app';
// import { getMapName } from '../../queries/map';
import mapViewFunction from '../map';
import mode from './mode';
import select from '../select';
import trace from '../trace';
import importComp from '../import';
import info from '../info';


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


const headerTitle = () => DIV({ className: 'header-title' }, 'Wænd - simple map editor');
const dashboardLink = () => A({ href: '../dashboard/' }, 'my dasboard');
const waendLink = () => A({ href: 'http://waend.com', target: '_blank' }, 'wænd.com');


const header =
    () => DIV({
        className: 'header',
    }, headerTitle(), dashboardLink(), waendLink());

const mapView = mapViewFunction();

const sidebar =
    (child: React.ReactNode) => DIV({
        className: 'sidebar',
    }, child);

const renderInfo =
    () => DIV({}, header(), mode(), mapView(), sidebar(info()));
const renderSelect =
    () => DIV({}, header(), mode(), mapView(), sidebar(select()));
const renderTrace =
    () => DIV({}, header(), mode(), mapView(), sidebar(trace()));
const renderImport =
    () => DIV({}, header(), mode(), mapView(), sidebar(importComp()));

const renderWithMap =
    () => {
        switch (queries.getMode()) {
            case 'base': return renderInfo();
            case 'select': return renderSelect();
            case 'trace.line':
            case 'trace.polygon': return renderTrace();
            case 'import': return renderImport();
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
