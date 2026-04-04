import { Injectable, Inject } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import {
  CustomerCodeAlreadyExistsException,
  CustomerNotFoundException,
} from "../../../domain/exceptions/customer.exceptions";

export interface UpdateCustomerRequest {
  id: number;
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  note?: string;
}

export interface UpdateCustomerResponse {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  note?: string;
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

    if (request.code && request.code !== customer.code) {
      const existing = await this.customerRepository.findByCode(request.code);
      if (existing) {
        throw new CustomerCodeAlreadyExistsException(request.code);
      }
    }

    const updated = await this.customerRepository.update(request.id, {
      code: request.code,
      name: request.name,
      address: request.address,
      phone: request.phone,
      email: request.email,
      note: request.note,
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      note: updated.note,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
