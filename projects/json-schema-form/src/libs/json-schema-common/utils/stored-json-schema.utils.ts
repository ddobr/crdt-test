import { ArrayJsonSchema, JsonSchema, ObjectJsonSchema } from "../public-api";
import { IStoredJsonSchema } from "../types/stored-json-schema.type";
import { z } from 'zod';

/** validate object type */
const schemaOfObject = z.object({
    type: z.literal('object'),
    required: z.array(z.string()),
    properties: z.object({
        key: z.string(),
        value: z.lazy(() => schemaOfStoredJsonSchema)
    })
        .required()
        .array()
}).required();
/** validate array type */
const schemaOfArray = z.object({
    type: z.literal('array'),
    items: z.lazy(() => schemaOfStoredJsonSchema)
}).required();
/** validate primitive type */
const schemaOfPrimitive = z.object({
    type: z.enum([
        'string',
        'number',
        'boolean',
    ]),
}).required();
/** validate schema metadata */
const schemaOfMetadata = z.object({
    title: z.string(),
    description: z.string(),
})

/**
 * Schema without validating the key uniqueness
 */
export const schemaOfStoredJsonSchema: z.ZodType<IStoredJsonSchema> = z.union([
    z.discriminatedUnion('type', [
        schemaOfObject,
        schemaOfArray,
    ]),
    schemaOfPrimitive,
]).and(schemaOfMetadata);
/** Basic type check of {@link IStoredJsonSchema} */
export function isValidStoredJsonSchema(value: unknown): value is IStoredJsonSchema {
    return schemaOfStoredJsonSchema.safeParse(value).success;
}

/**
 * Schema with key uniqueness validation
 */
const uniqueKeySchemaOfStoredJsonSchema: z.ZodType<IStoredJsonSchema> = schemaOfStoredJsonSchema.superRefine(
    (value, ctx) => {
        const validate = (s: IStoredJsonSchema, path: string[] = []): unknown => {
            if (s.type !== 'object') {
                return;
            }

            if (!s.properties) {
                return;
            }

            const keyToRefTimes: Record<string, number> = {};
            s.properties.forEach((pair) => {
                if (keyToRefTimes[pair.key] === undefined) {
                    keyToRefTimes[pair.key] = 0;
                }

                keyToRefTimes[pair.key] += 1;
            });

            Object.entries(keyToRefTimes).filter(([, refTimes]) => refTimes > 1).forEach(([key]) => {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [...path],
                    message: `The key ${key} in the object is not unique`
                })
            });

            return value.properties?.every(pair => validate(pair.value, [...path, pair.key]));
        };

        validate(value);
    }
);

/**
 * Required fields in objects only contain existing properties
 */
export const existingRequiredPropertiesOfStoredJsonSchema: z.ZodType<IStoredJsonSchema> = uniqueKeySchemaOfStoredJsonSchema.superRefine(
    (value, ctx) => {
        const validate = (s: IStoredJsonSchema, path: string[] = []): unknown => {
            if (s.type !== 'object') {
                return;
            }

            if (!s.properties) {
                return;
            }

            if (s.required?.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [...path],
                    message: `Required array must be non empty`
                })
            }

            const keyNames: Record<string, boolean> = {};
            s.properties.forEach((pair) => {
                keyNames[pair.key] = true;
            });

            const keys = s.properties?.map(p => p.key);
            s.required?.forEach((key) => {
                if (!keys.includes(key)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [...path],
                        message: `The key ${key} is not present in object, but is listed in required`
                    });
                }
            });

            return value.properties?.every(pair => validate(pair.value, [...path, pair.key]));
        };

        validate(value);
    }
);

/** Create {@link JsonSchema} from {@link IStoredJsonSchema} */
export function createJsonSchema(from: IStoredJsonSchema): JsonSchema {
    const to: Partial<JsonSchema> = {};

    to.type = from.type;
    if (from.description) {
        to.description = from.description;
    }
    if (from.title) {
        to.title = from.title;
    }
    if (from.type === 'object') {
        (to as ObjectJsonSchema).properties = Object.fromEntries(
            (from.properties ?? []).map(({ key, value }) => {
                return [key, createJsonSchema(value)]
            })
        );
    }
    if (from.type === 'array' && from.items) {
        (to as ArrayJsonSchema).items = createJsonSchema(from.items)
    }

    return to as JsonSchema;
}
