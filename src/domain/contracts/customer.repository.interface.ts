import { CustomerEntity } from "../entities/customer.entity";

export interface ICustomerRepository {
  findById(id: number): Promise<CustomerEntity | null>;
  findByCode(code: string): Promise<CustomerEntity | null>;
  findAll(): Promise<CustomerEntity[]>;
  create(
    customer: Omit<
      CustomerEntity,
      "id" | "createdAt" | "updatedAt" | "issueTickets" | "discountPolicies"
    >,
  ): Promise<CustomerEntity>;
  update(
    id: number,
    customer: Partial<CustomerEntity>,
  ): Promise<CustomerEntity>;
  delete(id: number): Promise<void>;
}
