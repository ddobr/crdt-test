import { ChangeDetectionStrategy, Component, computed, effect, HostListener, inject, input, WritableSignal } from '@angular/core';
import { SELECTED_VALUE } from '../../tokens/selected-value.token';
import { FOCUSED_OPTION_VALUE } from '../../tokens/focused-option-value.token';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-option',
    providers: [],
    imports: [CommonModule],
    styles: [],
    templateUrl: './option.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionComponent<TValue = unknown> {
    public readonly value = input.required<TValue>();
    public readonly title = input.required<string>();

    public readonly selectedValue: WritableSignal<unknown | undefined> = inject(SELECTED_VALUE);
    public readonly focusedOptionValue: WritableSignal<unknown | undefined> = inject(FOCUSED_OPTION_VALUE);
    public readonly isFocused = computed(() => this.focusedOptionValue() === this.value());
    public readonly isSelected = computed(() => this.selectedValue() === this.value());

    @HostListener('click', ['$event'])
    protected handleSelectOption(event: Event): void {
        if (event.defaultPrevented) {
            return;
        }

        this.selectedValue.set(this.value());
        event.preventDefault();
    }
}
