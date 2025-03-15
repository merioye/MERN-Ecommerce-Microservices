-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'system';

-- CreateTable
CREATE TABLE "tbl_permission_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "tbl_permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_permissions" (
    "id" SERIAL NOT NULL,
    "permission_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "tbl_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_admin_group_permissions" (
    "id" SERIAL NOT NULL,
    "admin_group_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "tbl_admin_group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_admin_permissions" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "tbl_admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permission_groups_name_key" ON "tbl_permission_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permission_groups_slug_key" ON "tbl_permission_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permissions_name_key" ON "tbl_permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permissions_slug_key" ON "tbl_permissions"("slug");

-- AddForeignKey
ALTER TABLE "tbl_permission_groups" ADD CONSTRAINT "tbl_permission_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_permission_groups" ADD CONSTRAINT "tbl_permission_groups_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_permissions" ADD CONSTRAINT "tbl_permissions_permission_group_id_fkey" FOREIGN KEY ("permission_group_id") REFERENCES "tbl_permission_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_permissions" ADD CONSTRAINT "tbl_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_permissions" ADD CONSTRAINT "tbl_permissions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_group_permissions" ADD CONSTRAINT "tbl_admin_group_permissions_admin_group_id_fkey" FOREIGN KEY ("admin_group_id") REFERENCES "tbl_admin_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_group_permissions" ADD CONSTRAINT "tbl_admin_group_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "tbl_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_group_permissions" ADD CONSTRAINT "tbl_admin_group_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_group_permissions" ADD CONSTRAINT "tbl_admin_group_permissions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_permissions" ADD CONSTRAINT "tbl_admin_permissions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "tbl_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_permissions" ADD CONSTRAINT "tbl_admin_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "tbl_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_permissions" ADD CONSTRAINT "tbl_admin_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_admin_permissions" ADD CONSTRAINT "tbl_admin_permissions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
