import { IOption } from "select";
import { CommonJsonTypes, IKeyed, IStoredJsonSchema } from "json-schema-common";
import { FormControl, Validators } from "@angular/forms";
import { JsonPathValidator } from "../validators/json-path.validator";
import { JsonPathUniqueValidator } from "../validators/json-path-unique.validator";
import { Observable, Subject, tap } from "rxjs";
import { Signal, signal } from "@angular/core";

interface ISchemaParent {
    getChildPath(child: ISchemaParent): string[];
}


export class JsonSchemaFormModel implements ISchemaParent {
    /** Поле ввода type */
    public readonly typeVm = new FormControl<CommonJsonTypes | null>(
        'string',
        {
            validators: [
                Validators.required,
                Validators.pattern(/^(string|number|boolean|array|object)$/)
            ],
        }
    );
    /** Поле ввода title */
    public readonly titleVm = new FormControl<string | null>(null);
    /** Поле ввода description */
    public readonly descriptionVm = new FormControl<string | null>(null);

    public readonly propertiesVm: JsonSchemaPropertyListFormModel = new JsonSchemaPropertyListFormModel(this);
    public itemsVm?: JsonSchemaFormModel;


    public readonly typeOptions: IOption<CommonJsonTypes>[] = [
        { title: 'number', value: 'number' },
        { title: 'boolean', value: 'boolean' },
        { title: 'string', value: 'string' },

        { title: 'array', value: 'array' },
        { title: 'object', value: 'object' },
    ];

    constructor(private readonly _parent?: ISchemaParent) {
        this.typeVm.valueChanges.pipe(
            tap(type => {
                this.createChildrenContainers(type ?? 'string');
            })
        ).subscribe();
    }

    public getControlPath(): string[] {
        return [...(this._parent?.getChildPath(this) ?? [])];
    }

    public getChildPath(child: ISchemaParent): string[] {
        if (this.typeVm.value === 'array') {
            if (child !== this.itemsVm) {
                throw new Error('Unknown child');
            }

            return [
                ...(this._parent?.getChildPath(this) ?? []),
                'items'
            ];
        }

        if (this.typeVm.value === 'object') {
            if (child !== this.propertiesVm) {
                throw new Error('Unknown child');
            }

            return [
                ...(this._parent?.getChildPath(this) ?? []),
                'properties'
            ];
        }

        throw new Error('Schema is primitive, without children');
    }

    public getValue(): IStoredJsonSchema {
        const value: IStoredJsonSchema = { type: this.typeVm.value ?? 'string' };

        if (this.titleVm.value) {
            value.title = this.titleVm.value;
        }

        if (this.descriptionVm.value) {
            value.description = this.descriptionVm.value;
        }

        if (value.type === 'array') {
            if (!this.itemsVm) {
                console.error('No itemsVm');
            }

            value.items = this.itemsVm?.getValue();
        }

        if (value.type === 'object') {
            value.properties = this.propertiesVm.getValue();
        }

        return value;
    }

    public setValue(value: IStoredJsonSchema): void {
        this.typeVm.setValue(value.type, { onlySelf: true, emitEvent: false });
        this.titleVm.setValue(value.title ?? null, { onlySelf: true, emitEvent: false });
        this.descriptionVm.setValue(value.description ?? null, { onlySelf: true, emitEvent: false });

        this.createChildrenContainers(value.type);

        this.propertiesVm.setValue(value.properties ?? []);
        this.itemsVm?.setValue(value.items ?? { type: 'string' });
    }

    private createChildrenContainers(type: CommonJsonTypes): void {
        if (type === 'object') {
            this.itemsVm = undefined;
        } else if (type === 'array') {
            if (!this.itemsVm) {
                this.itemsVm = new JsonSchemaFormModel(this);
            }

            this.propertiesVm.setValue([]);
        } else {
            this.propertiesVm.setValue([]);
            this.itemsVm = undefined;
        }
    }
}

export class JsonSchemaPropertyFormModel implements ISchemaParent {
    keyVm = new FormControl<string | null>(
        null,
        {
            validators: [
                Validators.required,
                JsonPathValidator,
            ]
        }
    );
    requiredVm = new FormControl<boolean | null>(false);
    valueVm = new JsonSchemaFormModel(this);


    constructor(private readonly _parent: JsonSchemaPropertyListFormModel) {
        this.keyVm.addValidators(
            JsonPathUniqueValidator(() => this._parent.children().map(child => child.keyVm)),
        );
    }

    public getControlPath(): string[] {
        return [...this._parent.getChildPath(this)];
    }

    public getChildPath(): string[] {
        return [
            ...this._parent.getChildPath(this),
            'value'
        ];
    }

    public getValue(): IKeyed {
        return {
            key: this.keyVm.value ?? '',
            required: this.requiredVm.value ?? false,
            value: this.valueVm.getValue()
        };
    }

    public setValue(value: IKeyed): void {
        this.keyVm.setValue(value.key, { onlySelf: true, emitEvent: false });
        this.requiredVm.setValue(value.required, { onlySelf: true, emitEvent: false });
        this.valueVm.setValue(value.value);
    }
}


export interface PropertyAddedEvent {
    type: 'add'
}
export interface PropertyRemovedEvent {
    type: 'removed';
    index: number
}

export class JsonSchemaPropertyListFormModel implements ISchemaParent {

    public readonly children: Signal<readonly JsonSchemaPropertyFormModel[]>;
    public readonly valueChanges: Observable<PropertyAddedEvent | PropertyRemovedEvent>

    private readonly _valueChanges = new Subject<PropertyAddedEvent | PropertyRemovedEvent>();
    private readonly _children = signal<JsonSchemaPropertyFormModel[]>([]);

    constructor(private readonly _parent: ISchemaParent) {
        this.children = this._children.asReadonly();
        this.valueChanges = this._valueChanges.asObservable();
    }

    public getChildPath(child: JsonSchemaPropertyFormModel): string[] {
        const indexOfChild = this._children().indexOf(child);
        if (indexOfChild < 0) {
            throw new Error('Unknown child');
        }

        return [
            ...this._parent.getChildPath(this),
            indexOfChild.toString()
        ];
    }

    public getValue(): IKeyed[] {
        return this.children().map(child => child.getValue());
    }

    public addProperty(): void {
        this.addPropertyBase();
        this._valueChanges.next({
            type: 'add'
        });
    }

    public deleteProperty(property: JsonSchemaPropertyFormModel): void {
        const indexOfChild = this._children().indexOf(property);
        if (indexOfChild < 0) {
            throw new Error('Unknown property');
        }

        this._children().splice(indexOfChild, 1);
        this._children.set([...this._children()]);

        this._valueChanges.next({
            type: 'removed',
            index: indexOfChild
        });
    }

    public setValue(value: IKeyed[]): void {
        value.forEach((propertyValue, idx) => {
            let propertyForm = this._children()[idx];
            if (!propertyForm) {
                propertyForm = this.addPropertyBase();
            }

            propertyForm.setValue(propertyValue);
        });

        const shouldBeDeleted = this._children().length - value.length;
        if (shouldBeDeleted > 0) {
            this._children().splice(-shouldBeDeleted, shouldBeDeleted);
            this._children.set([...this._children()]);
        }
    }

    private addPropertyBase(): JsonSchemaPropertyFormModel {
        const property = new JsonSchemaPropertyFormModel(this);
        this._children().push(property);
        this._children.set([...this._children()]);

        return property;
    }
}
