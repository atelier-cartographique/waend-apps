import { query } from './index';
import { overlayData } from '../components/map/overlay';



export const getPendingFeatures =
    () => query('component/import').pendingFeatures;

export const getImportMode =
    () => query('component/import').mode;


export const getImportGroup =
    () => overlayData([]);


export const getMapsInView =
    () => query('component/import').mapsInViewPort;