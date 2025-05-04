import { InjectionToken, WritableSignal } from "@angular/core";

export const FOCUSED_OPTION_VALUE = new InjectionToken<WritableSignal<unknown | undefined>>('Value of focused option in the popup. -1 for no focus');
