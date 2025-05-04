import { AbstractControl, ValidatorFn } from "@angular/forms";

export const JsonPathValidator: ValidatorFn = (control: AbstractControl) => {
    if (/^\w+$/.test(control.value) === false) {
        return {
            jsonPath: true,
        }
    }

    return null;
}
