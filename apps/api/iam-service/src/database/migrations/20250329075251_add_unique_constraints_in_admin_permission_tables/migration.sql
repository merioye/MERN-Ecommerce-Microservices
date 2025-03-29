/*
  Warnings:

  - A unique constraint covering the columns `[admin_group_id,permission_id]` on the table `tbl_admin_group_permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[admin_id,permission_id]` on the table `tbl_admin_permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tbl_admin_group_permissions_admin_group_id_permission_id_key" ON "tbl_admin_group_permissions"("admin_group_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_admin_permissions_admin_id_permission_id_key" ON "tbl_admin_permissions"("admin_id", "permission_id");
