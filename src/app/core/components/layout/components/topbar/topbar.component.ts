import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../auth/services/auth.service';
import {MobileViewService} from '../../../../../shared/service/mobile-view.service';
import {SharedService} from '../../../../../shared/service/shared.service';
import {environment} from '../../../../../../environments/environment';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, MatMenuModule, MatTooltip, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  isSideBarOpen = false;
  isProfileOpened = false;
  searchSuggestions: any[] = [];
  isSearchedMenuOpened = false;
  name: string;
  image: string;

  constructor(
    private toggleMobileViewService: MobileViewService,
    private auth: AuthService,
    private shared: SharedService
  ) {}

  ngOnInit(): void {
    this.name = localStorage.getItem('name');
    this.image = localStorage.getItem('image');
    this.toggleMobileViewService.isSidebarOpen.subscribe(value => {
      this.isSideBarOpen = value;
    });
  }

  toggleMobileSideBar() {
    this.isSideBarOpen = !this.isSideBarOpen;
    this.toggleMobileViewService.isSidebarOpen.next(this.isSideBarOpen);
  }

  onClickSearchOnMobile() {
    this.isSideBarOpen = true;
    this.toggleMobileViewService.isSidebarOpen.next(this.isSideBarOpen);
  }

  onClickLogOut() {
    this.auth.logout();
    this.isProfileOpened = false;
    this.shared.closeInputSelect.next(false);
  }


  onClickLogo() {
    this.shared.closeInputSelect.next(false);
  }

  protected readonly environment = environment;
}
