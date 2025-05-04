import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppSelectComponent, IOption } from 'select';
import { CommonJsonTypes } from 'json-schema-common';
import { JsonSchemaForm, JsonSchemaPropertyForm } from '../../types/json-schema-form.type';
import { JsonSchemaFormControllerService } from '../../services/json-schema-form-controller.service';
import { AppInputComponent } from 'input';
import { CommonModule } from '@angular/common';
import { BranchComponent } from '../branch/branch.component';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';


@Component({
    standalone: true,
    selector: 'app-json-schema',
    imports: [
        ReactiveFormsModule,
        AppSelectComponent,
        AppInputComponent,
        CommonModule,
        BranchComponent,
        MatIcon,
        MatFabButton,
        MatCheckbox
    ],
    styleUrls: ['./json-schema.component.scss'],
    templateUrl: './json-schema.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonSchemaComponent {
    public readonly form = input.required<JsonSchemaForm>();
    public readonly options: IOption<CommonJsonTypes>[];

    protected readonly formController = inject(JsonSchemaFormControllerService);

    constructor() {
        this.options = this.formController.typeOptions;
    }

    public deleteProperty(property: JsonSchemaPropertyForm): void {
        this.formController.removeProperty(this.form(), property)
    }

    public addProperty(): void {
        this.formController.addProperty(this.form());
    }

    public handleTypeChanged(type: CommonJsonTypes | null): void {
        this.formController.handleTypeSet(type, this.form());
    }
}
