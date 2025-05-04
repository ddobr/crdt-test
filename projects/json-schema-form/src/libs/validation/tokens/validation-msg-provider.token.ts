import { InjectionToken } from "@angular/core";
import { ValidationErrors } from "@angular/forms";

export const VALIDATION_MSG_PROVIDER = new InjectionToken<(errors: ValidationErrors) => string | null>('FormControl validation errors to one validation message');
