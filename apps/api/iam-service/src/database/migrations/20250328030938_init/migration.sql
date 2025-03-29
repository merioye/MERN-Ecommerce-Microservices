-- CreateTable
CREATE TABLE "tbl_user_accounts" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_url" TEXT,
    "user_type" TEXT NOT NULL,
    "user_reference_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_admin_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "tbl_admin_groups_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "tbl_user_logged_in_devices" (
    "id" SERIAL NOT NULL,
    "user_agent" TEXT NOT NULL,
    "public_ip" INET NOT NULL,
    "platform" TEXT NOT NULL,
    "user_account_id" INTEGER NOT NULL,
    "logged_out_at" TIMESTAMP(3),
    "last_logged_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_logged_in_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_login_attempts" (
    "id" SERIAL NOT NULL,
    "user_account_id" INTEGER NOT NULL,
    "ip_address" INET NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tbl_login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_account_id" INTEGER NOT NULL,
    "user_logged_in_device_id" INTEGER NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_accounts_email_key" ON "tbl_user_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_accounts_user_type_user_reference_id_key" ON "tbl_user_accounts"("user_type", "user_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_admin_groups_name_key" ON "tbl_admin_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_admin_groups_slug_key" ON "tbl_admin_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_admins_email_key" ON "tbl_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permission_groups_name_key" ON "tbl_permission_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permission_groups_slug_key" ON "tbl_permission_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permissions_name_key" ON "tbl_permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_permissions_slug_key" ON "tbl_permissions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_logged_in_devices_user_account_id_user_agent_publi_key" ON "tbl_user_logged_in_devices"("user_account_id", "user_agent", "public_ip", "platform");

-- CreateIndex
CREATE INDEX "tbl_login_attempts_user_account_id_idx" ON "tbl_login_attempts"("user_account_id");

-- CreateIndex
CREATE INDEX "tbl_refresh_tokens_user_account_id_idx" ON "tbl_refresh_tokens"("user_account_id");

-- CreateIndex
CREATE INDEX "tbl_refresh_tokens_user_logged_in_device_id_idx" ON "tbl_refresh_tokens"("user_logged_in_device_id");

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

-- AddForeignKey
ALTER TABLE "tbl_user_logged_in_devices" ADD CONSTRAINT "tbl_user_logged_in_devices_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_login_attempts" ADD CONSTRAINT "tbl_login_attempts_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_refresh_tokens" ADD CONSTRAINT "tbl_refresh_tokens_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_refresh_tokens" ADD CONSTRAINT "tbl_refresh_tokens_user_logged_in_device_id_fkey" FOREIGN KEY ("user_logged_in_device_id") REFERENCES "tbl_user_logged_in_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
