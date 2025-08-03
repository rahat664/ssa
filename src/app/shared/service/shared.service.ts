import { Injectable } from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {HotToastService} from '@ngneat/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  permissionsUrl = environment.userUrl + '/api/permissions';
  closeInputSelect: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  constructor(private http: HttpClient, private toast: HotToastService) { }

  validateInterNationalPhoneNumber() {
    timer(10).subscribe(() => {
      const flagInput = document
        .getElementsByClassName('tel-form')[0]
        ?.children[0]?.getElementsByClassName('country-option')[0].children[1];
      let isBangladeshiNumber = false;
      if (flagInput) {
        // remove 0 from last of the phone number
        if (
          flagInput.innerHTML.endsWith('0') &&
          flagInput.innerHTML == '+880'
        ) {
          isBangladeshiNumber = true;
          flagInput.innerHTML = '+88';
        } else {
          isBangladeshiNumber = false;
        }
      }
      const arrow = document
        .getElementsByClassName('tel-form')[0]
        ?.getElementsByClassName('mat-mdc-select-arrow')[0];
      if (arrow) {
        arrow.classList.add('pr-1');
        // change svg arrow icon color
        arrow.children[0].setAttribute('fill', '#fff');
      }
      const numberInput = document
        .getElementsByClassName('tel-form')[0]
        ?.children[1]?.getElementsByTagName('input')[0];
      document.getElementsByClassName('tel-form')[0]?.classList.add('mt-1');
      if (numberInput) {
        numberInput.maxLength = numberInput?.placeholder.length;
        numberInput.minLength = numberInput?.placeholder.length;
        numberInput.addEventListener('keypress', e => {
          if (isNaN(Number(e.key))) {
            e.preventDefault();
          }
        });
        // disable number input value changes default behavior
      }
      // number input should not accept text
    });
  }

  getUserPermissions() {
    return this.http.get(`${this.permissionsUrl}`);
  }

  showSuccess(message: string, title?: string) {
    this.toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#51A351',
        color: 'white',
        padding: '10px',
      },
      iconTheme: {
        primary: '#51A351',
        secondary: 'white',
      },
    });
  }

  showError(message: string, title?: string) {
    this.toast.error(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#BD362F',
        color: 'white',
        padding: '10px',
      },
      iconTheme: {
        primary: '#BD362F',
        secondary: 'white',
      },
    });
  }

  showInfo(message: string, title?: string) {
    this.toast.info(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#fff',
        padding: '10px',
      },
    });
  }

  showWarning(message: string, title?: string) {
    this.toast.warning(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#F89406',
        color: 'white',
        padding: '10px',
      },
    });
  }

  showCustom(message: string, title?: string) {
    this.toast.show(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        backgroundColor: '#F89406',
        color: 'white',
        padding: '10px',
      },
    });
  }
}
