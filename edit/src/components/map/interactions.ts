import { DIV } from '../elements';
import { bufferExtent, zoomToMapExtent } from '../../events/map';

const zoomToExtent =
    () => DIV({
        className: 'zoom-extent',
        onClick: () => {
            zoomToMapExtent();
        },
    }, 'z');

const zoomIn =
    () => DIV({
        className: 'zoom-in',
        onClick: () => {
            bufferExtent(-0.1);
        },
    }, '+');

const render =
    () => DIV({
        className: 'map-interactions',
    },
        zoomIn(),
        zoomToExtent(),
    );


export default render;
