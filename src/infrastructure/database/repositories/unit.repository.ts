import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Unit as PrismaUnit } from "@prisma/client";
import { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { UnitEntity } from "../../../domain/entities/unit.entity";

@Injectable()
export class UnitRepository implements IUnitRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(unit: PrismaUnit): UnitEntity {
    return new UnitEntity({
      code: unit.code,
    });
  }

  async findByCode(code: string): Promise<UnitEntity | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { code },
    });

    if (!unit) return null;
    return this.mapToDomain(unit);
  }

  async findAll(): Promise<UnitEntity[]> {
    const units = await this.prisma.unit.findMany();
    return units.map((unit) => this.mapToDomain(unit));
  }

  async create(unit: UnitEntity): Promise<UnitEntity> {
    const createdUnit = await this.prisma.unit.create({
      data: {
        code: unit.code,
      },
    });
    return this.mapToDomain(createdUnit);
  }

  async update(code: string, unit: Partial<UnitEntity>): Promise<UnitEntity> {
    const updatedUnit = await this.prisma.unit.update({
      where: { code },
      data: {
        code: unit.code,
      },
    });
    return this.mapToDomain(updatedUnit);
  }

  async delete(code: string): Promise<void> {
    await this.prisma.unit.delete({
      where: { code },
    });
  }
}
