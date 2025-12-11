import {Component, inject, Input, SimpleChanges} from '@angular/core';
import {Enterprise} from '../../models/enterprise.model';
import {NgForOf} from '@angular/common';
import {CardComponent} from '../../../../shared/card/card.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'app-enterprise-card',
  standalone: true,
  imports: [
    NgForOf,
  ],
  templateUrl: './enterprise-card.component.html',
  styleUrl: './enterprise-card.component.scss'
})
export class EnterpriseCardComponent {
  readonly dialog = inject(MatDialog);
  @Input() enterpriseListByAlphabet: Enterprise[] = [];

  constructor(private router: Router) {
  }

  onClickEnterprise(enterprise: Enterprise) {
    // Navigate to the enterprise detail page with query param id and send there full enterprise object
    this.router.navigate(['/sass/enterprise-detail'], {queryParams: {id: enterprise.id}, state: {enterprise}});
  }
}
