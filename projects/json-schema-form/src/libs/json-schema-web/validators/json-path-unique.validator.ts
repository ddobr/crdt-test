import { AbstractControl, FormArray, ValidatorFn } from "@angular/forms";
import { JsonSchemaPropertyForm } from "../types/json-schema-form.type";

export const JsonPathUniqueValidator = (propertiesArrayForm: FormArray<JsonSchemaPropertyForm>): ValidatorFn => {
    return (control: AbstractControl) => {
        const isUniqueValue = propertiesArrayForm.controls
            .map(propertyForm => propertyForm.controls.key)
            .filter(keyControl => keyControl !== control)
            .every(keyControl => keyControl.value !== control.value);

        if (isUniqueValue) {
            return null;
        }

        return {
            jsonPathUnique: true
        };
    }
}
