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
import {ModuleSummary} from '../../models/modules.model';
import {SharedService} from '../../../../shared/service/shared.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AddRoleComponent} from '../add-role/add-role.component';

@Component({
    selector: 'app-role-wise-permission',
    standalone: true,
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
    roles: Array<{ id: number; name: string }> = [];
    selectedRoleId: number | 'all' = 'all';
    allActiveModules: ModuleSummary[] = [];
    allInactiveModules: ModuleSummary[] = [];
    activeModules: any[] = [];
    inactiveModules: any[] = [];
    isLoading = false;
    errorMessage = '';
    selectedEnterpriseType: string = '';

    constructor(
        private service: EnterpriseService,
        private shared: SharedService,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.getEnterprises();
    }

    onChangeEnterprise($event: MatSelectChange<any>) {
        this.enterpriseId = $event.value;
        this.getRoles(this.enterpriseId);
    }

    onChangeRole($event: MatSelectChange<any>) {
        this.selectedRoleId = $event.value;
        this.applyRoleFilter();
    }

    onAddRoles() {
        if (!this.enterpriseId || this.enterpriseId === -1) {
            this.shared.showError('Select an enterprise before adding a role.');
            return;
        }
        this.dialog.open(AddRoleComponent, {
            width: '30vw'
        }).afterClosed().subscribe((res: any) => {
            if (!res) {
                return;
            }
            const roleName = String(res?.name || '').trim();
            if (!roleName) {
                this.shared.showError('Role name is required.');
                return;
            }
            const body = {
                name: roleName,
                isActive: res?.isActive === true,
                enterpriseId: this.enterpriseId,
                featureIds: []
            };
            this.service.addRole(body).subscribe((resp: any) => {
                if (resp?.status === 'OK' || resp?.status === 200) {
                    this.shared.showSuccess(resp?.message || 'Role added successfully!');
                    this.getRoles(this.enterpriseId);
                } else {
                    this.shared.showError(resp?.message || 'Role not added!');
                }
            }, error => {
                this.shared.showError(error?.error?.message || 'Role not added!');
            });
        });
    }

    onClickToggle($event: { module: ModuleSummary; isActive: boolean; roleId: number; roleName?: string }) {
        if (!$event?.module || !$event?.roleId) {
            this.shared.showError('Missing role or module information.');
            return;
        }
        const featureIds = ($event.module?.features || []).map(feature => feature.id);
        const body = $event.isActive ? {
            id: $event.roleId,
            allowFeatureIds: featureIds,
            denyFeatureIds: []
        } : {
            id: $event.roleId,
            allowFeatureIds: [],
            denyFeatureIds: featureIds
        };

        this.service.roleFeatureUpdate(body).subscribe((res: any) => {
            if (res?.status == "OK" || res?.status === 200) {
                this.shared.showSuccess('Role updated successfully!');
                this.getRoles(this.enterpriseId);
            } else {
                this.shared.showError(res?.message || 'Role not updated!');
                this.getRoles(this.enterpriseId);
            }
        }, error => {
            this.shared.showError(error?.error?.message || 'Role not updated!');
            this.getRoles(this.enterpriseId);
        });
    }

    onCustomize(roleModule: any) {
        const moduleIdForNav = roleModule?.id ?? roleModule?.moduleId;
        if (!moduleIdForNav || !roleModule?.roleId) {
            this.shared.showError('Missing role or module information.');
            return;
        }
        const enterpriseType = this.selectedEnterpriseType || roleModule?.enterpriseType || '';
        if (!enterpriseType) {
            this.shared.showError('Missing enterprise type for customization.');
            return;
        }
        this.router.navigate([`/role-wise-permission/features/${moduleIdForNav}/${enterpriseType}`], {
            state: {
                moduleSummary: roleModule,
                enterpriseId: this.enterpriseId,
                enterpriseType,
                roleId: roleModule.roleId,
                roleName: roleModule.roleName || roleModule.name
            },
            queryParams: {enterpriseId: this.enterpriseId, roleId: roleModule.roleId}
        });
    }

    private getEnterprises() {
        this.service.getAllEnterprises().subscribe((res: any) => {
            this.enterprise = res?.data?.content || res?.data || [];
            this.enterpriseId = this.enterprise[0]?.id;
            this.selectedEnterpriseType = this.enterprise[0]?.enterpriseType || '';
            this.getRoles(this.enterprise[0]?.id)
        })
    }

    private refreshSelectedEnterpriseType() {
        const matched = this.enterprise.find(ent => ent.id === this.enterpriseId);
        this.selectedEnterpriseType = matched?.enterpriseType || '';
    }

    private getRoles(enterpriseId?: number) {
        this.refreshSelectedEnterpriseType();
        this.isLoading = true;
        this.errorMessage = '';
        this.activeModules = [];
        this.inactiveModules = [];
        this.allActiveModules = [];
        this.allInactiveModules = [];
        this.service.getRolesByEnterpriseId(enterpriseId).subscribe({
            next: (res: any) => {
                const data = res?.data?.content || res?.data?.responses || res?.data || [];
                const roles = Array.isArray(data) ? data : [];
                this.roles = roles.map((role: any) => ({id: role.id, name: role.name}));
                const allModules = [];
                roles.forEach((role: any) => {
                    if (Array.isArray(role?.moduleFeatures)) {
                        role.moduleFeatures.forEach((mod: ModuleSummary) => {
                            mod.roleId = role.id;
                            mod.roleName = role.name;
                            allModules.push(mod);
                        });
                    }
                });
                //filter if module.activeFeature is greater than 0
                this.allActiveModules = allModules.filter((mod: ModuleSummary) => {
                    return mod.activeFeature > 0;
                });
                this.allInactiveModules = allModules.filter((mod: ModuleSummary) => {
                    return mod.activeFeature === 0;
                });
                const roleIds = new Set(this.roles.map(role => role.id));
                const firstRoleId = this.roles[0]?.id;
                if (this.selectedRoleId === 'all' || !roleIds.has(this.selectedRoleId)) {
                    this.selectedRoleId = firstRoleId ?? 'all';
                }
                this.applyRoleFilter();
            },
            error: () => {
                this.errorMessage = 'Failed to load roles.';
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

    private applyRoleFilter() {
        if (this.selectedRoleId === 'all') {
            this.activeModules = [...this.allActiveModules];
            this.inactiveModules = [...this.allInactiveModules];
            return;
        }
        this.activeModules = this.allActiveModules.filter((mod: ModuleSummary) => mod.roleId === this.selectedRoleId);
        this.inactiveModules = this.allInactiveModules.filter((mod: ModuleSummary) => mod.roleId === this.selectedRoleId);
    }
}
