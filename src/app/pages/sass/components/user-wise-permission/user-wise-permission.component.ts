import {Component} from '@angular/core';
import {GetElementHeightDirective} from '../../../../shared/directives/get-element-height.directive';
import {GiveMaxHeightDirective} from '../../../../shared/directives/give-max-height.directive';
import {NgForOf, NgIf} from '@angular/common';
import {EnterpriseService} from '../../services/enterprise.service';
import {Enterprise} from '../../models/enterprise.model';
import {MatSelect, MatSelectChange} from '@angular/material/select';
import {MatFormField} from '@angular/material/form-field';
import {MatOption} from '@angular/material/core';
import {FormsModule} from '@angular/forms';
import {UserCardComponent} from '../../../../shared/user-card/user-card.component';
import {User} from '../../models/user.model';
import {Router} from '@angular/router';

type UserView = User & { roleNames: string[]; primaryRole: string; statusLower: string };

@Component({
  selector: 'app-user-wise-permission',
  standalone: true,
  imports: [
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    NgForOf,
    NgIf,
    MatFormField,
    MatOption,
    MatSelect,
    FormsModule,
    UserCardComponent
  ],
  templateUrl: './user-wise-permission.component.html',
  styleUrl: './user-wise-permission.component.scss'
})
export class UserWisePermissionComponent {
  height: string = '0px';
  enterpriseId: number = -1;
  enterprise: Enterprise[] = [];
  enterpriseType: string = '';
  allUsers: UserView[] = [];
  filteredUsers: UserView[] = [];
  activeUsersPage: UserView[] = [];
  inactiveUsersPage: UserView[] = [];
  pageSize = 12;
  currentPage = 0; // zero-based for API calls
  totalUsers = 0;
  totalPages = 1;
  serverTotalUsers = 0;
  serverTotalPages = 1;
  searchTerm = '';
  constructor(private service: EnterpriseService, private router: Router) {
  }

  ngOnInit() {
    this.getEnterprises();
  }

  onChangeEnterprise($event: MatSelectChange<any>) {
    this.enterpriseId = $event.value;
    this.enterpriseType = this.enterprise.find(ent => ent.id === this.enterpriseId)?.enterpriseType || '';
    this.currentPage = 0;
    this.getUsersByEnterpriseId($event.value, this.currentPage, this.searchTerm);
  }

  onAddRoles() {

  }

  onClickToggle($event: any) {

  }

  onCustomize($event: any) {

  }

  onUserCardClick(user: UserView) {
    this.router.navigate([`/user-wise-permission/user/${user.id}`], {
      state: {
        user,
        enterpriseId: this.enterpriseId,
        enterpriseType: this.enterpriseType
      },
      queryParams: { enterpriseId: this.enterpriseId, enterpriseType: this.enterpriseType }
    });
  }

  getUsersByEnterpriseId(enterpriseId: number, page: number = 0, searchTerm: string = '') {
    this.service.getUsersByEnterpriseId(enterpriseId, page, searchTerm).subscribe((res: any) => {
      const data: User[] = res?.data?.content || res?.data?.responses || res?.data || [];
      const sorted = [...data].sort((a, b) => {
        const aName = (a.name || a.username || '').toLowerCase();
        const bName = (b.name || b.username || '').toLowerCase();
        return aName.localeCompare(bName);
      });
      const withRoles: UserView[] = sorted.map(user => {
        const roleNames = (user.roles || [])
          .map(r => r?.authority || r?.name)
          .filter((r): r is string => !!r);
        const statusLower = (user.status || '').toLowerCase();
        return {
          ...user,
          roleNames,
          primaryRole: roleNames[0] || '',
          statusLower,
        };
      });
      this.allUsers = withRoles;
      this.serverTotalUsers = res?.meta?.totalRecords ?? sorted.length;
      this.serverTotalPages = res?.meta?.totalPageCount ?? Math.max(1, Math.ceil(this.serverTotalUsers / this.pageSize));
      this.pageSize = res?.meta?.resultCount ?? this.pageSize;
      this.totalUsers = this.serverTotalUsers;
      this.totalPages = this.serverTotalPages;
      this.currentPage = page;
      this.filteredUsers = withRoles;
      this.updatePagedUsers();
    });
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage += 1;
      this.getUsersByEnterpriseId(this.enterpriseId, this.currentPage, this.searchTerm);
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage -= 1;
      this.getUsersByEnterpriseId(this.enterpriseId, this.currentPage, this.searchTerm);
    }
  }

  onKeyUpSearch(event: KeyboardEvent) {
    const value = (event.target as HTMLInputElement).value;
    this.onSearchChange(value);
  }

  onClickClear() {
    this.searchTerm = '';
    this.currentPage = 0;
    this.getUsersByEnterpriseId(this.enterpriseId, this.currentPage, this.searchTerm);
  }

  onSearchChange(value: string) {
    this.searchTerm = value || '';
    this.currentPage = 0;
    this.getUsersByEnterpriseId(this.enterpriseId, this.currentPage, this.searchTerm.trim());
  }

  private updatePagedUsers() {
    const slice = this.filteredUsers;
    this.activeUsersPage = slice.filter(user => user.statusLower === 'active');
    this.inactiveUsersPage = slice.filter(user => user.statusLower !== 'active');
  }

  private getEnterprises() {
    this.service.getAllEnterprises().subscribe((res: any) => {
      this.enterprise = res?.data?.content || res?.data || [];
      this.enterpriseId = this.enterprise[0]?.id;
      this.enterpriseType = this.enterprise[0]?.enterpriseType || '';
      this.getUsersByEnterpriseId(this.enterprise[0]?.id, this.currentPage, this.searchTerm);
    })
  }
}
