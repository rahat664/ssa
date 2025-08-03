import {Component, Input, SimpleChanges} from '@angular/core';
import {Enterprise} from '../../models/enterprise.model';
import {EnterpriseCardComponent} from '../enterprise-card/enterprise-card.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-alphabet-list',
  imports: [
    EnterpriseCardComponent,
    NgForOf
  ],
  templateUrl: './alphabet-list.component.html',
  styleUrl: './alphabet-list.component.scss'
})
export class AlphabetListComponent {
  @Input() enterpriseList: Enterprise[] = [];
  filteredEnterpriseList: {} = {};

  ngOnChanges(changes: SimpleChanges) {
    this.filterEnterpriseByAlphabet(changes['enterpriseList'].currentValue);
  }

  private filterEnterpriseByAlphabet(currentValue: Enterprise[]) {
    // Assuming you want to filter the enterprise list by the first letter of the name
    // push filtered array by alphabet in filteredEnterpriseList
    this.filteredEnterpriseList = currentValue.reduce((acc, enterprise) => {
      const firstLetter = enterprise.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(enterprise);
      return acc;
    }, {});

    //sort the keys alphabetically
    this.filteredEnterpriseList = Object.keys(this.filteredEnterpriseList)
      .sort()
      .reduce((obj, key) => {
        obj[key] = this.filteredEnterpriseList[key];
        return obj;
      }, {});

  }

  protected readonly Object = Object;
}
