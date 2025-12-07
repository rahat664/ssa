export interface Enterprise {
  enterpriseType: string;
  id: number;
  name: string;
  enterpriseCode: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customer: Customer;
}

export interface Customer {
  id: number;
  name: string;
  customerCode: string;
  email: string | null;
  phone: string | null;
  countryCode: string;
  countryOrigin: string;
  address: string;
  note: string;
  status: string;
  creationDate: string; // Use `Date` if you plan to convert with new Date()
  tripType: string | null;
  preferredPaymentType: string;
  createdBy: string;
  updatedBy: string | null;
}
