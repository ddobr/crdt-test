import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/components/app/app.component';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';


export const appConfig: ApplicationConfig = {
    providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes)
    ]
};

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
