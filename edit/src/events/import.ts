
import * as debug from 'debug';
import { dispatch, observe } from './index';
import appQueries from '../queries/app';
import appEvents from './app';
import * as Promise from 'bluebird';
import * as io from 'io-ts';
import {
    Position,
    FeatureCollectionIO,
    FeatureCollection,
    Feature as GeoJSONFeature,
    DirectGeometryObject,
} from '../source/io/geojson';
import { UserFileImportState, ImportMode, defaultImportState } from '../components/import';
import { getBinder, Transport } from 'waend/shell';
import { isDirectGeometry, ModelData, getconfig, Extent } from 'waend/lib';
import { getPendingFeatures, mkPolygonGeometry, getOriginalMapId } from '../queries/import';
import { tail } from 'fp-ts/lib/Array';
import { zoomToMapExtent, markOverlayDirty } from './map';
import { getGeoExtent } from 'waend/map/queries';
import { getState, getFeatureById } from '../queries/map';

const logger = debug('waend:events/import');
const transport = new Transport();

export const resetImport =
    () => appQueries.getMapId().fold(
        () => dispatch('component/import', () => defaultImportState()),
        mapId => dispatch('component/import', () => ({
            ...defaultImportState(),
            originalMapId: mapId,
        })),
    );

export const revertMap =
    () => new Promise((resolve, reject) => {
        const oid = getOriginalMapId();
        if (oid) {
            appQueries.getMapId()
                .fold(
                () => reject(new Error('ImportedWasNull')),
                (mid) => {
                    if (mid !== oid) {
                        appQueries.getUserId()
                            .fold(
                            () => reject(new Error('UserIdWasNull')),
                            uid => resolve(appEvents.loadMap(uid, oid)));
                    }
                });
        }
        else {
            reject(new Error('OriginalWasNull'));
        }
    });

export const setImportMode =
    (mode: ImportMode) => dispatch('component/import', s => ({ ...s, mode }));


const fetchGroupIntersects =
    (apiUrl: string) =>
        (geom: DirectGeometryObject, parse: (a: any) => any) => {
            return (
                transport.post({
                    url: `${apiUrl}/group/intersects/`,
                    body: geom,
                    parse,
                })
            );
        };

const fetchGroupIntersectsFeatures =
    (apiUrl: string) =>
        (gid: string, geom: DirectGeometryObject, parse: (a: any) => any) => {
            return (
                transport.post({
                    url: `${apiUrl}/group/intersects/${gid}/`,
                    body: geom,
                    parse,
                })
            );
        };

export const intersects =
    (geom: DirectGeometryObject) =>
        getconfig('apiUrl')
            .then(fetchGroupIntersects)
            .catch(logger)
            .then(f => f(geom, (a: any) => a));

export const intersectsFeatures =
    (gid: string, geom: DirectGeometryObject) =>
        getconfig('apiUrl')
            .then(fetchGroupIntersectsFeatures)
            .catch(logger)
            .then(f => f(gid, geom, (a: any) => a));


export const loadMapsInview =
    () => {
        if (appQueries.getMode() === 'import') {
            const e = getGeoExtent(getState());
            const p = (new Extent(e)).toPolygon();
            intersects(p.toGeoJSON())
                .then(data =>
                    dispatch('component/import',
                        si => ({ ...si, mapsInViewPort: data })));
        }
    };

observe('component/map', loadMapsInview);

const filterNotNull =
    <T>(a: (T | null)[]): T[] => {
        const r: T[] = [];
        a.forEach(i => { if (i) r.push(i); });
        return r;
    };

