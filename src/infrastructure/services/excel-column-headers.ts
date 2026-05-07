/**
 * Vietnamese column header labels for the stock export Excel report.
 * Centralised here so translators / POs can update labels without touching service logic.
 */
export const EXCEL_HEADERS = {
  productName: "Tên sản phẩm",
  specText: "Quy cách",
  width: "Chiều rộng",
  height: "Chiều cao",
  length: "Chiều dài",
  baseUnit: "Đơn vị",
  /** Prefix for additional-unit conversion column, e.g. "KG/cuộn" */
  conversionUnitSuffix: (baseUnitLabel: string, additionalUnitLabel: string) =>
    `${additionalUnitLabel}/${baseUnitLabel}`,
  openingStock: (unitLabel: string) => `Tồn đầu kỳ (${unitLabel})`,
  closingStock: (unitLabel: string) => `Tồn cuối kỳ (${unitLabel})`,
  inputQty: (unitLabel: string) => `Nhập trong kỳ (${unitLabel})`,
  outputQty: (unitLabel: string) => `Xuất trong kỳ (${unitLabel})`,
  note: "Ghi chú",
} as const;
