import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {Subscription} from 'rxjs';
import {MobileViewService} from '../../../../../shared/service/mobile-view.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  willShow = false;
  dropdownOpen = false;
  private subs: Subscription;
  currentYear: number = new Date().getFullYear();

  constructor(
    private mobileViewService: MobileViewService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  @ViewChild('sideBar') myDiv!: ElementRef;

  ngOnInit(): void {
    this.myDiv?.nativeElement?.classList?.remove('slide-right');
    this.subs = this.mobileViewService.isSidebarOpen.subscribe(value => {
      if (value) {
        this.myDiv.nativeElement.classList.remove('slide-right');
        this.myDiv.nativeElement.classList.add('slide-left');
        setTimeout(() => {
          this.willShow = value;
        }, 500);
      } else {
        this.willShow = value;
        setTimeout(() => {
          this.myDiv.nativeElement.classList.add('slide-right');
          this.myDiv.nativeElement.classList.remove('slide-left');
        }, 0);
      }
    });
    this.subs = this.mobileViewService.isMobileDevice.subscribe(value => {
      if (value) {
        this.willShow = value
      } else  {
        this.willShow = value
      }
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onClickProfile() {
    this.dropdownOpen = !this.dropdownOpen;
    this.clearSelectedTemplate();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  clearSelectedTemplate() {
    if (this.isAdmin()) {
      localStorage.removeItem('customerCode');
      localStorage.removeItem('selectedTemplate');
      localStorage.removeItem('backFromTemplateEditOrUpdate');
      localStorage.removeItem('selectedCustomer');
    }
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    return role.includes('ROLE_SUPERADMIN');
  }

  isCustomerAdmin() {
    return localStorage.getItem('role').includes('ROLE_CUSTOMER_ADMIN');
  }

  isMobileDevice() {
    return localStorage.getItem('isMobileDevice') === 'true';
  }

  ifInMobileDevice() {
    if (this.isMobileDevice()) {
      this.mobileViewService.isSidebarOpen.next(true);
      this.willShow = true;
    } else {
      this.mobileViewService.isSidebarOpen.next(false);
      this.willShow = false;
    }
  }
}
