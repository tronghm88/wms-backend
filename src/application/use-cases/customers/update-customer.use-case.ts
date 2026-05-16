import { Injectable, Inject } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";

import { CustomerType, CustomerStatus } from "../../../domain/enums";

export interface UpdateCustomerRequest {
  id: number;
  name?: string;
  type?: CustomerType;
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
}

export interface UpdateCustomerResponse {
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
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    request: UpdateCustomerRequest,
  ): Promise<UpdateCustomerResponse> {
    const customer = await this.customerRepository.findById(request.id);
    if (!customer) {
      throw new CustomerNotFoundException(request.id);
    }

    const updated = await this.customerRepository.update(request.id, {
      name: request.name,
      type: request.type,
      companyName: request.companyName,
      taxCode: request.taxCode,
      contactPerson: request.contactPerson,
      address: request.address,
      billingAddress: request.billingAddress,
      shippingAddress: request.shippingAddress,
      phone: request.phone,
      email: request.email,
      note: request.note,
      assignedStaffId: request.assignedStaffId,
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
