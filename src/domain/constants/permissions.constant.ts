export const Permissions = {
  // System / Users
  USERS_MANAGE: "users:manage",
  SYSTEM_CONFIG_MANAGE: "system:config:manage",

  // Catalog
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_MANAGE: "categories:manage",
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_MANAGE: "customers:manage",
  UNITS_VIEW: "units:view",
  UNITS_MANAGE: "units:manage",

  // Inventory & Operations
  RECEIPTS_CREATE: "receipts:create",
  RECEIPTS_CONFIRM: "receipts:confirm",
  ISSUES_CREATE: "issues:create",
  ISSUES_CONFIRM: "issues:confirm",
  STOCK_SPLIT: "stock:split",
  STOCK_VOID: "stock:void",

  // Analytics & Reports
  INVENTORY_VIEW: "inventory:view",
  AUDIT_TRAIL_VIEW: "audit:trail:view",
  REPORTS_EXPORT: "reports:export",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const RolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: Object.values(Permissions),
  ADMIN: Object.values(Permissions),
  WAREHOUSE_STAFF: [
    Permissions.PRODUCTS_VIEW,
    Permissions.CATEGORIES_VIEW,
    Permissions.UNITS_VIEW,
    Permissions.CUSTOMERS_VIEW,
    Permissions.INVENTORY_VIEW,
    Permissions.RECEIPTS_CREATE,
    Permissions.RECEIPTS_CONFIRM,
    Permissions.ISSUES_CREATE,
    Permissions.ISSUES_CONFIRM,
    Permissions.STOCK_SPLIT,
    Permissions.REPORTS_EXPORT,
  ],
};
