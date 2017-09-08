import { dispatch } from './index';
import * as Promise from 'bluebird';
import * as io from 'io-ts';
import { FeatureCollectionIO, FeatureCollection, Feature } from '../source/io/geojson';


const stringify = (value: any): string => {
    return typeof value === 'function' ? io.getFunctionName(value) : JSON.stringify(value);
};

const getContextPath = (context: io.Context): string => {
    return context.map(({ key, type }) => `${key}: ${type.name}`).join('/');
};

const getMessage = (value: any, context: io.Context): string => {
    return `Invalid value ${stringify(value)} supplied to ${getContextPath(context)}`;
};


const onValidationError =
    <T>(ioType: io.Type<T>) =>
        (reject: (a: any) => void) =>
            (errors: io.ValidationError[]) => {
                const msg = errors.map(e => getMessage(e.value, e.context));
                console.group(`Validation Failed: ${ioType.name}`);
                msg.forEach(m => console.log(m));
                console.groupEnd();
                reject(new Error(`${ioType.name} failed validation`));
            };



const readFeatures =
    (f: File): Promise<FeatureCollection> => (
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const geojsonString = reader.result;
                try {
                    JSON.parse(geojsonString);
                }
                catch (err) {
                    return reject(err);
                }

                FeatureCollectionIO
                    .validate(JSON.parse(geojsonString), [])
                    .fold(onValidationError(FeatureCollectionIO)(reject), resolve);
            });
            reader.readAsText(f);
        }));


const getFeatureList =
    (fs: FileList) => {
        const len = fs.length;
        const collections: Promise<FeatureCollection>[] = [];
        for (let i = 0; i < len; i += 1) {
            collections.push(readFeatures(fs.item(i)));
        }
        return Promise.reduce(
            collections,
            (acc, col) => acc.concat(col.features),
            <Feature[]>[],
        );
    };


export const updatePendingFeatures =
    (fs: FileList | null) => {
        if (fs) {
            dispatch('component/import', state => ({ ...state, userImport: 'validating' }));
            getFeatureList(fs)
                .then((features) => {
                    dispatch('component/import', state => ({
                        ...state,
                        pendingFeatures: features,
                        userImport: 'validated',
                    }));
                })
                .catch(() => dispatch('component/import', state => ({
                    ...state,
                    pendingFeatures: [],
                    userImport: 'validated',
                })));
        }
    };
