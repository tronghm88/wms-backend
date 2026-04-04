import { Injectable, Inject } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import {
  CustomerNotFoundException,
  CustomerHasIssueTicketsException,
} from "../../../domain/exceptions/customer.exceptions";

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    const ticketCount = await this.customerRepository.countIssueTickets(id);
    if (ticketCount > 0) {
      throw new CustomerHasIssueTicketsException(id);
    }

    await this.customerRepository.delete(id);
  }
}
