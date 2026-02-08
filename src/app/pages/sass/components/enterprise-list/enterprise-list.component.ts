import {Component, Inject, inject} from '@angular/core';
import {EnterpriseService} from '../../services/enterprise.service';
import {GetElementHeightDirective} from '../../../../shared/directives/get-element-height.directive';
import {GiveMaxHeightDirective} from '../../../../shared/directives/give-max-height.directive';
import {AlphabetListComponent} from '../alphabet-list/alphabet-list.component';
import {Enterprise} from '../../models/enterprise.model';
import {MatDialog} from '@angular/material/dialog';
import {EnterpriseAddComponent} from '../enterprise-add/enterprise-add.component';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-enterprise-list',
  standalone: true,
  imports: [
    GetElementHeightDirective,
    GiveMaxHeightDirective,
    AlphabetListComponent,
    NgIf
  ],
  templateUrl: './enterprise-list.component.html',
  styleUrl: './enterprise-list.component.scss'
})
export class EnterpriseListComponent {
  readonly dialog = inject(MatDialog);
  height: any;
  searchValue: any;
  enterpriseList: Enterprise[] = [];
  totalItems: number = 0;

  constructor(private enterprise: EnterpriseService) {
  }

  ngOnInit() {
    this.getAllEnterprises();
  }

  private getAllEnterprises() {
    this.enterprise.getAllEnterprises().subscribe((result: any) => {
      this.enterpriseList = result.data.content;
      this.totalItems = result.data.totalElements;
    })
  }

  onClickClear() {

  }

  onKeyUpSearch($event: KeyboardEvent) {

  }

  onClickAddEnterprise() {
      this.dialog.open(EnterpriseAddComponent, {
        width: '30vw',
      }).afterClosed().subscribe((result: any) => {
        if (result) {
          // If the dialog was closed with a result, refresh the enterprise list
          this.getAllEnterprises();
        }
      })
  }
}
