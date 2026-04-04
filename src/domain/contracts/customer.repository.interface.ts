import { CustomerEntity } from "../entities/customer.entity";

export const CUSTOMER_REPOSITORY = "CUSTOMER_REPOSITORY";

export interface FindCustomersParams {
  skip: number;
  take: number;
  search?: string;
}

export interface ICustomerRepository {
  findById(id: number): Promise<CustomerEntity | null>;
  findByCode(code: string): Promise<CustomerEntity | null>;
  findAll(): Promise<CustomerEntity[]>;
  findAndCount(
    params: FindCustomersParams,
  ): Promise<[CustomerEntity[], number]>;
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
