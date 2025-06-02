import { JsonSchema } from "../public-api";
import { IStoredJsonSchema } from "../types/stored-json-schema.type";
import { z } from 'zod';



/** validate schema metadata */
const schemaOfMetadata = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
}).strict();

/** validate property in properties of object */
const schemaOfProperty = z.object({
    key: z.string(),
    value: z.lazy(() => schemaOfStoredJsonSchema),
    required: z.boolean()
}).strict()

/** validate object type */
const schemaOfObject = z.object({
    type: z.literal('object'),
    properties: schemaOfProperty.array()
}).strict().merge(schemaOfMetadata);

/** validate array type */
const schemaOfArray = z.object({
    type: z.literal('array'),
    items: z.lazy(() => schemaOfStoredJsonSchema)
}).strict().merge(schemaOfMetadata);

/** validate primitive type */
const schemaOfPrimitive = z.object({
    type: z.enum([
        'string',
        'number',
        'boolean',
    ]),
}).strict().merge(schemaOfMetadata);

/**
 * Schema without validating the key uniqueness
 */
export const schemaOfStoredJsonSchema: z.ZodType<IStoredJsonSchema> = z.union([
    schemaOfObject,
    schemaOfArray,
    schemaOfPrimitive,
]);

/** Basic type check of {@link IStoredJsonSchema} */
export function isValidStoredJsonSchema(value: unknown): value is IStoredJsonSchema {
    return schemaOfStoredJsonSchema.safeParse(value).success;
}

/**
 * Schema with key uniqueness validation
 */
export const uniqueKeySchemaOfStoredJsonSchema: z.ZodType<IStoredJsonSchema> = schemaOfStoredJsonSchema.superRefine(
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

/** Create default stored value */
export function defaultValue(): IStoredJsonSchema {
    return { type: 'string' };
}

/** Create {@link JsonSchema} from {@link IStoredJsonSchema} */
export function createJsonSchema(from: IStoredJsonSchema): JsonSchema {
    const { description, title, type, items, properties } = from;

    const schema: Partial<JsonSchema> = { type };
    if (description !== undefined) {
        schema.description = description;
    }

    if (title !== undefined) {
        schema.title = title;
    }

    if (schema.type === 'object') {
        const requiredProps = new Set<string>();
        const allProps = new Set<string>();

        schema.properties = Object.fromEntries(
            (properties ?? [])
                .filter(({ key }) => !!key.trim())
                .filter(({ key }) => !allProps.has(key))
                .map(({ key, value, required }) => {
                    allProps.add(key);

                    if (required) {
                        requiredProps.add(key);
                    }

                    return [key, createJsonSchema(value)]
                })
        );

        schema.required = Array.from(requiredProps);
    }

    if (schema.type === 'array') {
        schema.items = createJsonSchema(items ?? defaultValue())
    }

    return schema as JsonSchema;
}
