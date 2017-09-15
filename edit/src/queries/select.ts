
import { query } from './index';
import { overlayData } from '../components/map/overlay';
import { getFeatureById } from './map';

const isIdIn =
    (base: string[]) =>
        (id: string) => base.indexOf(id) >= 0;

const notIdIn =
    (base: string[]) =>
        (id: string) => base.indexOf(id) === -1;

export const getSelectedUnder =
    () => query('component/select').selectedUnder;

export const getSelection =
    () => query('component/select').selection;

export const isFeatureSelected =
    (id: string) => isIdIn(query('component/select').selection)(id);



interface StyleOnlyProps {
    style: {
        strokeStyle: string;
        strokeWidth: number;
    };
}

const underProps: StyleOnlyProps = {
    style: {
        strokeStyle: 'red',
        strokeWidth: 3,
    },
};

const selectProps: StyleOnlyProps = {
    style: {
        strokeStyle: 'blue',
        strokeWidth: 3,
    },
};


const getFeature =
    (sop: StyleOnlyProps) =>
        (id: string) =>
            getFeatureById(id).map(f => ({ ...f, properties: sop }));

const getUnderOnly =
    () => getSelectedUnder().filter(notIdIn(getSelection()));

export const getSelectionGroup =
    () => overlayData(
        getUnderOnly()
            .map(getFeature(underProps))
            .concat(
            getSelection()
                .map(getFeature(selectProps)))
            .reduce((acc, o) => o.fold(
                () => acc,
                f => acc.concat([f])), [] as any[])
    );
