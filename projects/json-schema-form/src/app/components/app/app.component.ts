import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { JsonSchemaRootComponent } from 'json-schema-web';
import { VALIDATION_MSG_PROVIDER } from 'validation';
import { LoggingService } from 'json-schema-common';

@Component({
    selector: 'app-root',
    providers: [
        LoggingService,
        {
            provide: VALIDATION_MSG_PROVIDER,
            useValue: (errors: ValidationErrors): string | null => {
                if (errors["required"]) {
                    return 'This field is required';
                }

                if (errors["jsonPath"]) {
                    return 'This field can consist of: A-Z, a-z, 0-9 and _'
                }

                if (errors["jsonPathUnique"]) {
                    return 'This field must be unique';
                }

                return null;
            }
        }
    ],
    imports: [CommonModule, JsonSchemaRootComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

}
