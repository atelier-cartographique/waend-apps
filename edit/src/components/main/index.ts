import { DIV, H1 } from '../elements';
import events from '../../events/app';
import queries from '../../queries/app';


const render =
    () => {
        return (
            queries.getMapId()
                .fold(
                () => DIV({}, H1({
                    onClick: () => events.setLayout('import'),
                }, 'Waend Map Editor')),
                (mapId) => {
                    return DIV({}, `Got an id ${mapId}`);
                }));
    };

export default render;
