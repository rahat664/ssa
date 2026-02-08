import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialog} from '@angular/material/dialog';
import {EnterpriseService} from '../../services/enterprise.service';
import {SharedService} from '../../../../shared/service/shared.service';
import {FeatureListItem, FeatureListStatus, ModuleFeatureDetails, ModuleListItem} from '../../models/modules.model';
import {AddModuleComponent} from '../add-module/add-module.component';
import {AddFeatureComponent} from '../add-feature/add-feature.component';

@Component({
  selector: 'app-feature-module',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule
  ],
  templateUrl: './feature-module.component.html',
  styleUrl: './feature-module.component.scss'
})
export class FeatureModuleComponent {
  activeTab: 'modules' | 'features' = 'modules';
  enterpriseName: string = 'Hybrid';
  activeModules: ModuleListItem[] = [];
  inactiveModules: ModuleListItem[] = [];
  selectedModule: ModuleListItem | null = null;
  moduleDetails: ModuleFeatureDetails | null = null;
  featureList: FeatureListItem[] = [];
  activeCount: number = 0;
  inactiveCount: number = 0;
  optionalCount: number = 0;
  totalOptions: number = 0;
  isLoadingModules = false;
  isLoadingFeatures = false;
  readonly featureStatus = FeatureListStatus;

  constructor(private service: EnterpriseService, private shared: SharedService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadModules();
  }

  setTab(tab: 'modules' | 'features') {
    this.activeTab = tab;
    if (tab === 'features' && this.selectedModule) {
      this.loadFeaturesForModule(this.selectedModule);
    }
  }

  onSelectModule(module: ModuleListItem, goToFeatures = false) {
    this.selectedModule = module;
    this.loadFeaturesForModule(module);
    if (goToFeatures) {
      this.activeTab = 'features';
    }
  }

  onAddModule() {
    this.dialog.open(AddModuleComponent, {
      width: '30vw'
    }).afterClosed().subscribe((res: any) => {
      if (!res) {
        return;
      }
      const body = {
        name: res.name,
      };
      this.service.addModule(body).subscribe((response: any) => {
        if (response?.status === 'OK') {
          this.shared.showSuccess('Module added successfully!');
          this.loadModules();
        } else {
          this.shared.showError(response?.message || 'Module not added!');
        }
      }, error => {
        this.shared.showError(error?.error?.message || 'Module not added!');
      });
    });
  }

  onAddFeature() {
    if (!this.selectedModule) {
      this.shared.showInfo('Select a module before adding a feature.');
      return;
    }
    const dialogRef = this.dialog.open(AddFeatureComponent, {
      width: '30vw',
      data: {
        moduleId: this.selectedModule.id,
        featureList: this.featureList
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFeaturesForModule(this.selectedModule);
      }
    });
  }

  onEditFeature(feature: FeatureListItem) {
    if (!this.selectedModule) {
      this.shared.showInfo('Select a module before editing a feature.');
      return;
    }
    const dialogRef = this.dialog.open(AddFeatureComponent, {
      width: '30vw',
      data: {
        moduleId: this.selectedModule.id,
        featureList: this.featureList,
        feature
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFeaturesForModule(this.selectedModule);
      }
    });
  }

  toggleFeature(feature: FeatureListItem): void {
    if (!this.selectedModule || !feature) {
      return;
    }
    feature.status = feature.status === FeatureListStatus.Active ? FeatureListStatus.Inactive : FeatureListStatus.Active;
    const allowFeatureIds = this.featureList.filter(f => f.status === FeatureListStatus.Active).map(f => f.id);
    const denyFeatureIds = this.featureList.filter(f => f.status === FeatureListStatus.Inactive).map(f => f.id);
    this.persistFeatureSelection(allowFeatureIds, denyFeatureIds);
  }

  onModuleToggle($event: any) {
    const module = $event?.module as ModuleListItem | undefined;
    if (!module) {
      return;
    }
    const featureIds = this.getFeatureIdsForModule(module);
    if (featureIds.length) {
      this.updateModuleFeatures(featureIds, !!$event?.isActive);
      return;
    }
    this.service.getFeatureByModuleId(module.id).subscribe((res: any) => {
      const rawFeatures = this.extractList(res);
      const ids = this.getFeatureIdsFromRaw(rawFeatures, module.id);
      if (!ids.length) {
        this.shared.showInfo('No features available for this module.');
        return;
      }
      this.updateModuleFeatures(ids, !!$event?.isActive);
    }, () => {
      this.shared.showError('Failed to load features for this module.');
    });
  }

