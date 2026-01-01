import {Component, Inject} from '@angular/core';
import {AlphabetOnlyDirective} from "../../../../shared/directives/alphabet-only.directive";
import {MatInput} from "@angular/material/input";
import {CommonModule, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField} from '@angular/material/form-field';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EnterpriseService} from '../../services/enterprise.service';
import {SharedService} from '../../../../shared/service/shared.service';
import {Feature, FeatureListItem, FeatureListStatus} from '../../models/modules.model';
import {Status} from './status.enum';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-add-feature',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    CommonModule,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
  ],
  templateUrl: './add-feature.component.html',
  styleUrl: './add-feature.component.scss'
})
export class AddFeatureComponent {
  loading: boolean = false;
  featureForm: FormGroup;
  featureList: FeatureListItem[] = [];
  isEdit = false;
  private featureId: number | null = null;

  constructor(private fb: FormBuilder, private shared: SharedService, private service: EnterpriseService, public dialogRef: MatDialogRef<AddFeatureComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.featureForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      status: [Status.ACTIVE, [Validators.required]],
      moduleId: [null, [Validators.required]],
      urls: [[]],
      parent: [null],
    });
  }

  ngOnInit() {
    this.featureList = this.data?.featureList || [];
    const incomingFeature = this.data?.feature;
    if (incomingFeature) {
      this.isEdit = true;
      this.featureId = Number(incomingFeature?.id) || null;
    }
    const moduleId = Number(this.data?.moduleId);
    if (Number.isFinite(moduleId) && moduleId > 0) {
      this.featureForm.get('moduleId').setValue(moduleId);
    }
    if (incomingFeature) {
      const mappedStatus = this.mapStatus(incomingFeature?.status);
      const moduleFromFeature = Number(incomingFeature?.moduleId ?? incomingFeature?.module?.id);
      if (Number.isFinite(moduleFromFeature) && moduleFromFeature > 0) {
        this.featureForm.get('moduleId').setValue(moduleFromFeature);
      }
      const urls = this.normalizeUrls(incomingFeature?.urls);
      const slug = this.resolveSlug(incomingFeature);
      const parentId = this.extractParentId(incomingFeature?.parent);
      const parentMatch = parentId
        ? this.featureList.find(feature => Number(feature.id) === parentId)
        : null;
      this.featureForm.patchValue({
        name: incomingFeature?.name ?? '',
        slug: slug ?? '',
        status: mappedStatus,
        urls: urls.join(', '),
        parent: parentMatch ?? null
      });
    }
  }

  statusOptions = [
    {value: Status.ACTIVE, viewValue: 'Active'},
    {value: Status.INACTIVE, viewValue: 'Inactive'},
    {value: Status.OPTIONAL, viewValue: 'Optional'},
  ];

  onSubmitModule() {
    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      this.shared.showError('Please fill in required fields.');
      return;
    }
    const moduleId = Number(this.featureForm.get('moduleId').value ?? this.data?.moduleId);
    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      this.shared.showError('Missing module information.');
      return;
    }
    this.featureForm.get('moduleId').setValue(moduleId);
    const urlsControl = this.featureForm.get('urls');
    const urlsValue = urlsControl?.value;
    const urls = Array.isArray(urlsValue)
      ? urlsValue.map((url: string) => String(url).trim()).filter(Boolean)
      : String(urlsValue ?? '').split(',').map(url => url.trim()).filter(Boolean);
    urlsControl?.setValue(urls);
    this.loading = true;
    if (this.isEdit && this.featureId) {
      const payload = {
        ...this.featureForm.value,
        id: this.featureId
      };
      this.service.updateFeature(this.featureId, payload).subscribe((res: any) => {
        this.loading = false;
        const updatedFeature: Feature | undefined = res?.data || res;
        if (res?.status === 'OK' || res?.status === 200 || updatedFeature) {
          this.shared.showSuccess(res?.message || 'Feature updated');
          this.dialogRef.close(updatedFeature || true);
        } else {
          this.shared.showError(res?.message || 'Failed to update feature');
        }
      }, error => {
        this.loading = false;
        this.shared.showError(error.error?.message || 'Failed to update feature');
      });
      return;
    }
    this.service.addFeature(this.featureForm.value).subscribe((res: any) => {
      this.loading = false;
      const newFeature: Feature | undefined = res?.data || res;
      if (res?.status === 'OK' || res?.status === 200 || newFeature) {
        this.shared.showSuccess(res?.message || 'Feature added');
        this.dialogRef.close(newFeature || true);
      } else {
        this.shared.showError(res?.message || 'Failed to add feature');
      }
    }, error => {
      this.loading = false;
      this.shared.showError(error.error?.message || 'Failed to add feature');
    });
  }

  onCloseAddModule() {
    this.dialogRef.close(false);
  }

  private mapStatus(status: any): Status {
    const normalized = String(status ?? '').toUpperCase();
    if (normalized === Status.ACTIVE) {
      return Status.ACTIVE;
    }
    if (normalized === Status.INACTIVE) {
      return Status.INACTIVE;
    }
    if (normalized === Status.OPTIONAL) {
      return Status.OPTIONAL;
    }
    return Status.ACTIVE;
  }

  private extractParentId(parent: any): number | null {
    if (!parent) {
      return null;
    }
    const parentId = parent?.id ?? parent?.featureId ?? parent?.parentId ?? parent;
    const parsed = Number(parentId);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeUrls(value: any): string[] {
    if (Array.isArray(value)) {
      return value
        .map(url => String(url).trim())
        .filter(url => url && url !== '[]');
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(url => url.trim())
        .filter(url => url && url !== '[]');
    }
    return [];
  }

  private resolveSlug(feature: any): string | null {
    const candidates = [
      feature?.slug,
      feature?.slugName,
      feature?.featureSlug,
      feature?.slug_name
    ];
    const match = candidates.find(candidate => typeof candidate === 'string' && candidate.trim().length);
    return match ? match.trim() : null;
  }
}
