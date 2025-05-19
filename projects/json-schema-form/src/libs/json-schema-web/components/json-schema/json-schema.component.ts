import { ChangeDetectionStrategy, Component, inject, input, OnInit, Signal } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppSelectComponent, IOption } from 'select';
import { CommonJsonTypes, IKeyed, IStoredJsonSchema, JsonSchemaCrdtService } from 'json-schema-common';
import { JsonSchemaForm, JsonSchemaPropertyForm } from '../../types/json-schema-form.type';
import { JsonSchemaFormControllerService } from '../../services/json-schema-form-controller.service';
import { AppInputComponent } from 'input';
import { CommonModule } from '@angular/common';
import { BranchComponent } from '../branch/branch.component';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';


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
export class JsonSchemaComponent implements OnInit {

    public readonly form = input.required<JsonSchemaForm>();
    public readonly options: IOption<CommonJsonTypes>[];
    public readonly showProperties: Signal<boolean>;
    public readonly showItems: Signal<boolean>;

    protected readonly formController = inject(JsonSchemaFormControllerService);
    protected readonly crdtService = inject(JsonSchemaCrdtService);

    constructor() {
        this.options = this.formController.typeOptions;

        const schemaType = toObservable(this.form).pipe(
            switchMap((form) => this.crdtService.syncEvent.pipe(map(() => form))),
            map(form => form.value),
            map(value => value.type ?? 'string')
        );

        this.showProperties = toSignal(schemaType.pipe(
            map(type => type === 'object')
        ), { initialValue: false });

        this.showItems = toSignal(schemaType.pipe(
            map(type => type === 'array')
        ), { initialValue: false });
    }

    public ngOnInit(): void {
        const path = this.getPath(this.form());
        console.log(path);

        this.form().controls.title.valueChanges.subscribe((v) => {
            this.crdtService.change((doc) => {
                this.getAt(doc, path).title = v;
            });
        });

        this.form().controls.description.valueChanges.subscribe((v) => {
            this.crdtService.change((doc) => {
                this.getAt(doc, path).description = v;
            });
        });
    }

    public deleteProperty(property: JsonSchemaPropertyForm): void {

        this.formController.removeProperty(this.form(), property, true);
    }

    public addProperty(): void {
        this.formController.addProperty(this.form());
    }

    public handleTypeChanged(type: CommonJsonTypes | null): void {
        this.formController.handleTypeSet(type, this.form(), false);
    }

    private getPath(schema: JsonSchemaForm): string[] {
        const result: string[] = [];
        while (schema.parent) {
            const parent = schema.parent;
            if (!(parent instanceof FormGroup)) {
                throw new Error('Schema is in array');
            } else if (parent.controls['items'] === schema) {
                result.unshift('items');
                schema = parent;
            } else if (parent.controls['value'] === schema) {
                const properties = parent.parent;
                if (!(properties instanceof FormArray)) {
                    throw new Error('Property is in group');
                }

                const indexOfProperty = properties.controls.indexOf(parent);
                result.unshift('value');
                result.unshift(indexOfProperty.toString());
                result.unshift('properties');

                if (!(properties.parent instanceof FormGroup)) {
                    throw new Error('Properties is in array')
                }

                schema = properties.parent;
            }
        }
        return result;
    }

    private getAt(doc: IStoredJsonSchema, path: string[]): IStoredJsonSchema {
        path.forEach((segment) => {
            doc = doc[segment as keyof IStoredJsonSchema] as any;
        });

        return doc;
    }
}
