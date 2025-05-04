import { CommonJsonTypes } from "./json-type.type";

export interface IStoredJsonSchema {
    type: CommonJsonTypes,

    title?: string,
    description?: string,
    required?: string[]

    /** type === JsonType.array */
    items?: IStoredJsonSchema;
    /** type === JsonType.object */
    properties?: IKeyed<IStoredJsonSchema>[];
}

export interface IKeyed<T> {
    key: string,
    value: T
}
