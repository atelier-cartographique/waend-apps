
import * as debug from 'debug';
import { CANVAS } from '../elements';
import { getOverlayData, getOverlayState, isOverlayDirty } from '../../queries/map';
import { overlayId, makeOverlayClean } from '../../events/map';
import Renderer from 'waend/map/Renderer';
import { Option, none, some } from 'fp-ts/lib/Option';
import { getRect } from 'waend/map/queries';

const logger = debug('waend:comp/map/overlay')

export const defaultOverlayData = () => ({
    layers: [{
        id: overlayId,
        features: [],
    }],
});


const render =
    () => {
        let r: Option<Renderer> = none;

        const renderOverlay =
            () => r.map((renderer) => {
                if (isOverlayDirty()) {
                    logger(`renderOverlay`);
                    renderer.render();
                    makeOverlayClean();
                }
            });

        const attach = (node: HTMLCanvasElement | null) => {
            if (node) {
                const ctx = node.getContext('2d');
                if (ctx) {
                    r = some(new Renderer(getOverlayState, getOverlayData, overlayId, ctx));
                }
                renderOverlay();
            }
            else {
                r = none;
            }
        }

        return () => {
            renderOverlay();
            const rect = getRect(getOverlayState());
            return (
                CANVAS({
                    className: 'map-overlay',
                    width: rect.width,
                    height: rect.height,
                    ref: attach,
                }));
        }
    };

export default render;

logger('loaded');
