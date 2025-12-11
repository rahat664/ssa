import {Component, inject} from '@angular/core';
import {CardComponent} from '../../../../shared/card/card.component';
import {GetElementHeightDirective} from '../../../../shared/directives/get-element-height.directive';
import {ChipsComponent} from '../../../../shared/chips/chips.component';
import {EnterpriseService} from '../../services/enterprise.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Enterprise} from '../../models/enterprise.model';
import {ModuleSummary} from '../../models/modules.model';
import {NgForOf, NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {EnterpriseEditComponent} from '../enterprise-edit/enterprise-edit.component';
import {GiveMaxHeightDirective} from "../../../../shared/directives/give-max-height.directive";
import {SharedService} from '../../../../shared/service/shared.service';

@Component({
  selector: 'app-enterprise-detail',
  standalone: true,
  imports: [
    CardComponent,
    GetElementHeightDirective,
    ChipsComponent,
    NgForOf,
    GiveMaxHeightDirective,
    NgIf
  ],
  templateUrl: './enterprise-detail.component.html',
  styleUrl: './enterprise-detail.component.scss'
})
export class EnterpriseDetailComponent {
  readonly dialog = inject(MatDialog)
  height: any;
  enterpriseInfo: Enterprise;
  enterpriseModules: ModuleSummary[]
  activeModules: ModuleSummary[];
  inactiveModules: ModuleSummary[];
  enterpriseId: number | null = null;

  constructor(
    private service: EnterpriseService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private shared: SharedService
  ) {
  }

  ngOnInit() {
    const enterpriseIdParam = this.activatedRoute.snapshot.queryParams['id'];
    this.enterpriseId = enterpriseIdParam ? Number(enterpriseIdParam) : null;
    this.enterpriseInfo = history.state?.enterprise;
    this.getModulesSummary();
  }

  getModulesSummary() {
    if (!this.enterpriseId) {
      this.shared.showError('Missing enterprise information.');
      return;
    }
    this.service.getModulesByEnterpriseId(this.enterpriseId).subscribe((res: any) => {
      this.enterpriseModules = res?.data as ModuleSummary[];
      this.splitTypeWiseModules(this.enterpriseModules);
    });
  }

  onClickEnterpriseEdit() {
    this.dialog.open(EnterpriseEditComponent, {
      data: {enterprise: this.enterpriseInfo},
      width:'30vw'
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.enterpriseInfo = result?.data as Enterprise;
      }
    })
  }
  private splitTypeWiseModules(data) {
    this.activeModules = data?.filter((module: ModuleSummary) => module.active) || [];
    this.inactiveModules = data?.filter((module: ModuleSummary) => !module.active) || [];
  }

  onClickToggle($event: any) {
    if (!this.enterpriseId) {
      this.shared.showError('Missing enterprise information.');
      return;
    }
    const moduleFeatures = $event?.module?.features || [];
    const featureIds = moduleFeatures.map((feature: any) => feature.id);
    const body = $event.isActive ? {
      enterpriseId: this.enterpriseId,
      allowFeatureIds: featureIds,
      denyFeatureIds: []
    } : {
      enterpriseId: this.enterpriseId,
      allowFeatureIds: [],
      denyFeatureIds: featureIds
    };

    this.service.addEnterpriseIdFeature(body).subscribe((res: any) => {
      if (res?.status == "OK") {
        this.shared.showSuccess('Module updated successfully!');
        this.getModulesSummary();
      } else {
        this.shared.showError(res?.message || 'Module not updated!');
        this.getModulesSummary();
      }
    }, error => {
      this.shared.showError(error?.error?.message || 'Module not updated!');
      this.getModulesSummary();
    });
  }

  onCustomize(module: ModuleSummary) {
    if (!this.enterpriseId) {
      this.shared.showError('Missing enterprise information.');
      return;
    }
    const enterpriseType = this.enterpriseInfo?.enterpriseType || '';
    if (!enterpriseType) {
      this.shared.showError('Missing enterprise type for customization.');
      return;
    }
    this.router.navigate([`/enterprise-detail/features/${module.id}/${enterpriseType}`], {
      state: {moduleSummary: module, enterpriseId: this.enterpriseId, enterpriseType},
      queryParams: {enterpriseId: this.enterpriseId}
    });
  }
}
