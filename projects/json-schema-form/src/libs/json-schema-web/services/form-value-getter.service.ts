import { IStoredJsonSchema } from "json-schema-common";
import { JsonSchemaForm, RootFormValue } from "../types/json-schema-form.type";


type Guarantee<T extends object, K extends keyof T> = T & Required<{
    [KEY in K]: NonNullable<T[KEY]>
}>;

export class FormValueGetterService {
    public getValue(form: JsonSchemaForm): IStoredJsonSchema {
        return this.fromFormValue(form.value);
    }

    private fromFormValue(root: RootFormValue): IStoredJsonSchema {
        const { type, title, description, items, properties } = root;

        if (!type) {
            throw new Error('Could not get form value. "type" is not set');
        }

        const schema: IStoredJsonSchema = { type };

        if (title) schema.title = title;
        if (description) schema.description = description;
        if (items) schema.items = this.fromFormValue(items);

        if (properties) {
            const requiredSet = new Set<string>();
            schema.properties = properties
                .filter((property): property is Guarantee<typeof property, 'key' | 'value'> => !!property.key && !!property.value)
                .map(property => {
                    if (property.required) {
                        requiredSet.add(property.key);
                    }

                    return {
                        key: property.key,
                        value: this.fromFormValue(property.value ?? {})
                    }
                })

            schema.required = Array.from(requiredSet);
        }

        return schema;
    }
}
