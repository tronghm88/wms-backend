import { CustomerType, CustomerStatus } from "../enums";

export class CustomerEntity {
  id: number;
  code: string;
  name: string;
  type?: CustomerType;
  status: CustomerStatus;
  companyName?: string;
  taxCode?: string;
  contactPerson?: string;
  address?: string;
  billingAddress?: string;
  shippingAddress?: string;
  phone?: string;
  email?: string;
  note?: string;
  assignedStaffId?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<CustomerEntity>) {
    Object.assign(this, partial);
    if (!this.status) {
      this.status = CustomerStatus.ACTIVE;
    }
  }
}
