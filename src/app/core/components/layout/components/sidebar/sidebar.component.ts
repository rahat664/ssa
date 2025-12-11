import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {Subscription} from 'rxjs';
import {MobileViewService} from '../../../../../shared/service/mobile-view.service';
import {AuthService} from '../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  willShow = false;
  dropdownOpen = false;
  private subs = new Subscription();
  currentYear: number = new Date().getFullYear();

  constructor(
    private mobileViewService: MobileViewService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  @ViewChild('sideBar') myDiv!: ElementRef;

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.myDiv?.nativeElement?.classList?.remove('slide-right');
    this.subs.add(this.mobileViewService.isSidebarOpen.subscribe(value => {
      if (!this.myDiv?.nativeElement) {
        return;
      }
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
    }));
    this.subs.add(this.mobileViewService.isMobileDevice.subscribe(value => {
      this.willShow = !!value;
    }));
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
    return this.auth.isAdmin();
  }

  isCustomerAdmin() {
    return this.auth.isCustomerAdmin();
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
