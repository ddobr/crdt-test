import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule } from "@angular/forms";
import * as Automerge from "@automerge/automerge";
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { JsonSchemaComponent } from "../json-schema/json-schema.component";
import { JsonSchemaCrdtService, LoggingService } from "json-schema-common";
import { tap } from "rxjs";
import { JsonSchemaFormModel } from "../../models/json-schema-form.model";

@Component({
    standalone: true,
    selector: 'app-json-schema-root',
    providers: [
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
    public readonly formRoot = new JsonSchemaFormModel();

    private readonly _crdtService = inject(JsonSchemaCrdtService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _logger = inject(LoggingService);

    constructor() {
        this._logger.enabled = false;


        this._crdtService.syncEvent.pipe(
            tap(doc => {
                this.formRoot.setValue(doc);
            }),
            takeUntilDestroyed(this._destroyRef),
        ).subscribe();


        const rootDocUrl = document.location.hash.substring(1);
        document.location.hash = this._crdtService.initialize(rootDocUrl);

        this.test();
    }

    public test(): void {
        let doc = Automerge.from<any>({
            title: {
                value: ''
            },
            description: ''
        });
        let doc1 = Automerge.change(Automerge.clone(doc), (m) => {
            m.title = '!!';
        });

        let doc2 = Automerge.change(Automerge.clone(doc), (m) => {
            m.title = '!!';
        });

        // console.log(Automerge.merge(doc1, doc2));
        console.log(Automerge.getConflicts(Automerge.merge(doc1, doc2), 'title'));

    }
}
