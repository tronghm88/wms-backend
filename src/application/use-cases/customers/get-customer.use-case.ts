import { Inject, Injectable } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../domain/entities/customer.entity";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: number): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    return customer;
  }
}
