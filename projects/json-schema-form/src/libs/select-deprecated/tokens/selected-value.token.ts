import { InjectionToken, WritableSignal } from "@angular/core";

export const SELECTED_VALUE = new InjectionToken<WritableSignal<unknown | undefined>>('Event emitter for selected value');
