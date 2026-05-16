import { Injectable, Inject } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../domain/entities/customer.entity";
import { CustomerCodeAlreadyExistsException } from "../../../domain/exceptions/customer.exceptions";

import { CustomerType, CustomerStatus } from "../../../domain/enums";

export interface CreateCustomerRequest {
  name: string;
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

export interface CreateCustomerResponse {
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
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  private generateCode(name: string): string {
    const initials = name
      .trim()
      .split(/\s+/)
      .map((word) => word[0].toUpperCase())
      .join("");
    return `CTM-${initials}`;
  }

  async execute(
    request: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    const code = this.generateCode(request.name);
    const existing = await this.customerRepository.findByCode(code);
    if (existing) {
      throw new CustomerCodeAlreadyExistsException(code);
    }

    const customer = new CustomerEntity({
      code,
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

    const created = await this.customerRepository.create(customer);

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      type: created.type,
      status: created.status,
      companyName: created.companyName,
      taxCode: created.taxCode,
      contactPerson: created.contactPerson,
      address: created.address,
      billingAddress: created.billingAddress,
      shippingAddress: created.shippingAddress,
      phone: created.phone,
      email: created.email,
      note: created.note,
      assignedStaffId: created.assignedStaffId,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}
