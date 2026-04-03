export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  WAREHOUSE_STAFF = 'WAREHOUSE_STAFF',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  SPLIT_IN = 'SPLIT_IN',
  SPLIT_OUT = 'SPLIT_OUT',
  ADJUST = 'ADJUST',
}
