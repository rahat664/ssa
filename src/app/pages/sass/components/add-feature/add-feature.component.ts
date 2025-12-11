import {Component, Inject} from '@angular/core';
import {AlphabetOnlyDirective} from "../../../../shared/directives/alphabet-only.directive";
import {MatInput} from "@angular/material/input";
import {CommonModule, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField} from '@angular/material/form-field';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EnterpriseService} from '../../services/enterprise.service';
import {SharedService} from '../../../../shared/service/shared.service';
import {Feature} from '../../models/modules.model';

@Component({
  selector: 'app-add-feature',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-feature.component.html',
  styleUrl: './add-feature.component.scss'
})
export class AddFeatureComponent {
  loading: boolean = false;
  featureForm: FormGroup;

  constructor(private fb: FormBuilder, private shared: SharedService, private service: EnterpriseService, public dialogRef: MatDialogRef<AddFeatureComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.featureForm = this.fb.group({
      name: ['', [Validators.required]],
      moduleId: [null, [Validators.required]],
      urls: [[], [Validators.required]],
    });
  }

  onSubmitModule() {
    const moduleId = Number(this.data?.moduleId);
    this.featureForm.get('moduleId').setValue(moduleId);
    this.featureForm.get('urls').setValue([this.featureForm.get('urls').value]);
    this.service.addFeature(this.featureForm.value).subscribe((res: any) => {
      const newFeature: Feature | undefined = res?.data || res;
      if (res?.status === 'OK' || res?.status === 200 || newFeature) {
        this.shared.showSuccess(res?.message || 'Feature added');
        this.dialogRef.close(newFeature || true);
      } else {
        this.shared.showError(res?.message || 'Failed to add feature');
      }
    }, error => {
      this.shared.showError(error.error?.message || 'Failed to add feature');
    });
  }

  onCloseAddModule() {
    this.dialogRef.close(false);
  }
}
