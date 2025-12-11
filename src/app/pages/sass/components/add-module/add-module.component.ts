import { Component } from '@angular/core';
import {AlphabetOnlyDirective} from '../../../../shared/directives/alphabet-only.directive';
import {MatInput} from '@angular/material/input';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {NgxMaterialIntlTelInputComponent} from 'ngx-material-intl-tel-input';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-module',
  standalone: true,
  imports: [
    AlphabetOnlyDirective,
    MatFormField,
    MatInput,
    NgIf,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './add-module.component.html',
  styleUrl: './add-module.component.scss'
})
export class AddModuleComponent {
  loading: boolean = false;
  moduleForm: FormGroup;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<AddModuleComponent>) {
    this.moduleForm = this.fb.group({
      name: ['', [Validators.required]],
    });
  }

  onSubmitModule() {
    this.dialogRef.close({
      name: this.moduleForm.get('name')?.value
    });
  }

  onCloseAddModule() {
    this.dialogRef.close(false);
  }
}
