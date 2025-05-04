import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, input, Signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule, ValidationErrors } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { filter, map, switchMap } from "rxjs";
import { VALIDATION_MSG_PROVIDER } from "validation";

@Component({
    standalone: true,
    selector: 'app-input',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
    ],
    styleUrls: ['./app-input.component.scss'],
    templateUrl: './app-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppInputComponent {
    /** form control */
    public readonly control = input.required<FormControl>();
    /** label for the control */
    public readonly label = input<string>('');
    /** placeholder for the control */
    public readonly placeholder = input<string>('');
    /** message of the error to be displayed */
    public readonly errorMsg: Signal<string | null>;

    /** errors object to error message */
    private readonly _validationMsgProvider = inject(VALIDATION_MSG_PROVIDER);

    constructor() {
        this.errorMsg = this.createErrorMsgSignal();
    }

    private createErrorMsgSignal(): Signal<string | null> {
        return toSignal(
            toObservable(this.control)
                .pipe(
                    filter(c => !!c),
                    switchMap(c => c.valueChanges
                        .pipe(
                            map(() => c)
                        )
                    ),
                    map(c => c.errors),
                    filter((errors): errors is ValidationErrors => !!errors && Object.keys(errors).length !== 0),
                    map(errors => this._validationMsgProvider(errors))
                ),
            { initialValue: null }
        );
    }
}

