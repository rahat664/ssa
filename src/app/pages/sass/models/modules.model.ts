export interface Feature {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export enum FeatureListStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Optional = 'OPTIONAL'
}

export interface ModuleSummary {
  roleId?: number;
  roleName?: string;
  id: number;
  name: string;
  totalFeature: number;
  activeFeature: number;
  inactiveFeature: number;
  features: Feature[];
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  active: boolean;
}

export interface ModuleListItem {
  id: number;
  name: string;
  slug?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  active?: boolean;
  status?: string | null;
}

export interface FeatureListItem {
  id: number;
  name: string;
  status: FeatureListStatus;
  slug?: string | null;
  urls?: string[];
  moduleId?: number | null;
  moduleName?: string | null;
  parent?: FeatureListItem | null;
}

export interface ModuleFeatureDetails extends ModuleListItem {
  totalFeature: number;
  activeFeature: number;
  inactiveFeature: number;
  features: FeatureListItem[];
}
