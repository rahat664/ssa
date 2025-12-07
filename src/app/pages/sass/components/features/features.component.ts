import {Component, inject} from '@angular/core';
import {CommonModule, NgClass} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Feature, ModuleSummary} from '../../models/modules.model';
import {MatDialog} from '@angular/material/dialog';
import {AddFeatureComponent} from '../add-feature/add-feature.component';
import {EnterpriseService} from '../../services/enterprise.service';
import {SharedService} from '../../../../shared/service/shared.service';

interface FieldOption {
  id: number;
  title: string;
  isActive: boolean;
}

@Component({
  selector: 'app-features',
  imports: [
    CommonModule
  ],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
  readonly dialog = inject(MatDialog)
  private enterPriseType: string = '';
  private moduleId: number;
  moduleDetails: ModuleSummary = {} as ModuleSummary;
  featureList: Feature[] = [];
  activeCount: number = 0;
  inactiveCount: number = 0;
  constructor(private route: ActivatedRoute, private service: EnterpriseService, private shared: SharedService) {
  }

  ngOnInit(): void {
    const paramData = this.route.snapshot.params
    this.enterPriseType = paramData['enterpriseType'] ;
    this.moduleId = paramData['moduleId'];
    this.getFeatureList();
  }
  moduleName: string;
  totalOptions: number | undefined;


  toggleField(field: Feature): void {
    if (!field) return;
    field.status = field.status === 'active' ? 'inactive' : 'active';
    // Here you can add code to update the status in the backend if needed
    const activeFeatureIds = this.featureList.filter(f => f.status === 'active').map(f => f.id);

    const body = {
      enterpriseType: this.enterPriseType,
      featureIds: activeFeatureIds,
    }

    this.service.typeFeatureAdd(body).subscribe(res => {
      this.getFeatureList();
    })
  }

  onClickAddFeature() {
    const dialogRef = this.dialog.open(AddFeatureComponent, {
      width: '30vw',
      data: {moduleId: this.moduleId, enterpriseType: this.enterPriseType}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFeatureList();
      } else {
        // Dialog was closed without adding a feature
      }
    })
  }

  private getFeatureList() {
    this.service.getFeatureByModuleIdAndType(this.route.snapshot.params['moduleId'], this.enterPriseType).subscribe((featureList: any) => {
      this.moduleDetails = featureList.data[0] as ModuleSummary;
      this.totalOptions = this.moduleDetails?.totalFeature
      this.moduleName = this.moduleDetails?.name;
      this.activeCount = this.moduleDetails?.activeFeature
      this.inactiveCount = this.moduleDetails?.inactiveFeature
      this.featureList = this.moduleDetails?.features || [];
    });
  }
}
