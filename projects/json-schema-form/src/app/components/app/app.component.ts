import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-root',
    providers: [],
    imports: [CommonModule],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

}
