import { IStoredJsonSchema } from "json-schema-common";
import { RootFormValue } from "../types/json-schema-form.type";


type Guarantee<T extends object, K extends keyof T> = T & Required<{
    [KEY in K]: NonNullable<T[KEY]>
}>;

export class FormValueParser {
    public getStoredValue(formValue: RootFormValue): IStoredJsonSchema {
        return this.fromFormValue(formValue);
    }

    public getFormValue(storedValue: IStoredJsonSchema): RootFormValue {
        return this.fromStoredValue(storedValue);
    }

    private fromStoredValue(storedValue: IStoredJsonSchema): RootFormValue {
        const { type, title, description, items, properties, required } = storedValue;
        if (!type) {
            throw new Error('Could not parse stored value. "type" is not set');
        }

        const formValue: RootFormValue = { type };

        if (title !== null) formValue.title = title;
        if (description !== null) formValue.description = description;
        if (items) formValue.items = this.fromFormValue(items);

        if (properties) {
            formValue.properties = properties
                .filter((property): property is Guarantee<typeof property, 'key' | 'value'> => {
                    return !!property.key && !!property.value
                })
                .map(property => {
                    return {
                        key: property.key,
                        value: this.fromFormValue(property.value ?? {}),
                        required: required?.includes(property.key) ?? false,
                    }
                })
        }

        return formValue;
    }

    private fromFormValue(root: RootFormValue): IStoredJsonSchema {
        const { type, title, description, items, properties } = root;
        if (!type) {
            throw new Error('Could not parse form value. "type" is not set');
        }

        const schema: IStoredJsonSchema = { type };

        schema.title = title ?? '';
        schema.description = description ?? '';
        if (items && items.type) schema.items = this.fromFormValue(items)

        if (properties) {
            const requiredSet = new Set<string>();
            schema.properties = properties
                .filter((property): property is Guarantee<typeof property, 'key' | 'value'> => !!property.key && !!property.value)
                .filter(property => !!property.value.type)
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
