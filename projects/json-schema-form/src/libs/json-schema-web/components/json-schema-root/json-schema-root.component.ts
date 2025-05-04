import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { JsonSchemaComponent } from "../json-schema/json-schema.component";
import { JsonSchemaFormControllerService } from "../../services/json-schema-form-controller.service";
import { VALIDATION_MSG_PROVIDER } from "validation";
import { ValidationErrors } from "@angular/forms";
import { Repo, DocHandle, isValidAutomergeUrl } from '@automerge/automerge-repo';
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
import { RootFormValue } from "../../types/json-schema-form.type";

@Component({
    standalone: true,
    selector: 'app-json-schema-root',
    providers: [
        JsonSchemaFormControllerService,
        {
            provide: VALIDATION_MSG_PROVIDER,
            useValue: (errors: ValidationErrors): string | null => {
                if (errors["required"]) {
                    return 'This field is required';
                }

                if (errors["jsonPath"]) {
                    return 'This field can consist of: A-Z, a-z, 0-9 and _'
                }

                if (errors["jsonPathUnique"]) {
                    return 'This field must be unique';
                }

                return null;
            }
        }
    ],
    imports: [
        JsonSchemaComponent,
    ],
    templateUrl: './json-schema-root.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonSchemaRootComponent {
    public readonly formRoot = inject(JsonSchemaFormControllerService).createRoot();

    private _handle!: DocHandle<RootFormValue>;

    constructor() {
        const repo = new Repo({
            network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org"), new BroadcastChannelNetworkAdapter()],
            storage: new IndexedDBStorageAdapter(),
        })

        const rootDocUrl = document.location.hash.substring(1)

        if (isValidAutomergeUrl(rootDocUrl)) {
            this._handle = repo.find(rootDocUrl)
        } else {
            this._handle = repo.create<RootFormValue>({});
        }

        document.location.hash = this._handle.url;

        // Wait until synced or loaded
        this._handle.doc().then(doc => {
            this.formRoot.patchValue(doc ?? {}, { emitEvent: false });
        });

        // Sync: Form → Automerge
        this.formRoot.valueChanges.subscribe(value => {
            this._handle.change(d => {
                Object.assign(d, value);
            });
        });

        // Sync: Automerge → Form (reactively)
        this._handle.on('change', event => {
            this.formRoot.patchValue(event.doc ?? {}, { emitEvent: false });
        });

    }
}
