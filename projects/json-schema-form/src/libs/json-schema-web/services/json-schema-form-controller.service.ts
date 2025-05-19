import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { CommonJsonTypes, LoggingService } from "json-schema-common";
import { JsonSchemaForm, JsonSchemaPropertyForm, RootFormValue } from "../types/json-schema-form.type";
import { IOption } from "select";
import { JsonPathValidator } from "../validators/json-path.validator";
import { JsonPathUniqueValidator } from "../validators/json-path-unique.validator";
import { inject, Injectable } from "@angular/core";

@Injectable()
export class JsonSchemaFormControllerService {

    public readonly typeOptions: IOption<CommonJsonTypes>[] = [
        { title: 'number', value: 'number' },
        { title: 'boolean', value: 'boolean' },
        { title: 'string', value: 'string' },

        { title: 'array', value: 'array' },
        { title: 'object', value: 'object' },
    ];

    private readonly _logger = inject(LoggingService);

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

    public setValue(root: JsonSchemaForm, value: RootFormValue, emitEvent = false): void {
        this._logger.log('setValue', root, value);

        root.patchValue(value, { onlySelf: true, emitEvent });

        if (value.items || value.type == 'array') {
            if (!root.controls.items) {
                this.setItems(root);
            }

            if (value.items && root.controls.items) {
                this.setValue(root.controls.items, value.items)
            }
        }

        if (value.properties?.length || value.type === 'object') {
            if (!root.controls.properties) {
                this.setProperties(root);
            }

            const propertiesArrayForm = root.controls.properties!;
            value.properties?.forEach((propertyFormValue, idx) => {
                let propertyForm = propertiesArrayForm.at(idx);
                if (!propertyForm) {
                    propertyForm = this.addProperty(root);
                }

                propertyForm.patchValue(propertyFormValue, { onlySelf: true, emitEvent });
                this.setValue(propertyForm.controls.value, propertyFormValue.value ?? {});
            });

            let shouldBeDeleted = propertiesArrayForm.controls.length - (value.properties?.length ?? 0);
            let pointer = -1;

            while (shouldBeDeleted > 0) {
                // удаляем только валидные - если поле невалидно, то его,
                // возможно, не закончил редактировать пользователь, и ему
                // прилетело новое валидное состояние
                if (propertiesArrayForm.at(pointer).valid) {
                    propertiesArrayForm.removeAt(pointer, { emitEvent });
                } else {
                    pointer -= 1;
                }

                shouldBeDeleted -= 1;
            }
        }
    }

    public handleTypeSet(type: CommonJsonTypes | null, root: JsonSchemaForm, emitEvent = false): void {
        this._logger.log('handleTypeSet', type, root);

        root.removeControl('items', { emitEvent });
        root.removeControl('properties', { emitEvent });

        if (type === 'array') {
            this.setItems(root, emitEvent);
        }

        if (type === 'object') {
            this.setProperties(root, emitEvent);
        }
    }

    public addProperty(root: JsonSchemaForm, emitEvent = false): JsonSchemaPropertyForm {
        this._logger.log('addProperty', root);

        if (!root.contains('properties')
            || root.value.type !== 'object'
            || !root.controls.properties
        ) {
            throw new Error('Could not add property.');
        }

        const property = this.createProperty(root.controls.properties);
        root.controls.properties.insert(
            root.controls.properties.length,
            property,
            { emitEvent }
        );

        return property;
    }

    public removeProperty(root: JsonSchemaForm, idx: number, emitEvent?: boolean): void
    public removeProperty(root: JsonSchemaForm, property: JsonSchemaPropertyForm, emitEvent?: boolean): void
    public removeProperty(root: JsonSchemaForm, idxOrProperty: number | JsonSchemaPropertyForm, emitEvent = false): void {
        this._logger.log('removeProperty', root, idxOrProperty);

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

        root.controls.properties?.removeAt(idx, { emitEvent });
    }

    private createProperty(arrayOfPropertiesForm: FormArray<JsonSchemaPropertyForm>): JsonSchemaPropertyForm {
        this._logger.log('createProperty', arrayOfPropertiesForm);

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

    private setItems(root: JsonSchemaForm, emitEvent = false): JsonSchemaForm {
        this._logger.log('setItems', root);

        if (root.value.type !== 'array') {
            throw new Error('Items are only available for array type');
        }

        const itemsForm = this.createRoot();

        root.removeControl('items', { emitEvent: false });
        root.setControl('items', itemsForm, { emitEvent });

        return itemsForm;
    }

    private setProperties(root: JsonSchemaForm, emitEvent = false): FormArray<JsonSchemaPropertyForm> {
        this._logger.log('setProperties', root);

        if (root.value.type !== 'object') {
            throw new Error('Properties are only available for object type');
        }

        const propertiesForm = new FormArray<JsonSchemaPropertyForm>([]);
        propertiesForm.insert(0, this.createProperty(propertiesForm));

        root.removeControl('properties', { emitEvent: false });
        root.setControl('properties', propertiesForm, { emitEvent });

        return propertiesForm;
    }
}
