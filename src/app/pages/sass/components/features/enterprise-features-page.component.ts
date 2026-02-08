import {Component} from '@angular/core';
import {FeaturesComponent} from './features.component';

@Component({
  selector: 'app-enterprise-features-page',
  standalone: true,
  imports: [FeaturesComponent],
  template: '<app-features></app-features>'
})
export class EnterpriseFeaturesPageComponent {}
