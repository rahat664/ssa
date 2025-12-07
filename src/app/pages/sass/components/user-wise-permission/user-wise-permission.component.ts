import {Component} from '@angular/core';
import {GetElementHeightDirective} from '../../../../shared/directives/get-element-height.directive';
import {GiveMaxHeightDirective} from '../../../../shared/directives/give-max-height.directive';
import {NgForOf, NgIf} from '@angular/common';
import {
  UserRoleCard,
  UserRoleCardComponent
} from '../../../../shared/user-role-card/user-role-card.component';
import {EnterpriseService} from '../../services/enterprise.service';

@Component({
  selector: 'app-user-wise-permission',
  imports: [
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    UserRoleCardComponent
  ],
  templateUrl: './user-wise-permission.component.html',
  styleUrl: './user-wise-permission.component.scss'
})
export class UserWisePermissionComponent {
  height: string = '0px';
  users: UserRoleCard[] = [];
  loading: boolean = false;

  constructor(private service: EnterpriseService) {
  }

  ngOnInit() {
    this.fetchUsers();
  }

  private fetchUsers() {
    this.loading = true;
    this.service.getUsers().subscribe({
      next: (res: any) => {
        const list = res?.data?.content || res?.data?.responses || res?.data || [];
        this.users = this.mapUsers(list);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private mapUsers(data: any[]): UserRoleCard[] {
    return (data || []).map(user => {
      const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
        user?.name || user?.fullName || 'Unnamed user';
      const primaryRole = Array.isArray(user?.roles) ? user.roles[0] : (user?.role ?? user?.department ?? user?.roleName);

      return {
        id: user?.id ?? user?.userId,
        name,
        type: 'user',
        role: primaryRole || 'N/A'
      };
    });
  }
}
