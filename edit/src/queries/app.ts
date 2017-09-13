
import * as debug from 'debug';
import { query } from './index';
import { fromNullable, none, some } from 'fp-ts/lib/Option';
import { } from 'fp-ts/lib/Either';
import { Model } from 'waend/lib';

const logger = debug('waend:queries/app');

const queries = {

    getArgs() {
        return query('app/args');
    },

    getUserId() {
        return fromNullable(query('app/user'));
    },

    getLayout() {
        return query('app/layout');
    },

    getTitle() {
        const title = query('app/title');
        const user = query('data/user');
        if (user) {
            const userData = user.getProperties();
            return `${title} - ${userData.name}`;
        }
        return title;
    },

    getMapId() {
        return fromNullable(query('app/mapId'));
    },

    getCurrentLayer() {
        const layerIndex = query('app/layerIndex');
        logger('getCurrentLayer layerIndex', layerIndex);
        return (
            queries.getMap()
                .fold(() => none, (map) => {
                    logger(`getCurrentLayer map ${layerIndex}`, map);
                    const layers = map.layers;
                    return (
                        layerIndex >= 0 && layerIndex < layers.length ?
                            some(layers[layerIndex] as Model) :
                            none);
                }));
    },

    getMap() {
        return fromNullable(query('data/map'));
    },

    getNew() {
        return fromNullable(query('app/new'));
    },

};

export default queries;


logger('loaded');
