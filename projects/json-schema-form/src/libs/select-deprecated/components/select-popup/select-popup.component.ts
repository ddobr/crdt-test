import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    HostListener,
    inject,
    signal,
    ElementRef,
    effect,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { SELECTED_VALUE } from '../../tokens/selected-value.token';
import { ALL_OPTIONS } from '../../tokens/all-options.token';
import { FOCUSED_OPTION_VALUE } from '../../tokens/focused-option-value.token';

@Component({
    standalone: true,
    selector: 'app-select-popup',
    providers: [],
    imports: [],
    styles: [],
    templateUrl: './select-popup.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectPopupComponent {
    private readonly value = inject(SELECTED_VALUE) as WritableSignal<unknown | undefined>;
    private readonly _scrollRef = viewChild<string, ElementRef<HTMLElement>>(
        'scrollRef', { read: ElementRef }
    );

    /** @deprecated @see {@link ALL_OPTIONS} */
    private readonly _options = inject(ALL_OPTIONS);
    private readonly _focusedOptionIndex = signal(-1);
    private readonly _optionsLength = computed(() => this._options().length);
    private readonly _focusedOptionValue: WritableSignal<unknown | undefined> = inject(FOCUSED_OPTION_VALUE);
    private readonly _hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);


    private readonly _selectedOptionIdx = computed(() => {
        if (this.value() === undefined) {
            return -1;
        }
        const values = this._options().map(option => option.value);

        return values.indexOf(this.value() as any);
    });

    private readonly _focusedOption = computed(() => {
        if (this._focusedOptionIndex() < 0) {
            return undefined;
        }

        return this._options()[this._focusedOptionIndex()] ?? undefined;
    });

    private readonly _focusedOptionElement = computed(() => {
        if (this._focusedOptionIndex() < 0) {
            return undefined;
        }

        return this._scrollRef()?.nativeElement.children[this._focusedOptionIndex()] ?? undefined;
    });


    private readonly _destroy = inject(DestroyRef);

    constructor() {
        toObservable(this._options).pipe(
            tap(() => this._focusedOptionIndex.set(this._selectedOptionIdx())),
            takeUntilDestroyed(this._destroy),
        ).subscribe();

        toObservable(this._focusedOption).pipe(
            tap((option) => this._focusedOptionValue.set(option?.value())),
            takeUntilDestroyed(this._destroy),
        ).subscribe();

        effect(() => {
            if (this._focusedOptionIndex() < 0) {
                return this._scrollRef()?.nativeElement.scrollTo({ top: 0, left: 0 });
            }

            this._scrollRef()?.nativeElement.scrollTo({
                top: this._focusedOptionElement()?.scrollTop ?? 0,
                left: 0
            });
        });
    }

    @HostListener('window:keydown.enter')
    protected handleKeyEnterPressed(): void {
        this.value.set(this._focusedOption()?.value);
    }

    @HostListener('window:keydown', ['$event'])
    protected handleKeyDownOrUpPressed(event: KeyboardEvent): void {
        if (event.key === 'ArrowDown') {
            this._focusedOptionIndex.set(
                (this._focusedOptionIndex() + 1) % this._optionsLength()
            );
        }

        if (event.key === 'ArrowUp') {
            this._focusedOptionIndex.set(
                (this._focusedOptionIndex() + this._optionsLength() - 1) % this._optionsLength()
            );
        }
    }
}
