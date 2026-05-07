import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
  type StockExportReportFilters,
} from "../../../domain/contracts/inventory.repository.interface";
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from "../../../domain/contracts/category.repository.interface";
import {
  ExcelExportService,
  type ExcelStockReportMeta,
} from "../../../infrastructure/services/excel-export.service";

export interface ExportStockReportInput {
  categoryId: number;
  startDate?: string;
  endDate?: string;
}

export interface ExportStockReportResult {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ExportStockReportUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly excelExportService: ExcelExportService,
  ) {}

  async execute(
    input: ExportStockReportInput,
  ): Promise<ExportStockReportResult> {
    // ── 1. Validate category exists and load unit metadata ───────────────────
    const category = await this.categoryRepository.findByIdWithUnits(
      input.categoryId,
    );
    if (!category) {
      throw new NotFoundException(
        `Category with id ${input.categoryId} not found`,
      );
    }

    // ── 2. Resolve date range (default: current month) ───────────────────────
    const { startDate, endDate } = this.resolveDefaultDates(
      input.startDate,
      input.endDate,
    );

    // ── 3. Fetch all product stock data for the category ─────────────────────
    const filters: StockExportReportFilters = {
      startDate,
      endDate,
      categoryId: input.categoryId,
    };
    const items = await this.inventoryRepository.getStockExportReport(filters);

    // ── 4. Build unit metadata from category ─────────────────────────────────
    // category.additionalUnits is an array of unit codes (strings).
    // We need their labels too. The labels are stored in the units table.
    // Since the category entity only has additionalUnits as string[] (unit codes),
    // we derive the label from the product conversions of the first item.
    // This is safe because all products in the same category share the same units.
    const additionalUnitsMeta = this.resolveAdditionalUnitLabels(
      category.additionalUnits ?? [],
      items,
    );

    const meta: ExcelStockReportMeta = {
      categoryCode: category.code,
      categoryName: category.name,
      baseUnitCode: category.baseUnit ?? "",
      baseUnitLabel: category.baseUnitLabel ?? category.baseUnit ?? "",
      additionalUnits: additionalUnitsMeta,
      startDate,
      endDate,
    };

    // ── 5. Generate Excel buffer ─────────────────────────────────────────────
    const buffer = await this.excelExportService.generateStockReport(
      items,
      meta,
    );

    const filename = this.excelExportService.buildFilename(
      category.code,
      startDate,
      endDate,
    );

    return { buffer, filename };
  }

  /**
   * Derives the labels for additional units.
   * Unit codes are in category.additionalUnits; labels come from the first
   * product's unitConversions (all products in the same category share the
   * same additional units defined by the category).
   */
  private resolveAdditionalUnitLabels(
    additionalUnitCodes: string[],
    items: {
      conversions: { toUnit: string; toUnitLabel: string }[];
    }[],
  ): { code: string; label: string }[] {
    if (additionalUnitCodes.length === 0) return [];

    // Build a label map from any item that has conversions
    const labelMap = new Map<string, string>();
    for (const item of items) {
      for (const conv of item.conversions) {
        if (!labelMap.has(conv.toUnit)) {
          labelMap.set(conv.toUnit, conv.toUnitLabel);
        }
      }
      if (labelMap.size >= additionalUnitCodes.length) break;
    }

    return additionalUnitCodes.map((code) => ({
      code,
      label: labelMap.get(code) ?? code, // fallback to code if label not found
    }));
  }

  private resolveDefaultDates(
    startDateParam?: string,
    endDateParam?: string,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = endDateParam ? new Date(endDateParam) : now;
    let startDate: Date;
    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      startDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
      );
    }
    return { startDate, endDate };
  }
}
