-- AlterTable: add username (unique, varchar 50, NOT NULL) and phone (nullable, varchar 20) to users
-- username has a temporary default so we can backfill existing rows before making it NOT NULL

-- Step 1: add the column as nullable first to avoid issues with existing rows
ALTER TABLE "users" ADD COLUMN "username" VARCHAR(50);

-- Step 2: backfill existing rows with a unique value derived from their email local-part
UPDATE "users"
SET "username" = CONCAT(SPLIT_PART(email, '@', 1), CAST(id AS TEXT))
WHERE "username" IS NULL;

-- Step 3: make it NOT NULL and unique
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE ("username");

-- Step 4: add phone column (nullable)
ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(20);
