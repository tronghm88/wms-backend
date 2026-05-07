import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import { Decimal } from "decimal.js";
import type { ProductStockExportItem } from "../../domain/contracts/inventory.repository.interface";
import { EXCEL_HEADERS } from "./excel-column-headers";

export interface ExcelStockReportMeta {
  categoryCode: string;
  categoryName: string;
  baseUnitCode: string;
  baseUnitLabel: string;
  /** Additional unit codes ordered as defined in category.additionalUnits */
  additionalUnits: { code: string; label: string }[];
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class ExcelExportService {
  /**
   * Generates an .xlsx buffer for the stock export report.
   *
   * Column layout (left → right):
   *   1. Product Name
   *   2. Spec Text
   *   3. Width
   *   4. Height
   *   5..N. Unit Conversion pair columns:
   *          For each additional unit → two columns:
   *            a) Base unit label  (always "1")
   *            b) "AdditionalLabel/BaseLabel"  (conversion factor value)
   *   (N+1)..(N+4*unitCount). Stock columns per unit (base + each additional):
   *            Opening stock, Closing stock, Input qty, Output qty
   *   Last. Note (blank)
   */
  async generateStockReport(
    items: ProductStockExportItem[],
    meta: ExcelStockReportMeta,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "WMS System";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Báo cáo tồn kho", {
      views: [{ state: "frozen", ySplit: 2 }], // freeze first 2 header rows
    });

    // ── Build column definitions ──────────────────────────────────────────────

    const allUnits: { code: string; label: string }[] = [
      { code: meta.baseUnitCode, label: meta.baseUnitLabel },
      ...meta.additionalUnits,
    ];

    // Gather ordered conversions per product keyed by toUnit code
    // (so we can look up factor quickly)
    const convFactorForProduct = (
      item: ProductStockExportItem,
      unitCode: string,
    ): Decimal => {
      const conv = item.conversions.find((c) => c.toUnit === unitCode);
      return conv ? conv.factor : new Decimal(0);
    };

    const openingForUnit = (
      item: ProductStockExportItem,
      unitCode: string,
    ): Decimal => {
      if (unitCode === meta.baseUnitCode) return item.openingStockBase;
      const conv = item.conversions.find((c) => c.toUnit === unitCode);
      return conv ? conv.openingStock : new Decimal(0);
    };

    const closingForUnit = (
      item: ProductStockExportItem,
      unitCode: string,
    ): Decimal => {
      if (unitCode === meta.baseUnitCode) return item.closingStockBase;
      const conv = item.conversions.find((c) => c.toUnit === unitCode);
      return conv ? conv.closingStock : new Decimal(0);
    };

    const inputForUnit = (
      item: ProductStockExportItem,
      unitCode: string,
    ): Decimal => {
      if (unitCode === meta.baseUnitCode) return item.inputQtyBase;
      const factor = convFactorForProduct(item, unitCode);
      return item.inputQtyBase.mul(factor);
    };

    const outputForUnit = (
      item: ProductStockExportItem,
      unitCode: string,
    ): Decimal => {
      if (unitCode === meta.baseUnitCode) return item.outputQtyBase;
      const factor = convFactorForProduct(item, unitCode);
      return item.outputQtyBase.mul(factor);
    };

    // ── Row 1: merged title ───────────────────────────────────────────────────

    // Count total columns to know the merge range
    const staticCols = 4; // name, spec, width, height
    const convPairCols = meta.additionalUnits.length * 2;
    const stockCols = allUnits.length * 4; // opening, closing, input, output
    const noteCols = 1;
    const totalCols = staticCols + convPairCols + stockCols + noteCols;

    const fmt = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;

    const titleRow = sheet.addRow([
      `BÁO CÁO TỒN KHO - ${meta.categoryName.toUpperCase()} - Từ ${fmt(meta.startDate)} đến ${fmt(meta.endDate)}`,
    ]);
    sheet.mergeCells(1, 1, 1, totalCols);
    titleRow.height = 24;
    titleRow.getCell(1).font = { bold: true, size: 13 };
    titleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    // ── Row 2: column headers ─────────────────────────────────────────────────

    const headerValues: string[] = [
      EXCEL_HEADERS.productName,
      EXCEL_HEADERS.specText,
      EXCEL_HEADERS.width,
      EXCEL_HEADERS.height,
      EXCEL_HEADERS.length,
      EXCEL_HEADERS.baseUnit
    ];

    // Conversion pair headers
    for (const addUnit of meta.additionalUnits) {
      headerValues.push(
        EXCEL_HEADERS.conversionUnitSuffix(meta.baseUnitLabel, addUnit.label),
      ); // "KG/Cuộn"
    }

    // Stock columns per unit
    for (const unit of allUnits) {
      headerValues.push(EXCEL_HEADERS.openingStock(unit.label));
      headerValues.push(EXCEL_HEADERS.closingStock(unit.label));
      headerValues.push(EXCEL_HEADERS.inputQty(unit.label));
      headerValues.push(EXCEL_HEADERS.outputQty(unit.label));
    }

    headerValues.push(EXCEL_HEADERS.note);

    const headerRow = sheet.addRow(headerValues);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD6E4BC" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ── Data rows ─────────────────────────────────────────────────────────────

    for (const item of items) {
      const rowValues: (string | number | null)[] = [
        item.productName,
        item.specText,
        item.width ? Number(item.width.toFixed(3)) : null,
        item.height ? Number(item.height.toFixed(3)) : null,
        item.length ? Number(item.length.toFixed(3)) : null,
        meta.baseUnitLabel
      ];

      // Conversion pair values: always "1" for base, factor for additional
      for (const addUnit of meta.additionalUnits) {
        const factor = convFactorForProduct(item, addUnit.code);
        rowValues.push(Number(factor.toFixed(3)));
      }

      // Stock values per unit
      for (const unit of allUnits) {
        rowValues.push(Number(openingForUnit(item, unit.code).toFixed(3)));
        rowValues.push(Number(closingForUnit(item, unit.code).toFixed(3)));
        rowValues.push(Number(inputForUnit(item, unit.code).toFixed(3)));
        rowValues.push(Number(outputForUnit(item, unit.code).toFixed(3)));
      }

      rowValues.push(null); // Note – blank

      const dataRow = sheet.addRow(rowValues);
      dataRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    // ── Column widths ─────────────────────────────────────────────────────────

    sheet.getColumn(1).width = 30; // Product Name
    sheet.getColumn(2).width = 20; // Spec Text
    sheet.getColumn(3).width = 10; // Width
    sheet.getColumn(4).width = 10; // Height

    let colIdx = 5;
    for (let i = 0; i < meta.additionalUnits.length; i++) {
      sheet.getColumn(colIdx++).width = 10;
      sheet.getColumn(colIdx++).width = 14;
    }
    for (let i = 0; i < allUnits.length * 4; i++) {
      sheet.getColumn(colIdx++).width = 18;
    }
    sheet.getColumn(colIdx).width = 24; // Note

    // ── Write to buffer ───────────────────────────────────────────────────────

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Build a safe filename for the export. */
  buildFilename(categoryCode: string, startDate: Date, endDate: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fmt = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    return `stock_report_${categoryCode}_${fmt(startDate)}_${fmt(endDate)}.xlsx`;
  }
}
