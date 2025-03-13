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

export type TypeofAllJsonTypes = (typeof JsonType)[keyof (typeof JsonType)];
export type TypeofBaseJsonTypes = Exclude<TypeofAllJsonTypes, 'null' | 'integer'>
