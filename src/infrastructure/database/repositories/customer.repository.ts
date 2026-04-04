import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Customer as PrismaCustomer, Prisma } from "@prisma/client";
import {
  FindCustomersParams,
  ICustomerRepository,
} from "../../../domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../domain/entities/customer.entity";

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(customer: PrismaCustomer): CustomerEntity {
    return new CustomerEntity({
      id: customer.id,
      code: customer.code,
      name: customer.name,
      address: customer.address ?? undefined,
      phone: customer.phone ?? undefined,
      email: customer.email ?? undefined,
      note: customer.note ?? undefined,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async findAndCount(
    params: FindCustomersParams,
  ): Promise<[CustomerEntity[], number]> {
    const { skip, take, search } = params;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return [customers.map((c) => this.mapToDomain(c)), total];
  }

  async findById(id: number): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) return null;
    return this.mapToDomain(customer);
  }

  async findByCode(code: string): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { code },
    });

    if (!customer) return null;
    return this.mapToDomain(customer);
  }

  async findAll(): Promise<CustomerEntity[]> {
    const customers = await this.prisma.customer.findMany();
    return customers.map((c) => this.mapToDomain(c));
  }

  async create(
    customer: Omit<
      CustomerEntity,
      "id" | "createdAt" | "updatedAt" | "issueTickets" | "discountPolicies"
    >,
  ): Promise<CustomerEntity> {
    const created = await this.prisma.customer.create({
      data: {
        code: customer.code,
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
        email: customer.email,
        note: customer.note,
      },
    });
    return this.mapToDomain(created);
  }

  async update(
    id: number,
    customer: Partial<CustomerEntity>,
  ): Promise<CustomerEntity> {
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        code: customer.code,
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
        email: customer.email,
        note: customer.note,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