  private loadModules() {
    this.isLoadingModules = true;
    this.service.getAllModules().subscribe((res: any) => {
      const modules = this.extractList(res);
      this.splitModules(modules);
      this.isLoadingModules = false;
      this.ensureSelectedModule();
    }, () => {
      this.isLoadingModules = false;
      this.resetFeatures();
      this.shared.showError('Failed to load modules.');
    });
  }

  private splitModules(data: ModuleListItem[]) {
    this.activeModules = data?.filter(module => this.isModuleActive(module)) || [];
    this.inactiveModules = data?.filter(module => !this.isModuleActive(module)) || [];
  }

  private ensureSelectedModule() {
    const allModules = [...this.activeModules, ...this.inactiveModules];
    if (!allModules.length) {
      this.selectedModule = null;
      this.resetFeatures();
      return;
    }
    if (this.selectedModule) {
      const match = allModules.find(module => module.id === this.selectedModule?.id);
      this.selectedModule = match || allModules[0];
    } else {
      this.selectedModule = allModules[0];
    }
    this.loadFeaturesForModule(this.selectedModule);
  }

  private loadFeaturesForModule(module: ModuleListItem) {
    if (!module) {
      this.resetFeatures();
      return;
    }
    this.isLoadingFeatures = true;
    this.service.getFeatureByModuleId(module.id).subscribe((res: any) => {
      const rawFeatures = this.extractList(res);
      this.applyFeaturesForModule(module, rawFeatures);
    }, () => {
      this.resetFeatures();
      this.shared.showError('Failed to load features for this module.');
    });
  }

  private applyFeaturesForModule(module: ModuleListItem, rawFeatures: any[]) {
    this.isLoadingFeatures = true;
    const features = this.buildFeatureListForModule(rawFeatures, module);
    this.featureList = features;
    this.totalOptions = features.length;
    this.activeCount = features.filter(feature => feature.status === FeatureListStatus.Active).length;
    this.inactiveCount = features.filter(feature => feature.status === FeatureListStatus.Inactive).length;
    this.optionalCount = features.filter(feature => feature.status === FeatureListStatus.Optional).length;
    this.moduleDetails = {
      ...module,
      totalFeature: this.totalOptions,
      activeFeature: this.activeCount,
      inactiveFeature: this.inactiveCount,
      features: features
    };
    this.isLoadingFeatures = false;
  }

  private persistFeatureSelection(allowFeatureIds: number[], denyFeatureIds: number[]) {
    const body = {
      enterpriseType: this.enterpriseName,
      allowFeatureIds,
      denyFeatureIds
    };
    this.service.typeFeatureAdd(body).subscribe(() => {
      if (this.selectedModule) {
        this.loadFeaturesForModule(this.selectedModule);
      }
    }, () => this.shared.showError('Failed to update features.'));
  }

  private resetFeatures() {
    this.moduleDetails = null;
    this.featureList = [];
    this.totalOptions = 0;
    this.activeCount = 0;
    this.inactiveCount = 0;
    this.optionalCount = 0;
    this.isLoadingFeatures = false;
  }

  private updateModuleFeatures(featureIds: number[], isActive: boolean) {
    const body = isActive
      ? {enterpriseType: this.enterpriseName, allowFeatureIds: featureIds, denyFeatureIds: []}
      : {enterpriseType: this.enterpriseName, allowFeatureIds: [], denyFeatureIds: featureIds};
    this.service.typeFeatureAdd(body).subscribe((res: any) => {
      if (res?.status === 'OK') {
        this.shared.showSuccess('Module updated successfully!');
        this.loadModules();
      } else {
        this.shared.showError(res?.message || 'Module not updated!');
      }
    }, error => {
      this.shared.showError(error?.error?.message || 'Module not updated!');
    });
  }

  private getFeatureIdsForModule(module: ModuleListItem | ModuleFeatureDetails): number[] {
    if (this.hasFeatureDetails(module) && module.features.length) {
      return module.features.map(feature => feature.id);
    }
    if (this.selectedModule?.id === module.id && this.featureList.length) {
      return this.featureList.map(feature => feature.id);
    }
    return [];
  }

