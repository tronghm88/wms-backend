import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { UnitConversion as PrismaUnitConversion } from "@prisma/client";
import { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionEntity } from "../../../domain/entities/unit-conversion.entity";
import { Decimal } from "decimal.js";

@Injectable()
export class UnitConversionRepository implements IUnitConversionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(uc: PrismaUnitConversion): UnitConversionEntity {
    return new UnitConversionEntity({
      id: uc.id,
      productId: uc.productId,
      fromUnit: uc.fromUnit,
      toUnit: uc.toUnit,
      factor: new Decimal(uc.factor.toString()),
      createdAt: uc.createdAt,
      updatedAt: uc.updatedAt,
    });
  }

  async create(
    conversion: UnitConversionEntity,
  ): Promise<UnitConversionEntity> {
    const created = await this.prisma.unitConversion.create({
      data: {
        productId: conversion.productId,
        fromUnit: conversion.fromUnit,
        toUnit: conversion.toUnit,
        factor: conversion.factor.toString(),
      },
    });
    return this.mapToDomain(created);
  }

  async findById(id: number): Promise<UnitConversionEntity | null> {
    const uc = await this.prisma.unitConversion.findUnique({
      where: { id },
    });

    if (!uc) return null;
    return this.mapToDomain(uc);
  }

  async update(
    id: number,
    conversion: Partial<UnitConversionEntity>,
  ): Promise<UnitConversionEntity> {
    const updated = await this.prisma.unitConversion.update({
      where: { id },
      data: {
        productId: conversion.productId,
        fromUnit: conversion.fromUnit,
        toUnit: conversion.toUnit,
        factor: conversion.factor?.toString(),
      },
    });
    return this.mapToDomain(updated);
  }

  async findByProductAndUnits(
    productId: number,
    fromUnit: string,
    toUnit: string,
  ): Promise<UnitConversionEntity | null> {
    const uc = await this.prisma.unitConversion.findFirst({
      where: {
        productId,
        fromUnit,
        toUnit,
      },
    });

    if (!uc) return null;
    return this.mapToDomain(uc);
  }

  async findByProductId(productId: number): Promise<UnitConversionEntity[]> {
    const conversions = await this.prisma.unitConversion.findMany({
      where: { productId },
    });

    return conversions.map((uc) => this.mapToDomain(uc));
  }

  async findAll(productId?: number): Promise<UnitConversionEntity[]> {
    const conversions = await this.prisma.unitConversion.findMany({
      where: {
        productId: productId ? productId : undefined,
      },
      orderBy: { id: "asc" },
    });

    return conversions.map((uc) => this.mapToDomain(uc));
  }
}
