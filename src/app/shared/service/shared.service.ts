import { Injectable } from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  permissionsUrl = environment.userUrl + '/api/permissions';
  closeInputSelect: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  constructor(private http: HttpClient) { }

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
}
