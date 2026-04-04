import { Inject, Injectable } from "@nestjs/common";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../domain/entities/customer.entity";

export interface GetCustomersUseCaseInput {
  search?: string;
  page: number;
  limit: number;
}

export interface GetCustomersUseCaseOutput {
  data: CustomerEntity[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable()
export class GetCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    input: GetCustomersUseCaseInput,
  ): Promise<GetCustomersUseCaseOutput> {
    const { search, page, limit } = input;
    const skip = (page - 1) * limit;

    const [customers, total] = await this.customerRepository.findAndCount({
      skip,
      take: limit,
      search,
    });

    return {
      data: customers,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }
}
