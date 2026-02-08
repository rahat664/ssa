export interface UserRoleFeature {
  id: number;
  name: string;
  methodUrl: string;
  parent: string;
  active: boolean;
  fullFeatureName: string;
}

export interface UserRole {
  id: number;
  name: string;
  features: UserRoleFeature[];
  authority: string;
}

export interface User {
  id: number;
  createdBy: string;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  isDeleted: boolean;
  userId: string;
  name: string;
  email?: string | null;
  password?: string | null;
  phone?: string | null;
  enabled: boolean;
  approveStatus: string;
  rejectedReason?: string | null;
  status: string;
  lastPasswordResetDate?: string | null;
  department?: string | null;
  designation?: string | null;
  locked: boolean;
  lockedUntill?: string | null;
  countryOrigin?: string | null;
  countryCode?: string | null;
  emailSend: boolean;
  customerId?: number | null;
  transporterId?: number | null;
  associatedCustomerCode?: string | null;
  roles: UserRole[];
  enterprise?: unknown;
  username: string;
  phoneNumber?: string | null;
  authorities: UserRole[];
  image?: string | null;
}
