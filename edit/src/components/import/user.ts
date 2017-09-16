import { DIV, INPUT, BUTTON, A } from '../elements';
import { updatePendingFeatures, importPendingFeatures } from '../../events/import';
import { getPendingFeatures } from '../../queries/import';


const header =
    () => DIV({
        className:'header',
    }, A({
        href:'../dashboard/',
    }, 'dasboard'));

const sidebar =
    () => DIV({
        className:'sidebar',
    }, selectFile());

const selectFile =
    () => DIV({},
        INPUT({
            type: 'file',
            onChange: e => updatePendingFeatures(e.target.files),
        }),
        DIV({}, `${getPendingFeatures().length} to be imported.`),
        BUTTON({
            onClick: () => importPendingFeatures(),
        }, 'Import'),
        BUTTON({
            onClick: () => importPendingFeatures(),
            className: 'cancel',
        }, 'Cancel'));

const render =
    () => (DIV({},
        header(),
        sidebar(),
    ));

export default render;
