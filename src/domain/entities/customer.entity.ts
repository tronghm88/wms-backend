export class CustomerEntity {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<CustomerEntity>) {
    Object.assign(this, partial);
  }
}
