import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, forwardRef, inject, input, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFabButton } from "@angular/material/button";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatIcon } from "@angular/material/icon";
import { AppInputComponent } from "../../../input/public-api";
import { BranchComponent } from "../branch/branch.component";
import { JsonSchemaComponent } from "../json-schema/json-schema.component";
import { IStoredJsonSchema, JsonSchemaCrdtService } from "../../../json-schema-common/public-api";
import { JsonSchemaPropertyFormModel, JsonSchemaPropertyListFormModel } from "../../models/json-schema-form.model";

@Component({
    standalone: true,
    selector: 'app-json-schema-property',
    providers: [],
    imports: [
        ReactiveFormsModule,
        AppInputComponent,
        CommonModule,
        BranchComponent,
        MatIcon,
        MatFabButton,
        MatCheckbox,
        forwardRef(() => JsonSchemaComponent),
    ],
    templateUrl: './json-schema-property.component.html',
    styleUrls: ['./json-schema-property.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonSchemaPropertyComponent implements OnInit {
    public readonly propertyForm = input.required<JsonSchemaPropertyFormModel>();
    public readonly propertyListForm = input.required<JsonSchemaPropertyListFormModel>();


    protected readonly crdtService = inject(JsonSchemaCrdtService);

    public ngOnInit(): void {
        const path = this.propertyForm().getControlPath();
        console.log(path);

        this.propertyForm().keyVm.valueChanges.subscribe((v) => {
            this.crdtService.change((doc) => {
                if (!v && v !== '') {
                    delete this.getAt(doc, path).key;
                } else {
                    this.getAt(doc, path).key = v;
                }
            });
        });

        this.propertyForm().requiredVm.valueChanges.subscribe((v) => {
            this.crdtService.change((doc) => {
                this.getAt(doc, path).required = v;
            });
        });
    }

    public deleteProperty(): void {
        this.propertyListForm().deleteProperty(this.propertyForm());
    }

    private getAt(doc: IStoredJsonSchema, path: string[]): any {
        path.forEach((segment) => {
            doc = doc[segment as keyof IStoredJsonSchema] as any;
        });

        return doc;
    }
}
