import { Injectable, Inject } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../domain/entities/customer.entity";
import { CustomerCodeAlreadyExistsException } from "../../../domain/exceptions/customer.exceptions";

export interface CreateCustomerRequest {
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  note?: string;
}

export interface CreateCustomerResponse {
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
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    request: CreateCustomerRequest,
  ): Promise<CreateCustomerResponse> {
    const existing = await this.customerRepository.findByCode(request.code);
    if (existing) {
      throw new CustomerCodeAlreadyExistsException(request.code);
    }

    const customer = new CustomerEntity({
      code: request.code,
      name: request.name,
      address: request.address,
      phone: request.phone,
      email: request.email,
      note: request.note,
    });

    const created = await this.customerRepository.create(customer);

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      address: created.address,
      phone: created.phone,
      email: created.email,
      note: created.note,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}
