-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_STAFF');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT', 'SPLIT_IN', 'SPLIT_OUT', 'ADJUST');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'WAREHOUSE_STAFF',
    "custom_permissions" TEXT[],
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "code" TEXT NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_sizes" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "base_unit" TEXT NOT NULL,
    "base_price" DECIMAL(15,3) NOT NULL,
    "length" DECIMAL(15,3),
    "width" DECIMAL(15,3),
    "height" DECIMAL(15,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_conversions" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "from_unit" TEXT NOT NULL,
    "to_unit" TEXT NOT NULL,
    "factor" DECIMAL(15,3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_policies" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "is_applied_all" BOOLEAN NOT NULL DEFAULT false,
    "product_ids" INTEGER[],
    "discount_value" DECIMAL(15,3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_no" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_ticket_lines" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unit_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_ticket_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_no" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "total_amount" DECIMAL(15,3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_ticket_lines" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unit_code" TEXT NOT NULL,
    "base_price" DECIMAL(15,3) NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(15,3) NOT NULL,
    "final_price" DECIMAL(15,3) NOT NULL,
    "line_total" DECIMAL(15,3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_ticket_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_no" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "source_product_id" INTEGER NOT NULL,
    "source_qty" DECIMAL(15,3) NOT NULL,
    "source_unit_code" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_ticket_lines" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "target_product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unit_code" TEXT NOT NULL,
    "is_new_product" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_ticket_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unit_code" TEXT NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "tx_type" "StockMovementType" NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "reference_type" TEXT NOT NULL,
    "delta_qty" DECIMAL(15,3) NOT NULL,
    "qty_after" DECIMAL(15,3) NOT NULL,
    "performed_by" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "discount_policies_customer_id_is_applied_all_key" ON "discount_policies"("customer_id", "is_applied_all");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_tickets_ticket_no_key" ON "receipt_tickets"("ticket_no");

-- CreateIndex
CREATE UNIQUE INDEX "issue_tickets_ticket_no_key" ON "issue_tickets"("ticket_no");

-- CreateIndex
CREATE UNIQUE INDEX "split_tickets_ticket_no_key" ON "split_tickets"("ticket_no");

-- AddForeignKey
ALTER TABLE "category_sizes" ADD CONSTRAINT "category_sizes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_base_unit_fkey" FOREIGN KEY ("base_unit") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_from_unit_fkey" FOREIGN KEY ("from_unit") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_to_unit_fkey" FOREIGN KEY ("to_unit") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_policies" ADD CONSTRAINT "discount_policies_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_tickets" ADD CONSTRAINT "receipt_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_ticket_lines" ADD CONSTRAINT "receipt_ticket_lines_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "receipt_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_ticket_lines" ADD CONSTRAINT "receipt_ticket_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_ticket_lines" ADD CONSTRAINT "receipt_ticket_lines_unit_code_fkey" FOREIGN KEY ("unit_code") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tickets" ADD CONSTRAINT "issue_tickets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_tickets" ADD CONSTRAINT "issue_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_ticket_lines" ADD CONSTRAINT "issue_ticket_lines_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "issue_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_ticket_lines" ADD CONSTRAINT "issue_ticket_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_ticket_lines" ADD CONSTRAINT "issue_ticket_lines_unit_code_fkey" FOREIGN KEY ("unit_code") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_tickets" ADD CONSTRAINT "split_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_tickets" ADD CONSTRAINT "split_tickets_source_product_id_fkey" FOREIGN KEY ("source_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_tickets" ADD CONSTRAINT "split_tickets_source_unit_code_fkey" FOREIGN KEY ("source_unit_code") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_ticket_lines" ADD CONSTRAINT "split_ticket_lines_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "split_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_ticket_lines" ADD CONSTRAINT "split_ticket_lines_target_product_id_fkey" FOREIGN KEY ("target_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_unit_code_fkey" FOREIGN KEY ("unit_code") REFERENCES "units"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
