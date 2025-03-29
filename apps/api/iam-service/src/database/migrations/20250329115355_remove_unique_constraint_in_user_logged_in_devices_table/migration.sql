-- DropIndex
DROP INDEX "tbl_user_logged_in_devices_user_account_id_user_agent_publi_key";

-- CreateIndex
CREATE INDEX "tbl_user_logged_in_devices_user_account_id_user_agent_publi_idx" ON "tbl_user_logged_in_devices"("user_account_id", "user_agent", "public_ip", "platform");
