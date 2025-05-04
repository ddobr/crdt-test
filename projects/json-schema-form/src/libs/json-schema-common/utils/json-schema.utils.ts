import { JsonSchema } from "../public-api";
import { IStoredJsonSchema } from "../types/stored-json-schema.type";
import { z } from 'zod';

/** validate object schema */
const schemaOfObject = z.object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.lazy(() => schemaOfJsonSchema))
}).required();
/** validate array schema */
const schemaOfArray = z.object({
    type: z.literal('array'),
    items: z.lazy(() => schemaOfJsonSchema)
}).required();
/** validate primitive's schema */
const schemaOfPrimitive = z.object({
    type: z.enum([
        'string',
        'number',
        'boolean',
    ]),
}).required();
/** validate schema's metadata */
const schemaOfMetadata = z.object({
    title: z.string(),
    description: z.string()
})

/** schema for {@link JsonSchema} */
const schemaOfJsonSchema: z.ZodType<JsonSchema> = z.union([
    z.discriminatedUnion('type', [
        schemaOfObject,
        schemaOfArray,
    ]),
    schemaOfPrimitive,
]).and(schemaOfMetadata);

/** basic type checking function for {@link JsonSchema} */
export function isValidJsonSchema(value: unknown): value is IStoredJsonSchema {
    return schemaOfJsonSchema.safeParse(value).success;
}


