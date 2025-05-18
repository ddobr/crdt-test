import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from "@angular/core";
import { JsonSchemaComponent } from "../json-schema/json-schema.component";
import { JsonSchemaFormControllerService } from "../../services/json-schema-form-controller.service";
import { IStoredJsonSchema, JsonSchemaCrdtService } from "json-schema-common";
import { filter, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormValueParser } from "../../utils/form-value-parser.util";
import * as Automerge from "@automerge/automerge";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormControl, FormsModule } from "@angular/forms";

@Component({
    standalone: true,
    selector: 'app-json-schema-root',
    providers: [
        JsonSchemaFormControllerService,
        JsonSchemaCrdtService,
    ],
    imports: [
        FormsModule,
        JsonSchemaComponent,
        MatCheckboxModule
    ],
    templateUrl: './json-schema-root.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonSchemaRootComponent {
    public readonly controller = inject(JsonSchemaFormControllerService);
    public readonly formRoot = this.controller.createRoot();

    public readonly staySynced = signal(true);

    private readonly _crdtService = inject(JsonSchemaCrdtService);
    private readonly _destroyRef = inject(DestroyRef);

    constructor() {
        const formValueParser = new FormValueParser();


        this._crdtService.syncEvent.pipe(
            // filter(() => this.staySynced()),
            tap(doc => {
                const formValue = formValueParser.getFormValue(doc);
                this.controller.setValue(this.formRoot, formValue)
            }),
            takeUntilDestroyed(this._destroyRef),
        ).subscribe();

        this.formRoot.valueChanges.pipe(
            // filter(() => this.staySynced()),
            tap(formValue => {
                const storedValue = formValueParser.getStoredValue(formValue);
                this._crdtService.change((doc) => Object.assign(doc, storedValue));
            }),
            takeUntilDestroyed(this._destroyRef),
        ).subscribe();

        // this.test();
        const rootDocUrl = document.location.hash.substring(1);
        document.location.hash = this._crdtService.initialize(rootDocUrl);

        effect(() => {
            if (this.staySynced()) {
                this._crdtService._networkAdapter.connect(this._crdtService._networkAdapter.peerId!);
            } else {
                this._crdtService._networkAdapter.disconnect();
            }
        })
    }

    public test(): void {
        let doc = Automerge.from<any>({
            title: '',
            description: ''
        });
        let doc1 = Automerge.change(Automerge.clone(doc), (m) => {
            // m.properties.push({
            //     title: 'hey'
            // });
            Object.assign(m, {
                title: 'hello',
                description: ''
            });

        });

        let doc2 = Automerge.change(Automerge.clone(doc), (m) => {
            // m.properties.push({
            //     title: 'hey2'
            // });
            // Object.assign(m, { properties: [{ title: 'hey2' }] });
            Object.assign(m, {
                title: '',
                description: 'world'
            });
        });

        console.log(Automerge.merge(doc1, doc2));
    }
}