const importFeaturesList =
    (pendings: any[]) => {
        const [uid, mid] = [appQueries.getUserId(), appQueries.getMapId()].map((a) => a.fold(() => null, a => a));
        const fs: ModelData[] = [];
        if (uid && mid) {
            appQueries.getCurrentLayer()
                .map((layer) => {
                    Promise.mapSeries(pendings, (f, index) => {
                        logger(`@ ${index}`, f);
                        return (
                            getBinder()
                                .setFeature(uid, mid, layer.id, {
                                    geom: f.geom,
                                    properties: f.properties,
                                    user_id: uid,
                                    layer_id: layer.id,
                                }, true)
                                .then(f => fs.push(f.cloneData()))
                                .then(() => logger(`recorded @ ${index}`, uid, mid, layer.id))
                                .catch(err => logger(`err binder ${err}`))
                        );
                    })
                        .then(() => addFeaturesToMap(fs))
                        .then(zoomToMapExtent)
                        .then(() => appEvents.setMode('select'))
                        .then(() => logger(`END IMPORT`, fs))
                        .catch(err => logger(`err ${err}`));
                });
        }
    }

export const loadFeaturesInPolygon =
    () => {
        if (appQueries.getMode() === 'import') {
            appQueries.getMapId()
                .map(mid =>
                    intersectsFeatures(mid, mkPolygonGeometry())
                        .then((fids) => {
                            const pendings = filterNotNull(
                                fids.map((id: string) =>
                                    getFeatureById(id)
                                        .getOrElse(() => null)));
                            revertMap()
                                .then(() => importFeaturesList(pendings));

                        })
                        .catch(err => logger(`loadFeaturesInPolygon err ${err}`)),
            );
        }
    };


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
            <GeoJSONFeature[]>[],
        );
    };


export const updatePendingFeatures =
    (fs: FileList | null) => {
        if (fs) {
            dispatch('component/import', state => ({ ...state, userImport: 'fileValidating' as UserFileImportState }));
            getFeatureList(fs)
                .then((features) => {
                    dispatch('component/import', state => ({
                        ...state,
                        pendingFeatures: features,
                        userImport: 'fileValidated' as UserFileImportState,
                    }));
                })
                .catch(() => dispatch('component/import', state => ({
                    ...state,
                    pendingFeatures: [],
                    userImport: 'fileValidated' as UserFileImportState,
                })));
        }
    };


const addFeaturesToMap =
    (fs: ModelData[]) => {
        appQueries.getCurrentLayer()
            .map(layer => layer.id)
            .map(lid => dispatch('data/map', (g) => {
                g.layers.forEach((l: any) => {
                    if (l.id === lid) {
                        logger(`concat ${fs.length} features to ${lid}`);
                        l.features = l.features.concat(fs);
                    }
                });
                return g;
            }));
    };

export const importPendingFeatures =
    () => {
        const [uid, mid] = [appQueries.getUserId(), appQueries.getMapId()].map((a) => a.fold(() => null, a => a));
        const fs: ModelData[] = [];
        if (uid && mid) {
            const pendings = getPendingFeatures().slice();
            appQueries.getCurrentLayer()
                .map((layer) => {
                    Promise.mapSeries(pendings, (f, index) => {
                        logger(`@ ${index}`);
                        dispatch('component/import', state => ({
                            ...state,
                            pendingFeatures: tail(state.pendingFeatures).getOrElse(() => { throw (new Error('CouldNotTail')); }),
                        }));
                        const { geometry } = f;
                        if (geometry && isDirectGeometry(geometry)) {
                            return (
                                getBinder()
                                    .setFeature(uid, mid, layer.id, {
                                        user_id: uid,
                                        layer_id: layer.id,
                                        properties: f.properties || {},
                                        geom: geometry,
                                    }, true)
                                    .then(f => fs.push(f.cloneData()))
                            );
                        }
                        return Promise.resolve(fs.length);
                    })
                        .then(() => addFeaturesToMap(fs))
                        .then(zoomToMapExtent)
                        .then(() => appEvents.setMode('select'))
                        .catch(err => logger(`err ${err}`));
                });
        }
    };

export const pushPosition =
    (p: Position) => {
        dispatch('component/import', s => ({ ...s, coordinates: s.coordinates.concat([p]) }));
        markOverlayDirty();
    };

export const pushTag =
    (t: string) => dispatch('component/import', s => ({
        ...s,
        // selectedTags: s.selectedTags.concat([t]),
        selectedTags: [t],
    }));



logger('loaded');
