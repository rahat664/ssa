export interface Feature {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export interface ModuleSummary {
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
