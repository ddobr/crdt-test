export const JsonType = {

    string: 'string',
    number: 'number',
    boolean: 'boolean',

    array: 'array',
    object: 'object',

    /** optional */
    null: 'null',
    /** optional */
    integer: 'integer',
} as const;

export type AllJsonTypes = (typeof JsonType)[keyof (typeof JsonType)];
export type CommonJsonTypes = Exclude<AllJsonTypes, 'null' | 'integer'>
