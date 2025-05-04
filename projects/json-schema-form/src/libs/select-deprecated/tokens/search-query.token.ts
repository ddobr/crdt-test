import { InjectionToken, WritableSignal } from "@angular/core";

export const SEARCH_QUERY = new InjectionToken<WritableSignal<string>>('Event emitter for search query');
