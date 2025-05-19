import { Injectable } from "@angular/core";

@Injectable()
export class LoggingService {
    public enabled = true;

    public log(...args: Parameters<typeof console.log>): void {
        if (this.enabled) {
            console.log(...args);
        }
    }
}
