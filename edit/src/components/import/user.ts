import { DIV, INPUT, BUTTON } from '../elements';
import { updatePendingFeatures } from '../../events/import';
import { getPendingFeatures } from '../../queries/import';



const render =
    () => (
        DIV({},
            INPUT({
                type: 'file',
                onChange: e => updatePendingFeatures(e.target.files),
            }),
            DIV({}, `${getPendingFeatures().length} to be imported.`),
            BUTTON({}, 'Import'))
    );

export default render;
