import {Component, inject} from '@angular/core';
import {CommonModule, NgClass} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Feature, ModuleSummary} from '../../models/modules.model';
import {MatDialog} from '@angular/material/dialog';
import {AddFeatureComponent} from '../add-feature/add-feature.component';
import {EnterpriseService} from '../../services/enterprise.service';
import {SharedService} from '../../../../shared/service/shared.service';

interface FieldOption {
  id: number;
  title: string;
  isActive: boolean;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
  readonly dialog = inject(MatDialog)
  private enterPriseType: string = '';
  private moduleId: number | null = null;
  private enterpriseId: number | null = null;
  private roleId: number | null = null;
  private userId: number | null = null;
  private isEnterpriseContext = false;
  private isRoleContext = false;
  private isUserContext = false;
  private initialModuleState: ModuleSummary | null = null;
  moduleDetails: ModuleSummary = {} as ModuleSummary;
  featureList: Feature[] = [];
  activeCount: number = 0;
  inactiveCount: number = 0;
  moduleName: string = '';
  totalOptions: number | undefined;
  constructor(private route: ActivatedRoute, private service: EnterpriseService, private shared: SharedService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const navState: any = history.state || {};
      this.initialModuleState = navState.moduleSummary || null;
      this.enterPriseType = paramMap.get('enterpriseType') || navState.enterpriseType || '';
      const moduleIdParam = paramMap.get('moduleId') || navState.moduleId;
      this.moduleId = moduleIdParam ? Number(moduleIdParam) : null;
      const enterpriseIdParam = paramMap.get('enterpriseId') || navState.enterpriseId || this.route.snapshot.queryParamMap.get('enterpriseId');
      this.enterpriseId = enterpriseIdParam ? Number(enterpriseIdParam) : null;
      const roleIdParam = navState.roleId || this.route.snapshot.queryParamMap.get('roleId');
      this.roleId = roleIdParam ? Number(roleIdParam) : null;
      const userIdParam = navState.userId || this.route.snapshot.queryParamMap.get('userId');
      this.userId = userIdParam ? Number(userIdParam) : null;
      this.isRoleContext = !!this.roleId;
      this.isUserContext = !!this.userId;
      this.isEnterpriseContext = !!this.enterpriseId && !this.isRoleContext && !this.isUserContext;

      if (!this.moduleId || (!this.enterPriseType && !this.isEnterpriseContext && !this.isRoleContext && !this.isUserContext)) {
        this.shared.showError('Missing enterprise, role, user, or module information for features.');
        return;
      }
      this.getFeatureList();
    });
  }


  toggleField(field: Feature): void {
    if (!this.moduleId || (!this.enterPriseType && !this.isEnterpriseContext && !this.isRoleContext && !this.isUserContext)) {
      this.shared.showError('Missing enterprise, role, user, or module information for features.');
      return;
    }
    if (!field) return;
    field.status = field.status === 'active' ? 'inactive' : 'active';
    const allowFeatureIds = this.featureList.filter(f => f.status === 'active').map(f => f.id);
    const denyFeatureIds = this.featureList.filter(f => f.status === 'inactive').map(f => f.id);
    this.persistFeatureSelection(allowFeatureIds, denyFeatureIds);
  }

  onClickAddFeature() {
    const dialogRef = this.dialog.open(AddFeatureComponent, {
      width: '30vw',
      data: {moduleId: this.moduleId, enterpriseType: this.enterPriseType}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // if a specific feature was returned, add to list, else refresh
        if (result?.id) {
          this.featureList.push({
            id: result.id,
            name: result.name,
            status: 'inactive'
          } as Feature);
        }
        this.updateFeaturePermissions();
      } else {
        // Dialog was closed without adding a feature
      }
    })
  }

  private getFeatureList() {
    if (!this.moduleId) {
      this.shared.showError('Missing module information for features.');
      return;
    }
    if (this.isUserContext) {
      this.loadUserModule();
      return;
    }
    if (this.isRoleContext) {
      if (this.enterpriseId) {
        this.loadRoleModuleFromEnterprise();
        return;
      }
      if (this.initialModuleState) {
        this.populateModuleDetails(this.initialModuleState);
        return;
      }
      this.shared.showError('Missing enterprise information for this role.');
      return;
    }
    if (this.isEnterpriseContext) {
      if (!this.enterpriseId) {
        this.shared.showError('Missing enterprise information for features.');
        return;
      }
      this.service.getModulesByEnterpriseId(this.enterpriseId).subscribe((res: any) => {
        const modules = res?.data as ModuleSummary[] || [];
        const currentModule = modules.find((module: ModuleSummary) => module.id === this.moduleId);
        if (!currentModule) {
          this.shared.showError('Module not found for this enterprise.');
          return;
        }
        this.populateModuleDetails(currentModule);
      }, () => this.shared.showError('Failed to load enterprise features.'));
      return;
    }
    if (!this.enterPriseType) {
      this.shared.showError('Missing enterprise type for features.');
      return;
    }
    this.service.getFeatureByModuleIdAndType(this.moduleId, this.enterPriseType).subscribe((featureList: any) => {
      const module = featureList?.data?.[0] as ModuleSummary;
      if (!module) {
        this.shared.showError('Failed to load features for this module.');
        return;
      }
      this.populateModuleDetails(module);
    }, () => this.shared.showError('Failed to load features for this module.'));
  }

  private populateModuleDetails(module: ModuleSummary) {
    this.moduleDetails = module;
    this.totalOptions = this.moduleDetails?.totalFeature;
    this.moduleName = this.moduleDetails?.name;
    this.activeCount = this.moduleDetails?.activeFeature;
    this.inactiveCount = this.moduleDetails?.inactiveFeature;
    this.featureList = this.moduleDetails?.features || [];
  }

  private updateFeaturePermissions() {
    if (!this.moduleId || (!this.enterPriseType && !this.isEnterpriseContext && !this.isRoleContext && !this.isUserContext)) {
      this.shared.showError('Missing enterprise, role, user, or module information for features.');
      return;
    }
    const allowFeatureIds = this.featureList.filter(f => f.status === 'active').map(f => f.id);
    const denyFeatureIds = this.featureList.filter(f => f.status === 'inactive').map(f => f.id);
    this.persistFeatureSelection(allowFeatureIds, denyFeatureIds);
  }

  private persistFeatureSelection(allowFeatureIds: number[], denyFeatureIds: number[]) {
    if (this.isUserContext) {
      if (!this.userId) {
        this.shared.showError('Missing user information for features.');
        return;
      }
      const body = {
        userId: this.userId,
        allowFeatureIds,
        denyFeatureIds
      };
      this.service.updateUserPermission(body).subscribe(() => {
        this.getFeatureList();
      }, () => this.shared.showError('Failed to update features for this user.'));
      return;
    }
    if (this.isRoleContext) {
      if (!this.roleId) {
        this.shared.showError('Missing role information for features.');
        return;
      }
      const body = {
        roleId: this.roleId,
        allowFeatureIds,
        denyFeatureIds
      };
      this.service.roleFeatureUpdate(body).subscribe(() => {
        this.getFeatureList();
      }, () => this.shared.showError('Failed to update features for this role.'));
      return;
    }
    if (this.isEnterpriseContext) {
      if (!this.enterpriseId) {
        this.shared.showError('Missing enterprise information for features.');
        return;
      }
      const body = {
        enterpriseId: this.enterpriseId,
        allowFeatureIds,
        denyFeatureIds
      };
      this.service.addEnterpriseIdFeature(body).subscribe(() => {
        this.getFeatureList();
      }, () => this.shared.showError('Failed to update features for this enterprise.'));
      return;
    }
    if (!this.enterPriseType) {
      this.shared.showError('Missing enterprise type for features.');
      return;
    }
    const body = {
      enterpriseType: this.enterPriseType,
      allowFeatureIds,
      denyFeatureIds
    };
    this.service.typeFeatureAdd(body).subscribe(() => {
      this.getFeatureList();
    }, () => this.shared.showError('Failed to update features.'));
  }

  private loadRoleModuleFromEnterprise() {
    if (!this.enterpriseId || !this.roleId || !this.moduleId) {
      this.shared.showError('Missing role or enterprise information for features.');
      return;
    }
    this.service.getRolesByEnterpriseId(this.enterpriseId).subscribe((res: any) => {
      const roles = res?.data?.content || res?.data?.responses || res?.data || [];
      const role = Array.isArray(roles) ? roles.find((r: any) => r?.id === this.roleId) : null;
      const module = role?.moduleFeatures?.find((m: any) => m?.id === this.moduleId);
      if (module) {
        this.populateModuleDetails(module as ModuleSummary);
        return;
      }
      if (this.initialModuleState) {
        this.populateModuleDetails(this.initialModuleState);
        this.shared.showError('Using cached module details; latest data not found for this role.');
      } else {
        this.shared.showError('Module not found for this role.');
      }
    }, () => {
      if (this.initialModuleState) {
        this.populateModuleDetails(this.initialModuleState);
        this.shared.showError('Using cached module details; failed to refresh from server.');
      } else {
        this.shared.showError('Failed to load role features.');
      }
    });
  }

  private loadUserModule() {
    if (!this.userId || !this.moduleId) {
      this.shared.showError('Missing user or module information for features.');
      return;
    }
    this.service.getUserSummaryById(this.userId).subscribe((res: any) => {
      const modules = res?.data || res || [];
      const module = Array.isArray(modules) ? modules.find((m: any) => m?.id === this.moduleId) : null;
      if (module) {
        this.populateModuleDetails(module as ModuleSummary);
        return;
      }
      if (this.initialModuleState) {
        this.populateModuleDetails(this.initialModuleState);
        this.shared.showError('Using cached module details; latest data not found for this user.');
      } else {
        this.shared.showError('Module not found for this user.');
      }
    }, () => {
      if (this.initialModuleState) {
        this.populateModuleDetails(this.initialModuleState);
        this.shared.showError('Using cached module details; failed to refresh from server.');
      } else {
        this.shared.showError('Failed to load user features.');
      }
    });
  }
}
