import { DIV, INPUT, BUTTON } from '../elements';
import { updatePendingFeatures, importPendingFeatures } from '../../events/import';
import { getPendingFeatures } from '../../queries/import';



const render =
    () => (
        DIV({},
            INPUT({
                type: 'file',
                onChange: e => updatePendingFeatures(e.target.files),
            }),
            DIV({}, `${getPendingFeatures().length} to be imported.`),
            BUTTON({
                onClick: () => importPendingFeatures(),
            }, 'Import'))
    );

export default render;
