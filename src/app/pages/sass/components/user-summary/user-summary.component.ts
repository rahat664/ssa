import {Component} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {GetElementHeightDirective} from '../../../../shared/directives/get-element-height.directive';
import {GiveMaxHeightDirective} from '../../../../shared/directives/give-max-height.directive';
import {EnterpriseService} from '../../services/enterprise.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CardComponent} from '../../../../shared/card/card.component';
import {ModuleSummary} from '../../models/modules.model';
import {User} from '../../models/user.model';
import {forkJoin} from 'rxjs';
import {SharedService} from '../../../../shared/service/shared.service';
import {MatFormField} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-user-summary',
  standalone: true,
  imports: [
    CommonModule,
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    MatFormField,
    MatOption,
    MatSelect,
    NgForOf,
    NgIf,
    FormsModule,
    CardComponent
  ],
  templateUrl: './user-summary.component.html',
  styleUrls: ['./user-summary.component.scss']
})
export class UserSummaryComponent {
  height: string = '0px';
  user: User | null = null;
  userId: any | null = null;
  numericUserId: number | null = null;
  enterpriseId: number | null = null;
  enterpriseType: string = '';
  userRoles: string[] = [];
  assignedRoles: any[] = [];
  availableRoles: any[] = [];
  unassignedRoles: any[] = [];
  selectedRoleIds: number[] = [];
  activeModules: any[] = [];
  inactiveModules: any[] = [];
  isLoading = false;
  rolesLoading = false;
  roleActionInProgress = false;
  removingRoleId: number | null = null;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private service: EnterpriseService, private shared: SharedService, private router: Router) {}

  ngOnInit() {
    this.user = history.state?.user || null;
    const queryEnterpriseIdParam = this.route.snapshot.queryParamMap.get('enterpriseId');
    const queryEnterpriseId = queryEnterpriseIdParam ? Number(queryEnterpriseIdParam) : null;
    this.enterpriseId = history.state?.enterpriseId || queryEnterpriseId || null;
    this.enterpriseType = history.state?.enterpriseType
      || this.route.snapshot.queryParamMap.get('enterpriseType')
      || (this.user as any)?.enterprise?.enterpriseType
      || '';

    this.establishUserIds();
    if (this.user) {
      const initialRoles = this.user.roles || (this.user as any).authorities || [];
      this.assignedRoles = Array.isArray(initialRoles) ? initialRoles : [];
      this.userRoles = this.buildRoleNames(initialRoles);
      this.refreshRoleOptions();
    }
    if (this.user && (this.user as any).modules) {
      this.setModulesFromUser(this.user);
    }
    this.loadAvailableRoles();
    const userIdForLoad = this.numericUserId ?? this.userId;
    if (userIdForLoad !== null && userIdForLoad !== undefined) {
      this.loadUserDetails(userIdForLoad);
    } else {
      this.shared.showError('Missing user information.');
    }
  }

  private fetchRolesAndPermissions(userId: number | string | null) {
    const resolvedUserId = this.numericUserId ?? this.getNumericUserIdFromValue(userId);
    if (!resolvedUserId) {
      this.errorMessage = 'Missing user information.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.activeModules = [];
    this.inactiveModules = [];
    this.service.getRoleByUserId(userId).subscribe({
      next: (res: any) => {
        const roles = res?.data || res || [];
        const roleIds = Array.isArray(roles) ? roles.map((r: any) => r.id).filter((id: any) => id !== undefined) : [];
        const roleNames = this.buildRoleNames(roles);
        this.assignedRoles = Array.isArray(roles) ? roles : [];
        if (roleNames.length) {
          this.userRoles = roleNames;
        }
        this.refreshRoleOptions();
        if (!roleIds.length) {
          this.activeModules = [];
          this.inactiveModules = [];
          this.isLoading = false;
          return;
        }
        this.service.getUserSummaryByEnterpriseId(this.enterpriseId, resolvedUserId).subscribe(
          (res2: any) => {
            const modules = res2?.data || res2 || [];
            const activeModules = modules.filter((m: ModuleSummary) => m?.active !== false);
            const inactiveModules = modules.filter((m: ModuleSummary) => m?.active === false);
            this.activeModules = activeModules;
            this.inactiveModules = inactiveModules;
            this.isLoading = false
          },
          () => {
            // Ignore error here, will fetch per role below
            this.isLoading = false;
          }
        )
      },
      error: () => {
        this.errorMessage = 'Failed to load user roles.';
        this.isLoading = false;
      }
    });
  }

  private loadUserDetails(userId: number | string | null) {
    const resolvedUserId = this.numericUserId ?? this.getNumericUserIdFromValue(userId);
    if (!resolvedUserId) {
      this.shared.showError('Missing user information.');
      return;
    }
    this.service.getUserById(resolvedUserId).subscribe({
      next: (res: any) => {
        const userData = res?.data || res || null;
        if (userData) {
          this.user = userData;
          this.userId = this.userId ?? userData?.id ?? userData?.userId ?? null;
          this.numericUserId = this.getNumericUserIdFromValue(userData?.id) ?? this.numericUserId;
          this.enterpriseType = this.enterpriseType || (userData as any)?.enterprise?.enterpriseType || '';
          if (!this.enterpriseId && (userData as any)?.enterprise?.id) {
            this.enterpriseId = Number((userData as any)?.enterprise?.id);
            this.loadAvailableRoles();
          }
          const rolesFromUser = this.buildRoleNames(userData?.roles || userData?.authorities || []);
          if (rolesFromUser.length) {
            this.userRoles = rolesFromUser;
          }
          if ((userData as any)?.modules) {
            this.setModulesFromUser(userData);
          }
        }
        this.fetchRolesAndPermissions(resolvedUserId);
      },
      error: () => {
        this.shared.showError('Failed to load user details.');
        this.fetchRolesAndPermissions(resolvedUserId);
      }
    });
  }

  private setModulesFromUser(userData: any) {
    const modules = (userData?.modules as ModuleSummary[]) || [];
    this.activeModules = modules.filter((m: ModuleSummary) => m?.active !== false);
    this.inactiveModules = modules.filter((m: ModuleSummary) => m?.active === false);
    this.userRoles = this.buildRoleNames(userData?.roles || userData?.authorities || []);
  }

  onClickToggle($event: any) {
    const resolvedUserId = this.numericUserId ?? this.getNumericUserIdFromValue(this.userId);
    if (!resolvedUserId) {
      this.shared.showError('Missing user information.');
      return;
    }
    const module = $event?.module as ModuleSummary;
    if (!module) {
      this.shared.showError('Missing module information.');
      return;
    }
    const featureIds = (module.features || []).map(feature => feature.id);
    const body = $event?.isActive ? {
      userId: resolvedUserId,
      allowFeatureIds: featureIds,
      denyFeatureIds: []
    } : {
      userId: resolvedUserId,
      allowFeatureIds: [],
      denyFeatureIds: featureIds
    };
    this.service.updateUserPermission(body).subscribe((res: any) => {
      if (res?.status === 'OK' || res?.status === 200) {
        this.shared.showSuccess('User permissions updated successfully!');
        this.fetchRolesAndPermissions(resolvedUserId);
      } else {
        this.shared.showError(res?.message || 'User permissions not updated!');
        this.fetchRolesAndPermissions(resolvedUserId);
      }
    }, error => {
      this.shared.showError(error?.error?.message || 'User permissions not updated!');
      this.fetchRolesAndPermissions(resolvedUserId);
    });
  }

  onCustomize($event: any) {
    if (!this.userId) {
      this.shared.showError('Missing user information.');
      return;
    }
    const module = $event as ModuleSummary;
    if (!module?.id) {
      this.shared.showError('Missing module information.');
      return;
    }
    const enterpriseType = this.enterpriseType || '';
    if (!enterpriseType) {
      this.shared.showError('Missing enterprise type for customization.');
      return;
    }
    this.router.navigate([`/user-wise-permission/features/${module.id}/${enterpriseType}`], {
      state: {
        moduleSummary: module,
        enterpriseId: this.enterpriseId,
        enterpriseType,
        userId: this.numericUserId ?? this.userId,
        userName: this.user?.name || this.user?.username || ''
      },
      queryParams: {
        enterpriseId: this.enterpriseId,
        userId: this.numericUserId ?? this.userId,
        enterpriseType
      }
    });
  }

  onAssignRoles() {
    const resolvedUserId = this.numericUserId ?? this.getNumericUserIdFromValue(this.userId);
    if (!resolvedUserId) {
      this.shared.showError('Missing user information.');
      return;
    }
    if (!this.selectedRoleIds.length) {
      this.shared.showInfo('Select at least one role to assign.');
      return;
    }
    this.roleActionInProgress = true;
    this.removingRoleId = null;
    this.service.assignRoleToUser({
      userId: resolvedUserId,
      enterpriseId: this.enterpriseId || undefined,
      allowRoleIds: this.selectedRoleIds,
      denyRoleIds: [],
    }).subscribe({
      next: (res: any) => {
        if (res?.status === 'OK' || res?.status === 200) {
          this.shared.showSuccess(res?.message || 'Roles assigned successfully!');
        } else {
          this.shared.showSuccess(res?.message || 'Roles updated successfully!');
        }
        this.selectedRoleIds = [];
        this.fetchRolesAndPermissions(resolvedUserId);
        this.loadAvailableRoles();
      },
      error: (error) => {
        this.shared.showError(error?.error?.message || 'Failed to assign roles.');
        this.roleActionInProgress = false;
      },
      complete: () => {
        this.roleActionInProgress = false;
      }
    });
  }

  onRemoveRole(roleId?: number) {
    const resolvedUserId = this.numericUserId ?? this.getNumericUserIdFromValue(this.userId);
    if (!resolvedUserId) {
      this.shared.showError('Missing user information.');
      return;
    }
    if (roleId === undefined || roleId === null) {
      this.shared.showError('Missing role information.');
      return;
    }
    this.roleActionInProgress = true;
    this.removingRoleId = roleId ?? null;
    this.service.assignRoleToUser({
      userId: resolvedUserId,
      enterpriseId: this.enterpriseId || undefined,
      allowRoleIds: [],
      denyRoleIds: [roleId]
    }).subscribe({
      next: (res: any) => {
        if (res?.status === 'OK' || res?.status === 200) {
          this.shared.showSuccess(res?.message || 'Role removed successfully!');
        } else {
          this.shared.showSuccess(res?.message || 'Roles updated successfully!');
        }
        this.fetchRolesAndPermissions(resolvedUserId);
        this.loadAvailableRoles();
      },
      error: (error) => {
        this.shared.showError(error?.error?.message || 'Failed to remove role.');
        this.roleActionInProgress = false;
        this.removingRoleId = null;
      },
      complete: () => {
        this.roleActionInProgress = false;
        this.removingRoleId = null;
      }
    });
  }

  private buildRoleNames(roles: any[]): string[] {
    if (!Array.isArray(roles)) {
      return [];
    }
    return roles
      .map(r => {
        if (typeof r === 'string') return r;
        return r?.name || r?.authority;
      })
      .filter((name): name is string => !!name)
      .map(name => name.trim());
  }

  private refreshRoleOptions() {
    if (!Array.isArray(this.availableRoles)) {
      this.unassignedRoles = [];
      return;
    }
    const assignedIds = new Set(this.assignedRoles
      .map((r: any) => r?.id)
      .filter((id: any) => id !== undefined));
    this.unassignedRoles = this.availableRoles.filter((role: any) => !assignedIds.has(role?.id));
  }

  private loadAvailableRoles() {
    if (!this.enterpriseId) {
      return;
    }
    this.rolesLoading = true;
    this.service.getRolesByEnterpriseId(this.enterpriseId).subscribe({
      next: (res: any) => {
        const roles = res?.data?.content || res?.data?.responses || res?.data || [];
        this.availableRoles = Array.isArray(roles) ? roles : [];
        this.refreshRoleOptions();
      },
      error: () => {
        this.shared.showError('Failed to load available roles.');
        this.rolesLoading = false;
      },
      complete: () => this.rolesLoading = false
    });
  }

  private establishUserIds() {
    const routeUserId = this.route.snapshot.paramMap.get('userId');
    const queryUserId = this.route.snapshot.queryParamMap.get('userId');
    const firstUserId = this.user?.id ?? null;
    this.userId = firstUserId ?? this.user?.userId ?? routeUserId ?? queryUserId ?? null;
    this.numericUserId = this.getNumericUserIdFromValue(this.user?.id)
      ?? this.getNumericUserIdFromValue(routeUserId)
      ?? this.getNumericUserIdFromValue(queryUserId)
      ?? this.getNumericUserIdFromValue(this.user?.userId);
  }

  private getNumericUserIdFromValue(value: any): number | null {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value.includes('-') ? value.split('-').pop() : value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }
}
