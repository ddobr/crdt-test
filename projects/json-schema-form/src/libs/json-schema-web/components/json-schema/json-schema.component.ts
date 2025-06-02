import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, OnInit, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppSelectComponent, IOption } from 'select';
import { CommonJsonTypes, IStoredJsonSchema, JsonSchemaCrdtService } from 'json-schema-common';
import { AppInputComponent } from 'input';
import { CommonModule } from '@angular/common';
import { BranchComponent } from '../branch/branch.component';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton } from '@angular/material/button';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { JsonSchemaPropertyComponent } from '../json-schema-property/json-schema-property.component';
import { JsonSchemaFormModel } from '../../models/json-schema-form.model';


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
        forwardRef(() => JsonSchemaPropertyComponent),
    ],
    styleUrls: ['./json-schema.component.scss'],
    templateUrl: './json-schema.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonSchemaComponent implements OnInit {

    public get path(): string[] {
        return this.form().getControlPath();
    }

    public readonly form = input.required<JsonSchemaFormModel>();
    public readonly options: Signal<IOption<CommonJsonTypes>[]> = computed(() => this.form().typeOptions);
    public readonly showProperties: Signal<boolean>;
    public readonly showItems: Signal<boolean>;

    protected readonly crdtService = inject(JsonSchemaCrdtService);

    constructor() {
        /** Выбранный type у JSON схемы */
        const schemaType = toObservable(this.form).pipe(
            switchMap((form) => {
                return this.crdtService.syncEvent.pipe(
                    map(() => {
                        return form;
                    })
                );
            }),
            map(form => form.typeVm.value ?? 'string'),
        );

        this.showProperties = toSignal(schemaType.pipe(
            map(type => type === 'object')
        ), { initialValue: false });

        this.showItems = toSignal(schemaType.pipe(
            map(type => type === 'array')
        ), { initialValue: false });
    }

    public ngOnInit(): void {
        console.log(this.path);

        this.form().titleVm.valueChanges.subscribe((v) => {
            this.crdtService.change((doc) => {
                if (!v && v !== '') {
                    delete this.getAt(doc, this.path).title;
                } else {
                    this.getAt(doc, this.path).title = v;
                }
            });
        });

        this.form().descriptionVm.valueChanges.subscribe((v) => {
            this.crdtService.change((doc) => {
                if (!v && v !== '') {
                    delete this.getAt(doc, this.path).description
                } else {
                    this.getAt(doc, this.path).description = v;
                }
            });
        });

        this.form().typeVm.valueChanges.subscribe((v) => {
            this.crdtService.change((doc) => {
                this.getAt(doc, this.path).type = v ?? 'string';
                switch (v) {
                    case 'array':
                        delete this.getAt(doc, this.path).properties;
                        this.getAt(doc, this.path).items = { type: 'string' };
                        break;
                    case 'object':
                        delete this.getAt(doc, this.path).items;
                        this.getAt(doc, this.path).properties = [];
                        break;
                    default:
                        delete this.getAt(doc, this.path).items;
                        delete this.getAt(doc, this.path).properties;
                }
            });
        });

        this.form().propertiesVm.valueChanges.subscribe(event => {
            this.crdtService.change((doc) => {
                if (event.type === 'add') {
                    this.getAt(doc, this.path).properties?.push({ key: '', value: { type: 'string' }, required: false });
                } else {
                    this.getAt(doc, this.path).properties?.splice(event.index, 1);
                }
            });
        });
    }

    public addProperty(): void {
        this.form().propertiesVm?.addProperty();
    }

    private getAt(doc: IStoredJsonSchema, path: string[]): IStoredJsonSchema {
        path.forEach((segment) => {
            doc = doc[segment as keyof IStoredJsonSchema] as any;
        });

        return doc;
    }
}
