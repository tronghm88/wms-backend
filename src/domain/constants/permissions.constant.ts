export const Permissions = {
  // System / Users
  SYSTEM_CONFIG_MANAGE: "system:config:manage",

  // Users
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_ACTIVATE: "users:activate",
  USERS_RESET_PASSWORD: "users:reset-password",

  // Catalog - Products
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_DELETE: "products:delete",

  // Catalog - Categories
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_UPDATE: "categories:update",
  CATEGORIES_DELETE: "categories:delete",

  // Catalog - Customers
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_UPDATE: "customers:update",
  CUSTOMERS_ACTIVATE: "customers:activate",
  CUSTOMERS_DELETE: "customers:delete",

  // Catalog - Discount Policies
  DISCOUNT_POLICIES_VIEW: "discount-policies:view",
  DISCOUNT_POLICIES_CREATE: "discount-policies:create",
  DISCOUNT_POLICIES_UPDATE: "discount-policies:update",
  DISCOUNT_POLICIES_DELETE: "discount-policies:delete",

  // Catalog - Units
  UNITS_VIEW: "units:view",
  UNITS_CREATE: "units:create",
  UNITS_UPDATE: "units:update",
  UNITS_DELETE: "units:delete",

  // Inventory & Operations
  RECEIPTS_VIEW: "receipts:view",
  RECEIPTS_CREATE: "receipts:create",
  RECEIPTS_DELETE: "receipts:delete",
  RECEIPTS_CONFIRM: "receipts:confirm",
  RECEIPTS_CANCEL: "receipts:cancel",
  ISSUES_VIEW: "issues:view",
  ISSUES_CREATE: "issues:create",
  ISSUES_DELETE: "issues:delete",
  ISSUES_CONFIRM: "issues:confirm",
  ISSUES_CANCEL: "issues:cancel",
  ISSUES_PRICE_OVERRIDE: "issues:price-override",
  STOCK_SPLIT: "stock:split",
  STOCK_CANCEL: "stock:cancel",

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
    Permissions.DISCOUNT_POLICIES_VIEW,
    Permissions.INVENTORY_VIEW,
    Permissions.RECEIPTS_VIEW,
    Permissions.RECEIPTS_CREATE,
    Permissions.RECEIPTS_DELETE,
    Permissions.RECEIPTS_CONFIRM,
    Permissions.ISSUES_VIEW,
    Permissions.ISSUES_CREATE,
    Permissions.ISSUES_DELETE,
    Permissions.ISSUES_CONFIRM,
    Permissions.STOCK_SPLIT,
    Permissions.REPORTS_EXPORT,
  ],
};
