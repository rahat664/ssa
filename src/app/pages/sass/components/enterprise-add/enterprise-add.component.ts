import { Component } from '@angular/core';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AlphabetOnlyDirective} from '../../../../shared/directives/alphabet-only.directive';
import {NgClass, NgIf} from '@angular/common';
import {
  CountryISO,
  NgxMaterialIntlTelInputComponent,
} from 'ngx-material-intl-tel-input';
import {SharedService} from '../../../../shared/service/shared.service';
import {Enterprise} from '../../models/enterprise.model';
import {EnterpriseCreate} from '../../models/enterprise-create.model';
import {EnterpriseService} from '../../services/enterprise.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-enterprise-add',
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    AlphabetOnlyDirective,
    NgIf,
    NgxMaterialIntlTelInputComponent,
    NgClass,
  ],
  templateUrl: './enterprise-add.component.html',
  styleUrl: './enterprise-add.component.scss'
})
export class EnterpriseAddComponent {
  enterpriseForm: FormGroup;
  enterpriseCreateModel: EnterpriseCreate = new EnterpriseCreate();

  constructor(private fb: FormBuilder, private shared: SharedService, private enterprise: EnterpriseService,
              public dialogRef: MatDialogRef<EnterpriseAddComponent>) {
    this.enterpriseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['']
    });
  }

  onSubmitEnterprise() {
    this.loading = true;
    if (this.enterpriseForm.valid) {
      this.enterpriseCreateModel.name = this.enterpriseForm.get('name')?.value;
      this.enterpriseCreateModel.phone = this.enterpriseForm.get('phone')?.value;
      this.enterpriseCreateModel.phone = this.enterpriseCreateModel.phone.replace(/[\s-]/g, '');
      this.enterpriseCreateModel.email = this.enterpriseForm.get('email')?.value;
      this.enterpriseCreateModel.address = this.enterpriseForm.get('address')?.value;

      this.enterprise.createEnterprise(this.enterpriseCreateModel).subscribe({
        next: (result: Enterprise) => {
          this.loading = false;
          this.shared.showSuccess('Enterprise created successfully', 'Success');
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
}
