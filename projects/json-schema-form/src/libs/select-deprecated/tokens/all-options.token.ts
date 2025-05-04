import { InjectionToken, WritableSignal } from "@angular/core";
import { type OptionComponent } from "../components/option/option.component";

/**
 * @deprecated
 * This is a hack. Due to the bug of angular not being able to query nested content using contentChildren i create a token to store it
 *
 * can be deleted when this will be fixed:
 * https://github.com/angular/angular/issues/16299
 */
export const ALL_OPTIONS = new InjectionToken<WritableSignal<OptionComponent[]>>('All options passed to control');
