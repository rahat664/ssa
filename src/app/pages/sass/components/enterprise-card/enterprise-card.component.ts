import {Component, Input, SimpleChanges} from '@angular/core';
import {Enterprise} from '../../models/enterprise.model';
import {NgForOf} from '@angular/common';
import {CardComponent} from '../../../../shared/card/card.component';

@Component({
  selector: 'app-enterprise-card',
  imports: [
    NgForOf,
    CardComponent
  ],
  templateUrl: './enterprise-card.component.html',
  styleUrl: './enterprise-card.component.scss'
})
export class EnterpriseCardComponent {
  @Input() enterpriseListByAlphabet: Enterprise[] = [];
}
