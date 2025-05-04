/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { type JsonType } from './json-type.type';

/**
 * @see {@link https://www.learnjsonschema.com/}
 * @see {@link https://json-schema.org/understanding-json-schema/keywords}
 * @see {@link https://json-schema.org/draft/2020-12/json-schema-core}
 * @see {@link https://json-schema.org/draft/2020-12/json-schema-validation}
 */
export type JsonSchema = JsonSchemaMetadata & (PrimitiveJsonSchema | ArrayJsonSchema | ObjectJsonSchema);

export type PrimitiveJsonSchema = {
    type: typeof JsonType.string | typeof JsonType.number | typeof JsonType.boolean;
}

export type ArrayJsonSchema = {
    type: typeof JsonType.array,
    items?: JsonSchema,
}

export type ObjectJsonSchema = {
    type: typeof JsonType.object,
    properties?: Record<string, JsonSchema>,
    required?: string[]
}

export type JsonSchemaMetadata = {
    title?: string,
    description?: string,
}
