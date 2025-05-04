import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonJsonTypes } from "json-schema-common";
import { JsonSchemaForm, JsonSchemaPropertyForm } from "../types/json-schema-form.type";
import { IOption } from "select";
import { JsonPathValidator } from "../validators/json-path.validator";
import { JsonPathUniqueValidator } from "../validators/json-path-unique.validator";

export class JsonSchemaFormControllerService {

    public readonly typeOptions: IOption<CommonJsonTypes>[] = [
        { title: 'number', value: 'number' },
        { title: 'boolean', value: 'boolean' },
        { title: 'string', value: 'string' },

        { title: 'array', value: 'array' },
        { title: 'object', value: 'object' },
    ];

    public createRoot(): JsonSchemaForm {
        return new FormGroup({
            type: new FormControl<CommonJsonTypes | null>(
                null,
                {
                    validators: [
                        Validators.required,
                        Validators.pattern(/^(string|number|boolean|array|object)$/)
                    ],
                }
            ),
            title: new FormControl<string | null>(null),
            description: new FormControl<string | null>(null),

        });
    }

    public handleTypeSet(type: CommonJsonTypes | null, root: JsonSchemaForm): void {
        root.removeControl('items', { emitEvent: false });
        root.removeControl('properties', { emitEvent: false });

        if (type === 'array') {
            this.setItems(root);
        }

        if (type === 'object') {
            this.setProperties(root);
        }
    }

    public addProperty(root: JsonSchemaForm): JsonSchemaPropertyForm {
        if (!root.contains('properties') || root.value.type !== 'object' || !root.controls.properties) {
            throw new Error('Could not add property. Given root is not an object or does not contain property form');
        }

        const property = this.createProperty(root.controls.properties);
        root.controls.properties.insert(
            root.controls.properties.length,
            property,
            { emitEvent: true }
        );

        return property;
    }

    public removeProperty(root: JsonSchemaForm, idx: number): void
    public removeProperty(root: JsonSchemaForm, property: JsonSchemaPropertyForm): void
    public removeProperty(root: JsonSchemaForm, idxOrProperty: number | JsonSchemaPropertyForm): void {
        if (!root.contains('properties') || root.value.type !== 'object') {
            throw new Error('Could not remove property. Given root is not an object or does not contain property form');
        }

        let idx: number | undefined = undefined;
        if (typeof idxOrProperty === 'number') {
            idx = idxOrProperty;
        }
        if (idxOrProperty instanceof FormGroup) {
            idx = root.controls.properties?.controls.indexOf(idxOrProperty);
        }

        if (idx === undefined) {
            throw new Error('Could not remove property. No such property');
        }

        root.controls.properties?.removeAt(idx, { emitEvent: true });
    }

    private createProperty(arrayOfPropertiesForm: FormArray<JsonSchemaPropertyForm>): JsonSchemaPropertyForm {
        return new FormGroup({
            key: new FormControl<string | null>(
                null,
                {
                    validators: [
                        Validators.required,
                        JsonPathValidator,
                        JsonPathUniqueValidator(arrayOfPropertiesForm)
                    ]
                }
            ),
            required: new FormControl<boolean | null>(false),
            value: this.createRoot()
        });
    }

    private setItems(root: JsonSchemaForm): JsonSchemaForm {
        if (root.value.type !== 'array') {
            throw new Error('Items are only available for array type');
        }

        const itemsForm = this.createRoot();

        root.removeControl('items', { emitEvent: false });
        root.setControl('items', itemsForm, { emitEvent: true });

        return itemsForm;
    }

    private setProperties(root: JsonSchemaForm): FormArray<JsonSchemaPropertyForm> {
        if (root.value.type !== 'object') {
            throw new Error('Properties are only available for object type');
        }

        const propertiesForm = new FormArray<JsonSchemaPropertyForm>([]);
        propertiesForm.insert(0, this.createProperty(propertiesForm));

        root.removeControl('properties', { emitEvent: false });
        root.setControl('properties', propertiesForm, { emitEvent: true });

        return propertiesForm;
    }

}
