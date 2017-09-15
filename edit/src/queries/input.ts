import { query } from './index';
import { fromNullable } from 'fp-ts/lib/Option';

export const getInputValue =
    (k: string) => fromNullable(query('component/input')[k]);
