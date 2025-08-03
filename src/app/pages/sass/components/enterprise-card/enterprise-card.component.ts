import {Component, Input, SimpleChanges} from '@angular/core';
import {Enterprise} from '../../models/enterprise.model';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-enterprise-card',
  imports: [
    NgForOf
  ],
  templateUrl: './enterprise-card.component.html',
  styleUrl: './enterprise-card.component.scss'
})
export class EnterpriseCardComponent {
  @Input() enterpriseListByAlphabet: Enterprise[] = [];
}
