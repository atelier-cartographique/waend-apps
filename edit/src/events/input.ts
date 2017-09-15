import { dispatchK } from './index';

const input = dispatchK('component/input');

export const setInputValue =
    (k: string, v: string | number) => input(s => ({ ...s, [k]: v }));
