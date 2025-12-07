import {Component, inject} from '@angular/core';
import {CardComponent} from "../../../../shared/card/card.component";
import {ChipsComponent} from "../../../../shared/chips/chips.component";
import {GetElementHeightDirective} from "../../../../shared/directives/get-element-height.directive";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {ModuleSummary} from '../../models/modules.model';
import {EnterpriseService} from '../../services/enterprise.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatOption} from '@angular/material/core';
import {MatSelect, MatSelectChange} from '@angular/material/select';
import {AddModuleComponent} from '../add-module/add-module.component';
import {MatDialog} from '@angular/material/dialog';
import {SharedService} from '../../../../shared/service/shared.service';
import {GiveMaxHeightDirective} from '../../../../shared/directives/give-max-height.directive';
import {Router} from '@angular/router';

@Component({
  selector: 'app-type-wise-permission',
  imports: [
    CommonModule,
    CardComponent,
    GetElementHeightDirective,
    NgForOf,
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    FormsModule,
    GiveMaxHeightDirective
  ],
  templateUrl: './type-wise-permission.component.html',
  styleUrl: './type-wise-permission.component.scss'
})
export class TypeWisePermissionComponent {
  readonly dialog = inject(MatDialog);
  activeModules: ModuleSummary[] = [];
  inactiveModules: ModuleSummary[] = [];
  height: any;
  enterpriseTypes: string[] = ['Hybrid', 'Customer', 'Transporter'];
  enterpriseName: string = 'Hybrid';

  constructor(private service: EnterpriseService, private shared: SharedService, private router: Router) {
  }

  ngOnInit() {
    this.service.getEnterpriseByType(this.enterpriseName).subscribe((res: any) => {
      this.splitTypeWiseModules(res.data);
    });
  }


  onChangeEnterpriseType($event: MatSelectChange<any>) {
    const selectedType = $event.value;
    this.enterpriseName = selectedType;
    this.service.getEnterpriseByType(this.enterpriseName).subscribe((res: any) => {
      this.splitTypeWiseModules(res.data);
    });
  }

  onAddModules() {
    this.dialog.open(AddModuleComponent, {
      width: '30vw'
    }).afterClosed().subscribe((res: any) => {
      if (res) {
        const body = {
          name: res.name,
        }
        this.service.addModule(body).subscribe((res: any) => {
          if (res.status == "OK") {
            this.shared.showSuccess('Module added successfully!');
            this.service.getEnterpriseByType(this.enterpriseName).subscribe((resp: any) => {
              this.splitTypeWiseModules(resp.data);
            });
          } else {
            this.shared.showError(res.message || 'Module not added!');
          }
        }, error => {
          this.shared.showError(error.error.message || 'Module not added!');
        })
      } else {
        this.shared.showError('Module not added!');
      }
    });
  }


  private splitTypeWiseModules(data) {
    this.activeModules = data?.filter((module: ModuleSummary) => module.active) || [];
    this.inactiveModules = data?.filter((module: ModuleSummary) => !module.active) || [];
  }

  onCustomize($event: ModuleSummary) {
    const moduleSummary = $event;
    this.router.navigate([`/type-wise-permission/features/${$event.id}`, { enterpriseType: this.enterpriseName}], { state: { $event: moduleSummary }});
  }

  onClickToggle($event: any) {
    let body = {};
    if ($event.isActive) {
      const featureIds = $event.module.features.map(feature => feature.id);
      body = {
        enterpriseType: this.enterpriseName,
        featureIds: featureIds
      }
    } else {
      body = {
        enterpriseType: this.enterpriseName,
        featureIds: []
      }
    }
    this.service.typeFeatureAdd(body).subscribe((res: any) => {
      if (res.status == "OK") {
        this.shared.showSuccess('Module updated successfully!');
        this.service.getEnterpriseByType(this.enterpriseName).subscribe((resp: any) => {
          this.splitTypeWiseModules(resp.data);
        });
      } else {
        this.shared.showError(res.message || 'Module not updated!');
      }
    })
  }
}
