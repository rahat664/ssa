import { Component } from '@angular/core';
import {EnterpriseListComponent} from './components/enterprise-list/enterprise-list.component';

@Component({
  selector: 'app-sass',
  standalone: true,
  imports: [
    EnterpriseListComponent
  ],
  templateUrl: './sass.component.html',
  styleUrl: './sass.component.scss'
})
export class SassComponent {

}
