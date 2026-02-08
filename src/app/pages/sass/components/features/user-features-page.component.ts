import {Component} from '@angular/core';
import {FeaturesComponent} from './features.component';

@Component({
  selector: 'app-user-features-page',
  standalone: true,
  imports: [FeaturesComponent],
  template: '<app-features></app-features>'
})
export class UserFeaturesPageComponent {}
