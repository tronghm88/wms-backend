import { Inject, Injectable } from "@nestjs/common";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import {
  UnitInUseException,
  UnitNotFoundException,
} from "../../../domain/exceptions/unit.exceptions";

@Injectable()
export class DeleteUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(code: string): Promise<void> {
    const unit = await this.unitRepository.findByCode(code);
    if (!unit) {
      throw new UnitNotFoundException(code);
    }

    const usedByProducts = await this.unitRepository.isUsedByProducts(code);
    if (usedByProducts) {
      throw new UnitInUseException(code);
    }

    try {
      await this.unitRepository.delete(code);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "P2003"
      ) {
        throw new UnitInUseException(code);
      }
      throw error;
    }
  }
}
