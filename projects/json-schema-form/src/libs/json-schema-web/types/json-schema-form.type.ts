import { FormGroup, FormControl, FormArray } from "@angular/forms";
import { CommonJsonTypes } from "json-schema-common";

/**
 * JSON схема
 * @see IStoredJsonSchema
 */
export type JsonSchemaForm = FormGroup<{
    type: FormControl<CommonJsonTypes | null>,
    title: FormControl<string | null>,
    description: FormControl<string | null>,

    items?: JsonSchemaForm,
    properties?: FormArray<JsonSchemaPropertyForm>,
}>;

/** Элемент из массива properties в JsonSchemaRootForm */
export type JsonSchemaPropertyForm = FormGroup<{
    key: FormControl<string | null>,
    required: FormControl<boolean | null>,
    value: JsonSchemaForm
}>;

/** Значение формы */
export type RootFormValue = JsonSchemaForm['value'];
