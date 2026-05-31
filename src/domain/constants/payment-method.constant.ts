/**
 * Payment method options for Goods Issue tickets.
 * Used in the Excel export (PHIẾU GIAO HÀNG) to populate the TM/CK field.
 */
export const PaymentMethod = {
  CASH: "CASH",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

/** Vietnamese abbreviations used on the printed ticket */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "TM",
  [PaymentMethod.BANK_TRANSFER]: "CK",
};

export const DEFAULT_PAYMENT_METHOD: PaymentMethod =
  PaymentMethod.BANK_TRANSFER;
