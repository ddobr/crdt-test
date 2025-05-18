import { ChangeFn, Doc, DocHandle, DocHandleChangePayload, Repo, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { Observable, ReplaySubject } from "rxjs";
import { IStoredJsonSchema } from "../types/stored-json-schema.type";


export class JsonSchemaCrdtService {
    /** Поток эмитящий значение после каждой синхронизации */
    public readonly syncEvent: Observable<IStoredJsonSchema>;

    private readonly _repo: Repo;
    private readonly _syncEvent = new ReplaySubject<IStoredJsonSchema>(1);
    public readonly _networkAdapter: BroadcastChannelNetworkAdapter;

    private _handle?: DocHandle<IStoredJsonSchema>;

    constructor() {
        this.syncEvent = this._syncEvent.asObservable();

        this._networkAdapter = new BroadcastChannelNetworkAdapter()
        this._repo = new Repo({
            network: [
                // new BrowserWebSocketClientAdapter("wss://sync.automerge.org"),
                this._networkAdapter,
            ],
            storage: new IndexedDBStorageAdapter(),
        });
    }

    /**
     * Подключить локальный репозиторий к указанному документу или создать его.
     * Если идентификатор документа не передан - создастся новый документ и
     * вернется его идентификатор.
     *
     * @param docId идентификатор документа
     * @returns переданный или созданный идентификатор документа
     */
    public initialize(docId: string | undefined): string {
        this._handle?.removeAllListeners('change');

        if (isValidAutomergeUrl(docId)) {
            this._handle = this._repo.find(docId);
        } else {
            this._handle = this._repo.create<IStoredJsonSchema>({ type: 'string' });
        }

        this._handle.doc().then(this.handleLoad);
        this._handle.on('change', this.handleChange);
        // this._handle.delete

        return this._handle.url;
    }

    /**
     * Произвести мутацию над документом
     * @param cb колбек, который принимает документ и мутирует его
     */
    public change(cb: ChangeFn<IStoredJsonSchema>): void {
        if (this._handle?.isReady()) {
            this._handle?.change(cb);
        }
    }

    /**
     * Хендлер окончания инициализации
     * @param doc
     */
    private handleLoad = (doc: Doc<IStoredJsonSchema> | undefined) => {
        this._syncEvent.next(doc ?? { type: 'string' });
    }

    /**
     * Хендлер события синхронизации
     * @param doc
     */
    private handleChange = (event: DocHandleChangePayload<IStoredJsonSchema>) => {
        this._syncEvent.next(event.doc);
    }
}
