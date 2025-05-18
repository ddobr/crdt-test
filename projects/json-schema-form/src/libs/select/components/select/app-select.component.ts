import { ChangeDetectionStrategy, Component, forwardRef, input, InputSignal, output, signal, TemplateRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { IOption } from '../../types/option.type';
import { MatFormField, MatLabel, MatSelect, MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-select',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppSelectComponent),
            multi: true
        }
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatOption,
        MatSelect,
        MatFormField,
        MatLabel,
        MatSelectTrigger,
    ],
    styleUrls: ['./app-select.component.scss'],
    templateUrl: './app-select.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSelectComponent<T> implements ControlValueAccessor {

    /** user options */
    public readonly options: InputSignal<IOption<T>[]> = input.required();
    /** label for the control */
    public readonly label: InputSignal<string> = input<string>('');
    /** template of the icon near selected value */
    public readonly icon = input<TemplateRef<{ $implicit: T }> | null>(null);
    /** event emitter of changed value */
    public readonly valueChange = output<T | null>();

    public readonly value = signal<T | null>(null);
    public readonly isDisabled = signal(false);

    /** CVA - set value to model */
    private _onChange?: (v: T) => void;
    /** CVA - mark model as touched */
    private _onTouched?: () => void;

    /** @inheritdoc */
    public writeValue(obj: T): void {
        this.value.set(obj ?? null);
    }
    /** @inheritdoc */
    public registerOnChange(fn: (v: T) => void): void {
        this._onChange = fn;
    }
    /** @inheritdoc */
    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }
    /** @inheritdoc */
    public setDisabledState?(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

    /** Handle focus event */
    protected handleFocus(): void {
        this._onTouched?.();
    }

    /** Handle selection of on option is select */
    protected handleSelectedChange(event: MatSelectChange): void {
        this._onChange?.(event.value);
        this.valueChange.emit(event.value);
        this.value.set(event.value);
    }
}
