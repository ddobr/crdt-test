import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JsonSchemaRootComponent } from 'json-schema-web';

@Component({
    selector: 'app-root',
    providers: [],
    imports: [CommonModule, JsonSchemaRootComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

}
