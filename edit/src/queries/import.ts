import { query } from './index';



export const getPendingFeatures =
    () => query('component/import').pendingFeatures;

export const getImportMode =
    () => query('component/import').mode;
