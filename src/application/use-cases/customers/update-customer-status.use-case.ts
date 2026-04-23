import { Injectable, Inject } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";
import { CustomerStatus } from "../../../domain/enums";
import { UpdateCustomerResponse } from "./update-customer.use-case";

export interface UpdateCustomerStatusRequest {
  id: number;
  status: CustomerStatus;
}

@Injectable()
export class UpdateCustomerStatusUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    request: UpdateCustomerStatusRequest,
  ): Promise<UpdateCustomerResponse> {
    const customer = await this.customerRepository.findById(request.id);
    if (!customer) {
      throw new CustomerNotFoundException(request.id);
    }

    const updated = await this.customerRepository.update(request.id, {
      status: request.status,
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      type: updated.type,
      status: updated.status,
      companyName: updated.companyName,
      taxCode: updated.taxCode,
      contactPerson: updated.contactPerson,
      address: updated.address,
      billingAddress: updated.billingAddress,
      shippingAddress: updated.shippingAddress,
      phone: updated.phone,
      email: updated.email,
      note: updated.note,
      assignedStaffId: updated.assignedStaffId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
