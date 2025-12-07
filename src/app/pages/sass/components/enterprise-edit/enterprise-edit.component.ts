import {Component, Inject} from '@angular/core';
import {AlphabetOnlyDirective} from "../../../../shared/directives/alphabet-only.directive";
import {MatInput} from "@angular/material/input";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {NgxMaterialIntlTelInputComponent, CountryISO} from "ngx-material-intl-tel-input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {EnterpriseCreate} from '../../models/enterprise-create.model';
import {SharedService} from '../../../../shared/service/shared.service';
import {EnterpriseService} from '../../services/enterprise.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Enterprise} from '../../models/enterprise.model';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatFormField} from '@angular/material/form-field';

@Component({
  selector: 'app-enterprise-edit',
  imports: [
    AlphabetOnlyDirective,
    MatFormField,
    MatInput,
    MatOption,
    MatSelect,
    NgForOf,
    NgIf,
    NgxMaterialIntlTelInputComponent,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './enterprise-edit.component.html',
  styleUrl: './enterprise-edit.component.scss'
})
export class EnterpriseEditComponent {
  enterpriseForm: FormGroup;
  enterpriseCreateModel: EnterpriseCreate = new EnterpriseCreate();

  constructor(private fb: FormBuilder, private shared: SharedService, private enterprise: EnterpriseService,
              public dialogRef: MatDialogRef<EnterpriseEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,) {
    this.enterpriseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      enterpriseType: ['Hybrid', [Validators.required]],
      address: ['']
    });
  }

  enterpriseTypes: string[] = ['Hybrid', 'Customer', 'Transporter'];

  onSubmitEnterprise() {
    this.loading = true;
    if (this.enterpriseForm.valid) {
      this.enterpriseCreateModel.name = this.enterpriseForm.get('name')?.value;
      this.enterpriseCreateModel.phone = this.enterpriseForm.get('phone')?.value;
      this.enterpriseCreateModel.phone = this.enterpriseCreateModel.phone.replace(/[\s-]/g, '');
      this.enterpriseCreateModel.email = this.enterpriseForm.get('email')?.value;
      this.enterpriseCreateModel.address = this.enterpriseForm.get('address')?.value;
      this.enterpriseCreateModel.enterpriseType = this.enterpriseForm.get('enterpriseType')?.value;

      this.enterprise.createEnterprise(this.enterpriseCreateModel).subscribe({
        next: (result: Enterprise) => {
          this.loading = false;
          this.shared.showSuccess('Enterprise updated successfully', 'Success');
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.loading = false;
          this.shared.showError(error.error.message || 'Failed to create enterprise', 'Error');
        }
      });
    } else {
      // Show error message if form is invalid\
      this.loading = false;
      this.enterpriseForm.markAllAsTouched();
      this.shared.showError('Please fill in all required fields correctly.', 'Error');

    }
  }

  ngOnInit() {
    this.shared.validateInterNationalPhoneNumber();
    this.fillDataFromDialogData();
  }

  getNameErrorMessage() {
    if (this.enterpriseForm.get('name').hasError('required')) {
      return 'Name required';
    } else if (this.enterpriseForm.get('name').hasError('minlength')) {
      return 'Invalid name';
    } else if (this.enterpriseForm.get('name').hasError('maxlength')) {
      return 'Invalid name';
    } else {
      return '';
    }
  }

  getEmailErrorMessage() {
    if (this.enterpriseForm.get('email').hasError('email')) {
      return 'Invalid email address';
    } else if (this.enterpriseForm.get('email').hasError('required')) {
      return 'Email required';
    } else {
      return '';
    }
  }

  get phoneNumber() {
    return this.enterpriseForm.get('phone');
  }

  textLabels = {
    mainLabel: 'Mobile number',
    codePlaceholder: 'Code',
    searchPlaceholderLabel: 'Search',
    noEntriesFoundLabel: 'No countries found',
    nationalNumberLabel: '',
    hintLabel: '',
    invalidNumberError: '',
    requiredError: 'This field is required',
  };

  protected readonly CountryISO = CountryISO;
  loading: boolean = false;

  onCloseAddEnterprise() {
    this.dialogRef.close();
  }

  getEnterpriseTypeErrorMessage() {
    if (this.enterpriseForm.get('enterpriseType').hasError('required')) {
      return 'Enterprise type required';
    } else {
      return '';
    }
  }

  private fillDataFromDialogData() {
    if (this.data) {
      const dialogData:Enterprise = this.data?.enterprise
      this.enterpriseForm.patchValue({
        name: dialogData?.name,
        phone: dialogData.phone,
        email: dialogData.email,
        address: dialogData.address,
        enterpriseType: dialogData.enterpriseType
      });
    }
  }
}
