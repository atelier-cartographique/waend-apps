
import { Position } from '../../source/io/geojson';
import { getMode, isNew, isPolygon } from '../../queries/trace';
import { setMode } from '../../events/trace';
import { DIV, BUTTON } from '../elements';
import { fromPredicate } from 'fp-ts/lib/Option';

export type TraceStateType = 'LineString' | 'Polygon';
export type TraceStateMode = 'add' | 'insert' | 'delete' | 'move';
export interface TraceState {
    type: TraceStateType;
    mode: TraceStateMode;
    featureId: string | null;
    coordinates: Position[];
}

export const defaultTraceState =
    (): TraceState => ({
        type: 'LineString',
        mode: 'add',
        featureId: null,
        coordinates: [],
    });

// tslint:disable-next-line:variable-name
const ModeOption = fromPredicate((m: TraceStateMode) => getMode() === m);

const renderAction =
    (m: TraceStateMode) =>
        ModeOption(m)
            .fold(
            () => BUTTON({
                className: 'interactive',
                onClick: () => setMode(m),
            }, ` ${m} `),
            () => BUTTON({
                className: 'active',
            }, ` ${m} `));

const actions =
    () => {
        if (isNew()) {
            return ['add', 'insert', 'delete', 'move'];
        }
        return (
            isPolygon()
                .fold(
                () => ['add', 'insert', 'delete', 'move'],
                () => ['insert', 'delete', 'move'],
            ));
    }

const renderActions =
    () => actions().map(renderAction);

const render =
    () => DIV({}, ...renderActions());

export default render;
