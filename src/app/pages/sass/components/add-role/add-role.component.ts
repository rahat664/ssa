import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {NgClass, NgIf} from '@angular/common';
import {AlphabetOnlyDirective} from '../../../../shared/directives/alphabet-only.directive';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    AlphabetOnlyDirective
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss'
})
export class AddRoleComponent {
  loading = false;
  roleForm: FormGroup;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<AddRoleComponent>) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      isActive: [true, [Validators.required]]
    });
  }

  onSubmitRole() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      name: this.roleForm.get('name')?.value,
      isActive: this.roleForm.get('isActive')?.value === true
    });
  }

  onCloseAddRole() {
    this.dialogRef.close(false);
  }
}
