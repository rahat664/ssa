import { Component } from '@angular/core';
import {TopbarComponent} from './components/topbar/topbar.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    TopbarComponent,
    SidebarComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
