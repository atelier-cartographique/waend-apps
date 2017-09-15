
import * as debug from 'debug';
import { CANVAS } from '../elements';
import queries from '../../queries/app';
import { getOverlayState, isOverlayDirty } from '../../queries/map';
import { overlayId, markOverlayClean } from '../../events/map';
import Renderer from 'waend/map/Renderer';
import { Option, none, some } from 'fp-ts/lib/Option';
import { getRect } from 'waend/map/queries';
import { getSelectionGroup } from '../../queries/select';
import { getTraceGroup } from '../../queries/trace';

const logger = debug('waend:comp/map/overlay');

export const overlayData =
    (features: any[]) => ({
        layers: [{
            id: overlayId,
            features,
        }],
    });

const getData =
    () => {
        const mode = queries.getMode();
        switch (mode) {
            case 'base': return overlayData([]);
            case 'select': return getSelectionGroup();
            case 'trace': return getTraceGroup();
        }
    };

const render =
    () => {
        let r: Option<Renderer> = none;

        const renderOverlay =
            () => r.map((renderer) => {
                if (isOverlayDirty()) {
                    logger(`renderOverlay`);
                    renderer.render();
                    markOverlayClean();
                }
            });

        const attach = (node: HTMLCanvasElement | null) => {
            if (node) {
                const ctx = node.getContext('2d');
                if (ctx) {
                    r = some(new Renderer(
                        getOverlayState,
                        getData,
                        overlayId,
                        ctx,
                    ));
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
        };
    };

export default render;

logger('loaded');
