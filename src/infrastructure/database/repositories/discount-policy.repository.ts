import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  DiscountPolicy as PrismaDiscountPolicy,
  DiscountType as PrismaDiscountType,
  Prisma,
} from "@prisma/client";
import { IDiscountPolicyRepository } from "../../../domain/contracts/discount-policy.repository.interface";
import { DiscountPolicyEntity } from "../../../domain/entities/discount-policy.entity";
import { DiscountType } from "../../../domain/enums";
import { Decimal } from "decimal.js";

@Injectable()
export class DiscountPolicyRepository implements IDiscountPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(policy: PrismaDiscountPolicy): DiscountPolicyEntity {
    return new DiscountPolicyEntity({
      id: policy.id,
      customerId: policy.customerId,
      discountType: policy.discountType as unknown as DiscountType,
      isAppliedAll: policy.isAppliedAll,
      productIds: policy.productIds,
      discountValue: new Decimal(policy.discountValue.toString()),
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    });
  }

  async findById(id: number): Promise<DiscountPolicyEntity | null> {
    const policy = await this.prisma.discountPolicy.findUnique({
      where: { id },
    });

    if (!policy) return null;
    return this.mapToDomain(policy);
  }

  async findByCustomerId(customerId: number): Promise<DiscountPolicyEntity[]> {
    const policies = await this.prisma.discountPolicy.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    return policies.map((p) => this.mapToDomain(p));
  }

  async findAppliedAllByCustomerId(
    customerId: number,
  ): Promise<DiscountPolicyEntity | null> {
    const policy = await this.prisma.discountPolicy.findFirst({
      where: {
        customerId,
        isAppliedAll: true,
      },
    });

    if (!policy) return null;
    return this.mapToDomain(policy);
  }

  async create(
    policy: Omit<DiscountPolicyEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<DiscountPolicyEntity> {
    const created = await this.prisma.discountPolicy.create({
      data: {
        customerId: policy.customerId,
        discountType: policy.discountType as unknown as PrismaDiscountType,
        isAppliedAll: policy.isAppliedAll,
        productIds: policy.productIds,
        discountValue: new Prisma.Decimal(policy.discountValue.toString()),
      },
    });
    return this.mapToDomain(created);
  }

  async update(
    id: number,
    policy: Partial<DiscountPolicyEntity>,
  ): Promise<DiscountPolicyEntity> {
    const data: Prisma.DiscountPolicyUpdateInput = {};

    if (policy.isAppliedAll !== undefined) {
      data.isAppliedAll = policy.isAppliedAll;
    }
    if (policy.productIds !== undefined) {
      data.productIds = policy.productIds;
    }
    if (policy.discountValue !== undefined) {
      data.discountValue = new Prisma.Decimal(policy.discountValue.toString());
    }
    if (policy.discountType !== undefined) {
      data.discountType = policy.discountType as unknown as PrismaDiscountType;
    }
    if (policy.customerId !== undefined) {
      data.customer = { connect: { id: policy.customerId } };
    }

    const updated = await this.prisma.discountPolicy.update({
      where: { id },
      data,
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.discountPolicy.delete({
      where: { id },
    });
  }
}
