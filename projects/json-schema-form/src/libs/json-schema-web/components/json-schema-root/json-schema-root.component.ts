import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule } from "@angular/forms";
import * as Automerge from "@automerge/automerge";
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { JsonSchemaComponent } from "../json-schema/json-schema.component";
import { JsonSchemaCrdtService, LoggingService } from "json-schema-common";
import { tap } from "rxjs";
import { JsonSchemaFormControllerService } from "../../services/json-schema-form-controller.service";
import { FormValueParser } from "../../utils/form-value-parser.util";

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

    private readonly _crdtService = inject(JsonSchemaCrdtService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _logger = inject(LoggingService);

    constructor() {
        this._logger.enabled = false;

        const formValueParser = new FormValueParser();

        this._crdtService.syncEvent.pipe(
            tap(doc => {
                const formValue = formValueParser.getFormValue(doc);
                this.controller.setValue(this.formRoot, formValue)
            }),
            takeUntilDestroyed(this._destroyRef),
        ).subscribe();

        // this.formRoot.valueChanges.pipe(
        //     tap(formValue => {
        //         const storedValue = formValueParser.getStoredValue(formValue);
        //         this._crdtService.change((doc) => Object.assign(doc, storedValue));
        //     }),
        //     takeUntilDestroyed(this._destroyRef),
        // ).subscribe();

        const rootDocUrl = document.location.hash.substring(1);
        document.location.hash = this._crdtService.initialize(rootDocUrl);
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
