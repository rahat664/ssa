import { Component } from '@angular/core';
import {EnterpriseService} from '../../services/enterprise.service';
import {GetElementHeightDirective} from '../../../../shared/directives/get-element-height.directive';

@Component({
  selector: 'app-enterprise-list',
  imports: [
    GetElementHeightDirective
  ],
  templateUrl: './enterprise-list.component.html',
  styleUrl: './enterprise-list.component.scss'
})
export class EnterpriseListComponent {
  height: any;
  searchValue: any;

  constructor(private enterprise: EnterpriseService) {
  }

  ngOnInit() {
    this.getAllEnterprises();
  }

  private getAllEnterprises() {
    this.enterprise.getAllEnterprises().subscribe((result) => {
      console.log(result);
    })
  }

  onClickClear() {

  }

  onKeyUpSearch($event: KeyboardEvent) {

  }

  onClickAddEnterprise() {

  }
}
