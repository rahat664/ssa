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
    activeModules: any[] = [];
    inactiveModules: any[] = [];
    isLoading = false;
    errorMessage = '';
    selectedEnterpriseType: string = '';

    constructor(private service: EnterpriseService, private shared: SharedService, private router: Router) {
    }

    ngOnInit() {
        this.getEnterprises();
    }

    onChangeEnterprise($event: MatSelectChange<any>) {
        this.enterpriseId = $event.value;
        this.getRoles(this.enterpriseId);
    }

    onAddRoles() {

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
        this.service.getRolesByEnterpriseId(enterpriseId).subscribe({
            next: (res: any) => {
                const data = res?.data?.content || res?.data?.responses || res?.data || [];
                const roles = Array.isArray(data) ? data : [];
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
                this.activeModules = allModules.filter((mod: ModuleSummary) => {
                    return mod.activeFeature > 0;
                });
                this.inactiveModules = allModules.filter((mod: ModuleSummary) => {
                    return mod.activeFeature === 0;
                });
            },
            error: () => {
                this.errorMessage = 'Failed to load roles.';
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }
}
