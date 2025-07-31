import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileViewService {
  isSidebarOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isMobileDevice: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor() { }
}