  private getFeatureIdsFromRaw(rawFeatures: any[], moduleId: number): number[] {
    const filtered = this.filterRawFeaturesByModule(rawFeatures, moduleId);
    const source = filtered.length ? filtered : rawFeatures;
    return source.map(feature => Number(feature?.id)).filter(id => Number.isFinite(id));
  }

  private buildFeatureListForModule(rawFeatures: any[], module: ModuleListItem | ModuleFeatureDetails): FeatureListItem[] {
    if (!rawFeatures?.length && this.hasFeatureDetails(module) && module.features.length) {
      return module.features.map(feature => this.normalizeFeature(feature));
    }
    const filtered = this.filterRawFeaturesByModule(rawFeatures, module.id);
    if (filtered.length) {
      return filtered.map(feature => this.normalizeFeature(feature));
    }
    if (this.hasFeatureDetails(module) && module.features.length) {
      return module.features.map(feature => this.normalizeFeature(feature));
    }
    return rawFeatures.map(feature => this.normalizeFeature(feature));
  }

  private filterRawFeaturesByModule(rawFeatures: any[], moduleId: number): any[] {
    const hasModuleRef = rawFeatures.some(feature => this.extractModuleId(feature) !== null);
    if (!hasModuleRef) {
      return [];
    }
    return rawFeatures.filter(feature => this.extractModuleId(feature) === moduleId);
  }

  private extractModuleId(feature: any): number | null {
    const moduleId =
      feature?.moduleId ??
      feature?.module?.id ??
      feature?.module?.moduleId ??
      feature?.moduleSummary?.id ??
      null;
    const parsed = Number(moduleId);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeFeature(feature: any): FeatureListItem {
    const rawStatus = feature?.status ?? feature?.state ?? feature?.active ?? feature?.isActive;
    const status = this.normalizeStatus(rawStatus);
    const urls = this.normalizeUrls(feature?.urls);
    const slug = this.resolveSlug(feature);
    return {
      id: Number(feature?.id),
      name: feature?.name ?? feature?.title ?? feature?.featureName ?? 'Unnamed',
      status,
      slug,
      urls,
      moduleId: this.extractModuleId(feature),
      moduleName: feature?.module?.name ?? feature?.moduleName ?? null,
      parent: feature?.parent ?? null
    };
  }

  private normalizeStatus(value: any): FeatureListStatus {
    const normalized = String(value ?? '').toLowerCase();
    if (normalized === 'active' || normalized === 'enabled' || normalized === 'true') {
      return FeatureListStatus.Active;
    }
    if (normalized === 'inactive' || normalized === 'disabled' || normalized === 'false') {
      return FeatureListStatus.Inactive;
    }
    if (normalized === 'optional') {
      return FeatureListStatus.Optional;
    }
    return FeatureListStatus.Inactive;
  }

  private normalizeUrls(value: any): string[] {
    if (Array.isArray(value)) {
      return value
        .map(url => String(url).trim())
        .filter(url => url && url !== '[]');
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(url => url.trim())
        .filter(url => url && url !== '[]');
    }
    return [];
  }

  private resolveSlug(feature: any): string | null {
    const candidates = [
      feature?.slug,
      feature?.slugName,
      feature?.featureSlug,
      feature?.slug_name
    ];
    const match = candidates.find(candidate => typeof candidate === 'string' && candidate.trim().length);
    return match ? match.trim() : null;
  }

  private extractList(response: any): any[] {
    const data = response?.data ?? response;
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.content)) {
      return data.content;
    }
    if (Array.isArray(data?.responses)) {
      return data.responses;
    }
    return [];
  }

  private isModuleActive(module: any): boolean {
    if (typeof module?.active === 'boolean') {
      return module.active;
    }
    const status = String(module?.status ?? '').toLowerCase();
    if (status) {
      return status === 'active' || status === 'enabled' || status === 'true';
    }
    return true;
  }

  private hasFeatureDetails(module: ModuleListItem | ModuleFeatureDetails): module is ModuleFeatureDetails {
    return Array.isArray((module as ModuleFeatureDetails)?.features);
  }
}
