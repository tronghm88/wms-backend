import { Inject, Injectable } from "@nestjs/common";
import { Decimal } from "decimal.js";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { INVENTORY_REPOSITORY } from "../../../domain/contracts/inventory.repository.interface";
import type { IInventoryRepository } from "../../../domain/contracts/inventory.repository.interface";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";

export interface UnitConversionItem {
  unit: string;
  label: string;
  rate: string;
}

export interface StockConversionItem {
  unit: string;
  label: string;
  stock: string;
}

export interface GetProductResponse {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
  baseUnit: string;
  baseUnitLabel: string;
  basePrice: string;
  costPrice?: string;
  reorderThreshold: string;
  description?: string;
  specText?: string;
  length: string | null;
  width: string | null;
  height: string | null;
  parentProductId?: number;
  stock: string;
  unitConversions: UnitConversionItem[];
  stockConversions: StockConversionItem[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(id: number): Promise<GetProductResponse> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    // Fetch inventory, unit conversions, and base unit label in parallel
    const [inventory, conversions, baseUnitEntity] = await Promise.all([
      this.inventoryRepository.findByProductId(id),
      this.unitConversionRepository.findByProductId(id),
      this.unitRepository.findByCode(product.baseUnit),
    ]);

    const stockQty = inventory
      ? new Decimal(inventory.quantity.toString()) // .toString() is used to avoid the precision loss when converting from BigInt to Decimal
      : new Decimal(0);

    // Collect all toUnit codes from conversions to fetch labels
    const toUnitCodes = conversions.map((c) => c.toUnit);
    const unitLabelMap = new Map<string, string>();

    if (toUnitCodes.length > 0) {
      const allUnits = await this.unitRepository.findAll();
      for (const unit of allUnits) {
        if (toUnitCodes.includes(unit.code)) {
          unitLabelMap.set(unit.code, unit.label);
        }
      }
    }

    // Build unit conversion list
    const unitConversions: UnitConversionItem[] = conversions.map((c) => ({
      unit: c.toUnit,
      label: unitLabelMap.get(c.toUnit) ?? c.toUnit,
      rate: c.factor.toFixed(3),
    }));

    // Build stock conversion list: stock * factor for each conversion
    const stockConversions: StockConversionItem[] = conversions.map((c) => {
      const convertedStock = stockQty.mul(c.factor);
      return {
        unit: c.toUnit,
        label: unitLabelMap.get(c.toUnit) ?? c.toUnit,
        stock: convertedStock.toFixed(3),
      };
    });

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      baseUnit: product.baseUnit,
      baseUnitLabel: baseUnitEntity?.label ?? product.baseUnit,
      basePrice: product.basePrice.toFixed(3),
      costPrice: product.costPrice?.toFixed(3),
      reorderThreshold: product.reorderThreshold.toFixed(3),
      description: product.description ?? undefined,
      specText: product.specText ?? undefined,
      length: product.length ? product.length.toFixed(3) : null,
      width: product.width ? product.width.toFixed(3) : null,
      height: product.height ? product.height.toFixed(3) : null,
      parentProductId: product.parentProductId,
      stock: stockQty.toFixed(3),
      unitConversions,
      stockConversions,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
