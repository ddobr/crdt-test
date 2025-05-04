import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    DestroyRef,
    ElementRef,
    inject,
    signal,
    viewChild,
    WritableSignal
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { OptionComponent } from '../option/option.component';
import { SelectPopupComponent } from '../select-popup/select-popup.component';
import { CommonModule } from '@angular/common';
import { SELECTED_VALUE } from '../../tokens/selected-value.token';
import { SEARCH_QUERY } from '../../tokens/search-query.token';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, tap } from 'rxjs';
import { FOCUSED_OPTION_VALUE } from '../../tokens/focused-option-value.token';
import { ALL_OPTIONS } from '../../tokens/all-options.token';

@Component({
    standalone: true,
    selector: 'app-select',
    providers: [
        {
            provide: SELECTED_VALUE,
            useValue: signal(undefined)
        },
        {
            provide: FOCUSED_OPTION_VALUE,
            useValue: signal(undefined)
        },
        {
            provide: SEARCH_QUERY,
            useValue: signal('')
        },
        {
            provide: ALL_OPTIONS,
            useValue: signal([])
        }
    ],
    imports: [SelectPopupComponent, CommonModule],
    styles: [],
    templateUrl: './select.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent<TValue> implements ControlValueAccessor {
    public readonly popupShown = signal(false);
    public readonly value = inject(SELECTED_VALUE) as WritableSignal<TValue | undefined>;
    public readonly isDisabled = signal(false);
    public readonly searchQuery = inject(SEARCH_QUERY);

    private readonly _popupRef = contentChildren(SelectPopupComponent);
    private readonly _inputRef = viewChild<unknown, ElementRef<HTMLInputElement>>('inputRef', { read: ElementRef });
    private readonly _options = contentChildren(OptionComponent<TValue>);
    private readonly _destroy = inject(DestroyRef);
    private readonly _selectedOptionTitle = computed(
        () => this._options()
            .find(option => option.value === this.value())
            ?.title()
            ?? ''
    );
    /** @deprecated @see {@link ALL_OPTIONS} */
    private readonly _allOptions = inject(ALL_OPTIONS) as WritableSignal<readonly OptionComponent<TValue>[]>;

    private _onChange?: (value: TValue | undefined) => void;
    private _onTouched?: () => void;

    constructor() {
        toObservable(this._options).pipe(
            tap((options) => this._allOptions.set(options)),
            takeUntilDestroyed(this._destroy)
        ).subscribe();

        toObservable(this._selectedOptionTitle).pipe(
            tap((title) => this.searchQuery.set(title)),
            takeUntilDestroyed(this._destroy)
        ).subscribe();

        toObservable(this.value).pipe(
            distinctUntilChanged(),
            tap(() => this.popupShown.set(false)),
            tap(value => this._onChange?.(value)),
            takeUntilDestroyed(this._destroy)
        ).subscribe();
    }

    //#region CVA
    public writeValue(value: TValue | undefined): void {
        this.value.set(value);
    }

    public registerOnChange(fn: (value: TValue | undefined) => void): void {
        this._onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    public setDisabledState?(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }
    //#endregion

    public handleFieldKeyPress(event: KeyboardEvent): void {
        if (document.activeElement !== this._inputRef()?.nativeElement) {
            return;
        }
        if (event.key !== 'Enter') {
            return;
        }

        this.popupShown.set(true);
    }

    public handleFieldPointerdown(): void {
        this.popupShown.set(true);
    }

    public handleFieldFocus(): void {
        this._onTouched?.();
    }

    public handleFieldBlur(): void {
        this.popupShown.set(false);
        this.searchQuery.set(this._selectedOptionTitle());
    }

    public handleFieldInput(): void {
        this.searchQuery.set(this._inputRef()?.nativeElement.value ?? '');
    }

}
