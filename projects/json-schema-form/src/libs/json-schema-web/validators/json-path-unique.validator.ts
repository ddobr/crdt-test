import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";

export const JsonPathUniqueValidator = (getAlike: () => FormControl<string | null>[]): ValidatorFn => {
    return (control: AbstractControl) => {
        const isUniqueValue = getAlike()
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
