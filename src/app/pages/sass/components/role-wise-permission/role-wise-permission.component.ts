import {Component} from '@angular/core';
import {GetElementHeightDirective} from "../../../../shared/directives/get-element-height.directive";
import {GiveMaxHeightDirective} from "../../../../shared/directives/give-max-height.directive";
import {NgForOf, NgIf} from "@angular/common";
import {EnterpriseService} from '../../services/enterprise.service';
import {CardComponent} from '../../../../shared/card/card.component';
import {MatFormField} from '@angular/material/form-field';
import {MatOption} from '@angular/material/core';
import {MatSelect, MatSelectChange} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {Enterprise} from '../../models/enterprise.model';

@Component({
  selector: 'app-role-wise-permission',
  imports: [
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    CardComponent,
    MatFormField,
    MatOption,
    MatSelect,
    MatFormField,
    MatSelect,
    FormsModule
  ],
  templateUrl: './role-wise-permission.component.html',
  styleUrl: './role-wise-permission.component.scss'
})
export class RoleWisePermissionComponent {
  height: string = '0px';
  enterpriseId: number = -1;
  enterprise: Enterprise[] = [];
  activeModules: any;
  inactiveModules: any;
  constructor(private service: EnterpriseService) {
  }

  ngOnInit() {
    this.getEnterprises();
  }

  private getRoles(enterpriseId?: number) {
    this.service.getRolesByEnterpriseId(enterpriseId).subscribe((res: any) => {
      const data = res?.data?.content || res?.data?.responses || res?.data || [];
    });
  }

  onChangeEnterprise($event: MatSelectChange<any>) {
    this.enterpriseId = $event.value;
    this.getRoles(this.enterpriseId);
  }

  onAddRoles() {

  }

  onClickToggle($event: any) {

  }

  onCustomize($event: any) {

  }

  private getEnterprises() {
    this.service.getAllEnterprises().subscribe((res: any) => {
      this.enterprise = res?.data?.content || res?.data || [];
      this.enterpriseId = this.enterprise[0]?.id;
      this.getRoles(this.enterprise[0]?.id)
    })
  }
}
