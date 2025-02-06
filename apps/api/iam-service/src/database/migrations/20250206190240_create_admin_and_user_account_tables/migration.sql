-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'admin_user', 'vendor', 'customer');

-- CreateTable
CREATE TABLE "tbl_user_accounts" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_url" TEXT,
    "user_type" "Role" NOT NULL,
    "user_reference_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_admins" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_url" TEXT,
    "profile_id" TEXT,
    "phone_number" TEXT,
    "address" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "admin_group_id" INTEGER NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "tbl_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_accounts_email_key" ON "tbl_user_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_accounts_user_type_user_reference_id_key" ON "tbl_user_accounts"("user_type", "user_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_admins_email_key" ON "tbl_admins"("email");

-- AddForeignKey
ALTER TABLE "tbl_admin_groups" ADD CONSTRAINT "tbl_admin_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_groups" ADD CONSTRAINT "tbl_admin_groups_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_groups" ADD CONSTRAINT "tbl_admin_groups_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admins" ADD CONSTRAINT "tbl_admins_admin_group_id_fkey" FOREIGN KEY ("admin_group_id") REFERENCES "tbl_admin_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admins" ADD CONSTRAINT "tbl_admins_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admins" ADD CONSTRAINT "tbl_admins_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admins" ADD CONSTRAINT "tbl_admins_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
