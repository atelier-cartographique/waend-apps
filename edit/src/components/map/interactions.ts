import { DIV } from '../elements';
import { bufferExtent } from '../../events/map';


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
        zoomIn());


export default render;
