import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    standalone: true,
    selector: 'app-branch',
    imports: [CommonModule],
    templateUrl: './branch.component.html',
    styleUrl: './branch.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchComponent {
}
