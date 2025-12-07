import {Component, inject} from '@angular/core';
import {CardComponent} from '../../../../shared/card/card.component';
import {GetElementHeightDirective} from '../../../../shared/directives/get-element-height.directive';
import {ChipsComponent} from '../../../../shared/chips/chips.component';
import {EnterpriseService} from '../../services/enterprise.service';
import {ActivatedRoute} from '@angular/router';
import {Enterprise} from '../../models/enterprise.model';
import {ModuleSummary} from '../../models/modules.model';
import {NgForOf, NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {EnterpriseEditComponent} from '../enterprise-edit/enterprise-edit.component';
import {GiveMaxHeightDirective} from "../../../../shared/directives/give-max-height.directive";

@Component({
  selector: 'app-enterprise-detail',
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
  constructor(private service: EnterpriseService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.getModulesSummary();
  }

  getModulesSummary() {
    const enterpriseId = this.activatedRoute.snapshot.queryParams['id'];
    this.enterpriseInfo = history.state?.enterprise;
    this.service.getModulesByEnterpriseId(enterpriseId).subscribe((res: any) => {
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
    
  }
}
