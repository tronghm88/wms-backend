import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import * as path from "path";
import { Decimal } from "decimal.js";
import type { ProductStockExportItem } from "../../domain/contracts/inventory.repository.interface";
import { EXCEL_HEADERS } from "./excel-column-headers";
import type { IssueTicketEntity } from "../../domain/entities/issue-ticket.entity";
import type { ReceiptTicketEntity } from "../../domain/entities/receipt-ticket.entity";
import type { ReceiptTicketLineEntity } from "../../domain/entities/receipt-ticket-line.entity";
import type { SplitTicketEntity } from "../../domain/entities/split-ticket.entity";
import {
  type PaymentMethod,
  PAYMENT_METHOD_LABEL,
  DEFAULT_PAYMENT_METHOD,
} from "../../domain/constants/payment-method.constant";

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
      EXCEL_HEADERS.baseUnit,
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
        meta.baseUnitLabel,
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

  /** Build a safe filename for the stock export. */
  buildFilename(categoryCode: string, startDate: Date, endDate: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const fmt = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    return `stock_report_${categoryCode}_${fmt(startDate)}_${fmt(endDate)}.xlsx`;
  }

  // ─── Issue Ticket Export ──────────────────────────────────────────────────────

  /**
   * Fills the PHIẾU GIAO HÀNG template with live ticket data and returns an xlsx buffer.
   *
   * Layout strategy:
   *   Rows 1–9  : Static template content (kept as-is)
   *   Row 10..N : One row per ticket line
   *   Row N+1   : Blank separator
   *   Row N+2..N+1+U : One summary row per distinct unitCode (U = number of units)
   *   Row N+2+U : Disclaimer text
   *   Row N+3+U : Signature row 1
   *   Row N+4+U : Signature row 2
   *   Row N+5+U : Signature row 3
   */
  async generateIssueTicketExport(
    ticket: IssueTicketEntity,
    paymentMethod?: PaymentMethod,
  ): Promise<Buffer> {
    const templatePath = path.resolve(
      process.cwd(),
      "excel_templates",
      "issue_ticket_template.xlsx",
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const sheet = workbook.getWorksheet("Phiếu Xuất");
    if (!sheet) {
      throw new Error('Worksheet "Phiếu Xuất" not found in template');
    }

    const effectivePaymentMethod = paymentMethod ?? DEFAULT_PAYMENT_METHOD;

    // ── 1. Fill header cells ──────────────────────────────────────────────────

    // Row 5: date — "Ngày DD Tháng MM Năm YYYY"
    const d = ticket.createdAt;
    const dateStr = `Ngày ${d.getDate()} Tháng ${d.getMonth() + 1} Năm ${d.getFullYear()}`;
    sheet.getCell("F5").value = dateStr;

    // Row 6: customer name (A6) | tax/phone (D6)
    const taxAndPhone = [
      ticket.customerTaxCode || "-",
      ticket.customerPhone || "-",
    ];
    sheet.getCell("C6").value = ticket.customerName ?? "";
    sheet.getCell("E6").value = taxAndPhone.join(" / ");

    // Row 7: address (A7) | payment method (D7) | ticket number (H7)
    sheet.getCell("C7").value = ticket.customerAddress ?? "";
    sheet.getCell("E7").value = PAYMENT_METHOD_LABEL[effectivePaymentMethod];
    sheet.getCell("H7").value = ticket.code;

    // ── 2. Save template row-10 style for new data rows ───────────────────────

    const templateDataRow = sheet.getRow(10);
    const templateCellStyles: ExcelJS.Style[] = [];
    for (let c = 1; c <= 9; c++) {
      const cell = templateDataRow.getCell(c);
      // Deep-copy the style object
      templateCellStyles[c] = JSON.parse(
        JSON.stringify(cell.style),
      ) as ExcelJS.Style;
    }

    // ── 4. Write ticket lines ─────────────────────────────────────────────────

    const DATA_START = 10;
    const lines = ticket.lines ?? [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Build the row values array (columns 1–9)
      const rowValues: ExcelJS.CellValue[] = [
        i + 1, // col 1: STT
        null, // col 2: blank
        line.productName ?? "", // col 3: Mã Hàng / product name
        line.productWidth ? Number(line.productWidth.toFixed(3)) : null, // col 4: Rộng
        line.productHeight ? Number(line.productHeight.toFixed(3)) : null, // col 5: Dài
        Number(line.quantity.toFixed(3)), // col 6: SL
        line.unitCode, // col 7: DV
        Number(line.finalPrice.toFixed(3)), // col 8: Đơn giá
        Number(line.lineTotal.toFixed(3)), // col 9: Thành Tiền
      ];

      // Insert the row at the correct position (after previously inserted rows)
      const insertAt = DATA_START + i;
      sheet.insertRow(insertAt, rowValues);

      // Apply template styles to each cell in the new row
      const newRow = sheet.getRow(insertAt);
      newRow.height = 21;
      for (let c = 1; c <= 9; c++) {
        if (templateCellStyles[c]) {
          newRow.getCell(c).style = JSON.parse(
            JSON.stringify(templateCellStyles[c]),
          ) as ExcelJS.Style;
        }
      }
      newRow.commit();
    }

    // ── 5. Sum row with SUM formulas ──────────────────────────────────────────

    const dataEndRow = DATA_START + lines.length - 1;
    const blankRowNum = dataEndRow + 1;
    const sumStartRow = blankRowNum + 2;

    // Blank separator row
    sheet.getRow(blankRowNum).height = 21;

    // Write one sum row per unit
    const sumRow = sheet.getRow(sumStartRow);
    sumRow.height = 21;

    // F{sumRowNum} = SUM(F10:F{dataEndRow}) — total quantity
    sumRow.getCell(6).value = {
      formula: `SUM(F${DATA_START}:F${dataEndRow})`,
    };

    // I{sumRowNum} = SUM(I10:I{dataEndRow}) — total amount
    sumRow.getCell(9).value = {
      formula: `SUM(I${DATA_START}:I${dataEndRow})`,
    };

    sumRow.commit();

    // ── 7. Write to buffer ────────────────────────────────────────────────────

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Build a filename for the issue ticket export. */
  buildIssueTicketFilename(ticketCode: string, createdAt: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const datePart = `${createdAt.getFullYear()}${pad(createdAt.getMonth() + 1)}${pad(createdAt.getDate())}`;
    // Replace "/" and spaces that could appear in ticket codes
    const safeCode = ticketCode.replace(/[^a-zA-Z0-9-_]/g, "_");
    return `phieu_giao_hang_${safeCode}_${datePart}.xlsx`;
  }

  // ─── Receipt Ticket Export ────────────────────────────────────────────────────

  /**
   * Fills the receipt ticket template with live ticket data and returns an xlsx buffer.
   *
   * Layout strategy:
   *   Cell F6 : created_at formatted as dd/MM/yyyy
   *   Cell F7 : ticket code (ticketNo)
   *   Row 9..N: One row per ticket line
   *     col 1: product name
   *     col 2: width
   *     col 3: length
   *     col 4: height
   *     col 5: quantity
   *     col 6: note
   *   Row N+1 : SUM formula =SUM(E9:EN)
   */
  async generateReceiptTicketExport(
    ticket: ReceiptTicketEntity,
    lines: ReceiptTicketLineEntity[],
  ): Promise<Buffer> {
    const templatePath = path.resolve(
      process.cwd(),
      "excel_templates",
      "receipt_ticket_template.xlsx",
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new Error("No worksheet found in receipt ticket template");
    }

    // ── 1. Fill header cells ──────────────────────────────────────────────────

    // F6: created_at formatted dd/MM/yyyy
    const d = ticket.createdAt;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    sheet.getCell("F6").value = dateStr;

    // F7: ticket code
    sheet.getCell("F7").value = ticket.ticketNo;

    // ── 2. Save template row-9 style for inserted data rows ──────────────────

    const DATA_START_ROW = 9;
    const templateDataRow = sheet.getRow(DATA_START_ROW);
    const templateCellStyles: ExcelJS.Style[] = [];
    for (let c = 1; c <= 6; c++) {
      templateCellStyles[c] = JSON.parse(
        JSON.stringify(templateDataRow.getCell(c).style),
      ) as ExcelJS.Style;
    }

    // ── 3. Insert ticket lines ────────────────────────────────────────────────

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const rowValues: ExcelJS.CellValue[] = [
        line.productName ?? "", // col 1: product name
        line.productWidth ? Number(line.productWidth.toFixed(3)) : null, // col 2: width
        line.productLength ? Number(line.productLength.toFixed(3)) : null, // col 3: length
        line.productHeight ? Number(line.productHeight.toFixed(3)) : null, // col 4: height
        Number(line.quantity.toFixed(3)), // col 5: quantity
        line.note ?? "", // col 6: note
      ];

      const insertAt = DATA_START_ROW + i;
      sheet.insertRow(insertAt, rowValues);

      // Apply template styles to the newly inserted row
      const newRow = sheet.getRow(insertAt);
      newRow.height = 21;
      for (let c = 1; c <= 6; c++) {
        if (templateCellStyles[c]) {
          newRow.getCell(c).style = JSON.parse(
            JSON.stringify(templateCellStyles[c]),
          ) as ExcelJS.Style;
        }
      }
      newRow.commit();
    }

    // ── 4. Write SUM formula for quantity column ───────────────────────────────

    const dataEndRow = DATA_START_ROW + lines.length - 1;
    const sumRowNum = dataEndRow + 2;
    const sumRow = sheet.getRow(sumRowNum);
    sumRow.getCell(5).value = {
      formula: `SUM(E${DATA_START_ROW}:E${dataEndRow})`,
    };
    sumRow.commit();

    // ── 4. Write to buffer ────────────────────────────────────────────────────

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Build a filename for the receipt ticket export. */
  buildReceiptTicketFilename(ticketNo: string, createdAt: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const datePart = `${createdAt.getFullYear()}${pad(createdAt.getMonth() + 1)}${pad(createdAt.getDate())}`;
    const safeCode = ticketNo.replace(/[^a-zA-Z0-9-_]/g, "_");
    return `phieu_nhap_hang_${safeCode}_${datePart}.xlsx`;
  }

  // ─── Split Ticket Export ──────────────────────────────────────────────────────

  /**
   * Fills the split ticket template with live ticket data and returns an xlsx buffer.
   *
   * Layout strategy:
   *   Cell H7 : created_at formatted dd/MM/yyyy
   *   Cell H8 : ticket code (ticketNo)
   *   Cell B7 : source product name
   *   Cell B8 : source quantity
   *   Cell B9 : ticket note
   *   Row 12..N: One row per ticket line
   *     col 1: ordering number
   *     col 2: destination product name
   *     col 3: width
   *     col 4: length
   *     col 5: height
   *     col 6: quantity
   *     col 7: unit
   *     col 8: note
   *   Row N+2 : SUM formula =SUM(F12:FN)
   */
  async generateSplitTicketExport(ticket: SplitTicketEntity): Promise<Buffer> {
    const templatePath = path.resolve(
      process.cwd(),
      "excel_templates",
      "split_ticket_template.xlsx",
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new Error("No worksheet found in split ticket template");
    }

    // ── 1. Fill header cells ──────────────────────────────────────────────────

    const d = ticket.createdAt;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

    // H7: created_at formatted dd/MM/yyyy
    sheet.getCell("H7").value = dateStr;

    // H8: ticket code
    sheet.getCell("H8").value = ticket.ticketNo;

    // B7: source product name
    sheet.getCell("B7").value = ticket.sourceProductName ?? "";

    // B8: source quantity
    sheet.getCell("B8").value = Number(ticket.sourceQty.toFixed(3));

    // B9: ticket note
    sheet.getCell("B9").value = ticket.note ?? "";

    // ── 2. Save template row-12 style for inserted data rows ──────────────────

    const DATA_START_ROW = 12;
    const templateDataRow = sheet.getRow(DATA_START_ROW);
    const templateCellStyles: ExcelJS.Style[] = [];
    for (let c = 1; c <= 8; c++) {
      templateCellStyles[c] = JSON.parse(
        JSON.stringify(templateDataRow.getCell(c).style),
      ) as ExcelJS.Style;
    }

    // ── 3. Insert ticket lines ────────────────────────────────────────────────

    const lines = ticket.lines ?? [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const rowValues: ExcelJS.CellValue[] = [
        i + 1, // col 1: ordering number
        line.targetProductName ?? "", // col 2: destination product name
        line.productWidth ? Number(line.productWidth.toFixed(3)) : null, // col 3: width
        line.productLength ? Number(line.productLength.toFixed(3)) : null, // col 4: length
        line.productHeight ? Number(line.productHeight.toFixed(3)) : null, // col 5: height
        Number(line.quantity.toFixed(3)), // col 6: quantity
        line.unitLabel ?? line.unitCode, // col 7: unit
        line.note ?? "", // col 8: note
      ];

      const insertAt = DATA_START_ROW + i;
      sheet.insertRow(insertAt, rowValues);

      // Apply template styles to the newly inserted row
      const newRow = sheet.getRow(insertAt);
      newRow.height = 21;
      for (let c = 1; c <= 8; c++) {
        if (templateCellStyles[c]) {
          newRow.getCell(c).style = JSON.parse(
            JSON.stringify(templateCellStyles[c]),
          ) as ExcelJS.Style;
        }
      }
      newRow.commit();
    }

    // ── 4. Write SUM formula for quantity column ───────────────────────────────

    const dataEndRow = DATA_START_ROW + lines.length - 1;
    const sumRowNum = dataEndRow + 2;
    const sumRow = sheet.getRow(sumRowNum);
    sumRow.getCell(6).value = {
      formula: `SUM(F${DATA_START_ROW}:F${dataEndRow})`,
    };
    sumRow.commit();

    // ── 5. Write to buffer ────────────────────────────────────────────────────

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Build a filename for the split ticket export. */
  buildSplitTicketFilename(ticketNo: string, createdAt: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const datePart = `${createdAt.getFullYear()}${pad(createdAt.getMonth() + 1)}${pad(createdAt.getDate())}`;
    const safeCode = ticketNo.replace(/[^a-zA-Z0-9-_]/g, "_");
    return `phieu_tach_${safeCode}_${datePart}.xlsx`;
  }
}
