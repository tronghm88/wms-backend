/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CreateUnitConversionUseCase } from "./create-unit-conversion.use-case";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import {
  UnitNotFoundException,
  UnitConversionAlreadyExistsException,
} from "../../../domain/exceptions/unit.exceptions";
import { Decimal } from "decimal.js";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { UnitEntity } from "../../../domain/entities/unit.entity";
import { UnitConversionEntity } from "../../../domain/entities/unit-conversion.entity";

describe("CreateUnitConversionUseCase", () => {
  let useCase: CreateUnitConversionUseCase;
  let productRepository: jest.Mocked<IProductRepository>;
  let unitRepository: jest.Mocked<IUnitRepository>;
  let unitConversionRepository: jest.Mocked<IUnitConversionRepository>;

  beforeEach(async () => {
    productRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasHistory: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    unitRepository = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    unitConversionRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByProductAndUnits: jest.fn(),
      findByProductId: jest.fn(),
    } as unknown as jest.Mocked<IUnitConversionRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUnitConversionUseCase,
        { provide: PRODUCT_REPOSITORY, useValue: productRepository },
        { provide: UNIT_REPOSITORY, useValue: unitRepository },
        {
          provide: UNIT_CONVERSION_REPOSITORY,
          useValue: unitConversionRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUnitConversionUseCase>(
      CreateUnitConversionUseCase,
    );
  });

  const request = {
    productId: 1,
    fromUnit: "box",
    toUnit: "pcs",
    factor: "24",
  };

  it("should create a unit conversion successfully", async () => {
    productRepository.findById.mockResolvedValue(new ProductEntity({ id: 1 }));
    unitRepository.findByCode.mockImplementation((code: string) => {
      if (code === "box" || code === "pcs") {
        return Promise.resolve(new UnitEntity({ code }));
      }
      return Promise.resolve(null);
    });
    unitConversionRepository.findByProductAndUnits.mockResolvedValue(null);
    unitConversionRepository.create.mockResolvedValue(
      new UnitConversionEntity({
        id: 10,
        productId: 1,
        fromUnit: "box",
        toUnit: "pcs",
        factor: new Decimal("24"),
      }),
    );

    const result = await useCase.execute(request);

    expect(result).toEqual({
      id: 10,
      productId: 1,
      fromUnit: "box",
      toUnit: "pcs",
      factor: "24.000",
    });
    expect(unitConversionRepository.create).toHaveBeenCalled();
  });

  it("should throw ProductNotFoundException if product does not exist", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it("should throw UnitNotFoundException if fromUnit does not exist", async () => {
    productRepository.findById.mockResolvedValue(new ProductEntity({ id: 1 }));
    unitRepository.findByCode.mockImplementation((code: string) => {
      if (code === "pcs") return Promise.resolve(new UnitEntity({ code }));
      return Promise.resolve(null);
    });

    await expect(useCase.execute(request)).rejects.toThrow(
      UnitNotFoundException,
    );
  });

  it("should throw UnitConversionAlreadyExistsException if conversion already exists", async () => {
    productRepository.findById.mockResolvedValue(new ProductEntity({ id: 1 }));
    unitRepository.findByCode.mockResolvedValue(
      new UnitEntity({ code: "any" }),
    );
    unitConversionRepository.findByProductAndUnits.mockResolvedValue(
      new UnitConversionEntity({ id: 1 }),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      UnitConversionAlreadyExistsException,
    );
  });
});
