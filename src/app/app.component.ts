import {Component, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {LayoutComponent} from './core/components/layout/layout.component';
import {filter} from 'rxjs';
import {initFlowbite} from 'flowbite';
import {AuthService} from './core/components/auth/services/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {MobileViewService} from './shared/service/mobile-view.service';
import {NgIf} from '@angular/common';
import {SharedService} from './shared/service/shared.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LayoutComponent,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly dialog = inject(MatDialog);
  private focusListener: () => void;
  title = 'snz-web';
  isOpen: boolean;

  fallbackImage = 'assets/images/placehoder.webp';

  constructor(
    private router: Router,
    private auth: AuthService,
    private mobileViewServices: MobileViewService,
    private shared: SharedService,
  ) {
    this.setUrlWiseFavicon()
  }

  /**
   * Handles document click events.
   * @param event The mouse event.
   */
  // @HostListener('click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   const target = event.target as HTMLElement;
  //   // dont preview if IMG class is notPreview
  //   if (target.tagName === 'IMG' && !target.classList.contains('notPreview')) {
  //     if (target.getAttribute('src').includes('map')) {
  //       this.isOpen = false;
  //       return;
  //     } else {
  //       this.dialog.open(ImageGalleryComponent, {});
  //       return this.imageGalleryService.setCurrentImage(
  //         target.getAttribute('src')
  //       );
  //     }
  //   }
  // }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    initFlowbite();
    this.checkWhichRouteWeAreOn();
    this.handleRouter()
  }

  private handleRouter() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.shared.closeInputSelect.next(false);
        this.detectIsMobileDevice();
      });
  }


  /**
   * Checks if the current page is the login page.
   * @returns True if the current page is the login page, otherwise false.
   */
  isLoginPage() {
    if (this.auth.isLoggedIn()) {
      return this.router.url === '/auth/login';
    } else {
      return true;
    }
  }

  /**
   * Checks if the current page is the about page.
   * @returns True if the current page is the about page, otherwise false.
   */
  isAboutPage() {
    return this.router.url === '/about-us';
  }



  // set the url wise favicon
  setUrlWiseFavicon() {
    // link tag for favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    // get the current url
    const url = window.location.href;
    // check if the url contains the word support
    if (url.includes('ecoflit')) {
      link.href = 'assets/logo/eco.ico';
    } else {
      link.href = 'assets/logo/snz.ico';
    }

    // append link tag to head
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  /**
   * Cleans up resources when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.focusListener) {
      this.focusListener();
    }
  }


  /**
   * Checks if the current page is the support page.
   * @returns True if the current page is the support page, otherwise false.
   */
  isSupportPage() {
    return this.router.url === '/support';
  }

  private checkWhichRouteWeAreOn() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.router.url !== '/profile/transporter/add' && this.router.url !== '/profile/document-upload' && !(this.router.url.startsWith('/profile/transporter') && this.router.url.endsWith('/details'))) {
          localStorage.removeItem('Transporter Image');
          localStorage.removeItem('NID Front');
          localStorage.removeItem('NID Back');
          localStorage.removeItem('Trade License');
          localStorage.removeItem('Agreement');
          localStorage.removeItem('Other');
          localStorage.removeItem('transporterPayload');
          localStorage.removeItem('isFromDocumentSave');
          localStorage.removeItem('tradelicenseexpiry');
          localStorage.removeItem('agreementexpiry');
        }
      }
    });
  }

  private detectIsMobileDevice() {
    // Check if the user agent string contains 'Mobi'
    const isMobile = /Mobi/.test(navigator.userAgent);
    // Check if the user agent string contains 'Android'
    const isAndroid = /Android/.test(navigator.userAgent);
    // Check if the user agent string contains 'iPhone'
    const isiPhone = /iPhone/.test(navigator.userAgent);
    //if any of the upper condition is true then set the isMobileDevice to true and turn side bar to false
    if (isMobile || isAndroid || isiPhone) {
      this.mobileViewServices.isMobileDevice.next(true)
      localStorage.setItem('isMobileDevice', 'true');
    } else {
      localStorage.setItem('isMobileDevice', 'false');
      this.mobileViewServices.isMobileDevice.next(false)
    }
  }
}
