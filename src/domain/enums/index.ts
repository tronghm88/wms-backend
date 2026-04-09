export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  WAREHOUSE_STAFF = "WAREHOUSE_STAFF",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum TransactionStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  VOIDED = "VOIDED",
}

export enum DiscountType {
  NONE = "NONE",
  PERCENT = "PERCENT",
  AMOUNT = "AMOUNT",
}

export enum StockMovementType {
  IN = "IN",
  OUT = "OUT",
  SPLIT_IN = "SPLIT_IN",
  SPLIT_OUT = "SPLIT_OUT",
  ADJUST = "ADJUST",
}
