import * as iots from 'io-ts';

export const i = iots.interface;
export const u = iots.union;
export const l = iots.literal;
export const a = iots.array;
export const t = iots.tuple;
export const p = iots.partial;
export type TypeOf<RT extends iots.Any> = iots.TypeOf<RT>;

// tslint:disable-next-line:variable-name
export const MessageRecordIO = iots.intersection([
    i({
        fr: iots.string,
        nl: iots.string,
    }),
    p({
        parameters: iots.dictionary(iots.string, iots.any),
    }),
]);

export type MessageRecord = iots.TypeOf<typeof MessageRecordIO>;


