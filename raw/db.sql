-- Add chatbot feature (add support ticket feature here)
-- AI features (image background color remove, translations, product description generation)


############################################# GENERAL MANAGEMENT ##########################################

-- Serves as a unified table for admins, vendors and customers
-- An account is created for each admin/vendor/customer
DROP TABLE IF EXISTS "tbl_user_accounts";
CREATE TABLE "tbl_user_accounts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_type" VARCHAR(16) NOT NULL, -- admin, vendor, customer
  "user_reference_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("user_type", "user_reference_id")
);

DROP TABLE IF EXISTS "tbl_addresses";
CREATE TABLE "tbl_addresses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "country_id" BIGINT NOT NULL,
  "zone_id" BIGINT NOT NULL,
  "state" VARCHAR(255) NOT NULL,
  "city" VARCHAR(128) NOT NULL,
  "postal_code" VARCHAR(16) NOT NULL,
  "address_1" VARCHAR(255) NOT NULL,
  "address_2" VARCHAR(255) NOT NULL DEFAULT '',
  "address_type" VARCHAR(128) NOT NULL, -- shipping, billing
  "is_default_address" BOOLEAN NOT NULL DEFAULT 'false',
  "landmark" VARCHAR(128) NOT NULL DEFAULT '',
  "phone_number" VARCHAR(16) NOT NULL DEFAULT '',
  "email_id" VARCHAR(128) NOT NULL DEFAULT '',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_addresses_country_id" FOREIGN KEY ("country_id") REFERENCES "tbl_countries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_addresses_zone_id" FOREIGN KEY ("zone_id") REFERENCES "tbl_zones" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_addresses_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_addresses_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_addresses_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_addresses_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_activities";
CREATE TABLE "tbl_activities" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "activity_name" VARCHAR(64) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_activities_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_activities_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);


DROP TABLE IF EXISTS "tbl_audit_logs";
CREATE TABLE "tbl_audit_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "user_name" VARCHAR(32) NOT NULL,
  "module" VARCHAR(255) NOT NULL,
  "request_url" VARCHAR(255) NOT NULL,
  "method" VARCHAR(16) NOT NULL,
  "log_type" VARCHAR(32) NOT NULL, -- request, response
  "description" TEXT NOT NULL,
  "params" TEXT NOT NULL, -- json string
  "browser_info" TEXT NOT NULL, -- json string
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_audit_logs_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_audit_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_audit_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_audit_logs_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_banner_groups";
CREATE TABLE "tbl_banner_groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_banner_groups_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banner_groups_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_banner_group_translations";
CREATE TABLE "tbl_banner_group_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "language_id" BIGINT NOT NULL,
  "banner_group_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_banner_group_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banner_group_translations_banner_group_id" FOREIGN KEY ("banner_group_id") REFERENCES "tbl_banner_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banner_group_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banner_group_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_banners";
CREATE TABLE "tbl_banners" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "banner_group_id" BIGINT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "sort_order" INT NOT NULL,
  "url" TEXT,
  "container_name" VARCHAR(255) NOT NULL DEFAULT '',
  "view_page_count" INT NOT NULL DEFAULT '0',
  "link" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "image_id" TEXT NOT NULL,
  "content" TEXT NOT NULL, -- json string
  "position" INT NOT NULL,
  "link_type" VARCHAR(64) NOT NULL, -- category, product
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_banners_banner_group_id" FOREIGN KEY ("banner_group_id") REFERENCES "tbl_banner_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banners_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banners_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_banner_translations";
CREATE TABLE "tbl_banner_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "container_name" VARCHAR(255) NOT NULL DEFAULT '',
  "content" TEXT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "banner_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_banner_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banner_translations_banner_id" FOREIGN KEY ("banner_id") REFERENCES "tbl_banners" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banner_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_banner_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_blog_categories";
CREATE TABLE "tbl_blog_categories" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(128) NOT NULL UNIQUE,
  "slug" VARCHAR(128) NOT NULL UNIQUE,
  "description" VARCHAR(512) NOT NULL,
  "image_url" TEXT, 
  "image_id" TEXT,
  "parent_id" BIGINT,
  "sort_order" INT NOT NULL,
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" TEXT,
  "meta_tag_keyword" VARCHAR(255),
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_blog_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "tbl_blog_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_blog_category_translations";
CREATE TABLE "tbl_blog_category_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" VARCHAR(512) NOT NULL,
  "language_id" BIGINT NOT NULL,
  "blog_category_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_blog_category_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_category_translations_blog_category_id" FOREIGN KEY ("blog_category_id") REFERENCES "tbl_blog_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_category_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_category_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_blogs";
CREATE TABLE "tbl_blogs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "category_id" BIGINT NOT NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT NOT NULL, -- json
  "image_url" TEXT NOT NULL,
  "image_id" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" TEXT,
  "meta_tag_keyword" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_blogs_category_id" FOREIGN KEY ("category_id") REFERENCES "tbl_blog_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blogs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blogs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_blog_translations";
CREATE TABLE "tbl_blog_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "blog_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_blog_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_translations_blog_id" FOREIGN KEY ("blog_id") REFERENCES "tbl_blogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_blog_to_blog_relationships";
CREATE TABLE "tbl_blog_to_blog_relationships" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "blog_id" BIGINT NOT NULL,
  "related_blog_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_blog_to_blog_relationships_blog_id" FOREIGN KEY ("blog_id") REFERENCES "tbl_blogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_to_blog_relationships_related_blog_id" FOREIGN KEY ("related_blog_id") REFERENCES "tbl_blogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_to_blog_relationships_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_blog_to_blog_relationships_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_contacts";
CREATE TABLE "tbl_contacts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(64) NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "phone_number" VARCHAR(16) NOT NULL,
  "message" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_contacts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_contacts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_countries";
CREATE TABLE "tbl_countries" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(128) NOT NULL UNIQUE,
  "iso_code_1" VARCHAR(2) NOT NULL,
  "iso_code_2" VARCHAR(3) NOT NULL,
  "address_format" TEXT NOT NULL DEFAULT '',
  "postal_code_required" BOOLEAN NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_countries_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_countries_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_countries_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_currencies";
CREATE TABLE "tbl_currencies" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(32) NOT NULL UNIQUE,
  "code" VARCHAR(32) NOT NULL UNIQUE,
  "symbol_left" VARCHAR(32),
  "symbol_Right" VARCHAR(32),
  "decimal_place" DECIMAL(5,0),
  "value" FLOAT(15,2) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_currencies_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_currencies_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_currencies_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_email_templates";
CREATE TABLE "tbl_email_templates" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "shortname" VARCHAR(128) NOT NULL, -- name of the template
  "subject" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL, -- json
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "dynamic_fields_ref" VARCHAR(255) NOT NULL, -- '{adminname},{orderId},{name}'
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_email_templates_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_email_templates_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_email_template_translations";
CREATE TABLE "tbl_email_template_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "shortname" VARCHAR(128) NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "email_template_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_email_template_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_email_template_translations_email_template_id" FOREIGN KEY ("email_template_id") REFERENCES "tbl_email_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_email_template_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_email_template_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_export_logs";
CREATE TABLE "tbl_export_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "module" VARCHAR(255) NOT NULL,
  "record_available" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  CONSTRAINT "fk_tbl_export_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_geo_zones";
CREATE TABLE "tbl_geo_zones" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(32) NOT NULL,
  "description" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_geo_zones_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_geo_zones_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_jobs";
CREATE TABLE "tbl_jobs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL, -- json
  "employment_type" VARCHAR(32) NOT NULL, -- 'Part-Time', 'Full-Time'
  "experience_level" VARCHAR(32) NOT NULL, -- '1 year', '2+ years'
  "skills_required" TEXT NOT NULL, -- 'html,css'
  "working_schedule" VARCHAR(255) NOT NULL, -- '9AM-6PM', '4PM-1AM'
  "job_location" TEXT NOT NULL,
  "salary_type" VARCHAR(255) NOT NULL, -- 'hourly', 'monthly'
  "salary_range" VARCHAR(255) NOT NULL, -- '70-100'
  "salary_currency_id" BIGINT NOT NULL,
  "contact_person_name" VARCHAR(64) NOT NULL,
  "contact_person_email" VARCHAR(128) NOT NULL,
  "contact_person_phone_number" varchar(16) NOT NULL,
  "last_date_to_apply" DATE NOT NULL,
  "benefits" TEXT NOT NULL, -- 'Fuel Allowance, Health Insurance'
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_jobs_salary_currency_id" FOREIGN KEY ("salary_currency_id") REFERENCES "tbl_currencies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_jobs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_jobs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_job_translations";
CREATE TABLE "tbl_job_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "skills_required" TEXT NOT NULL,
  "salary_type" VARCHAR(255) NOT NULL,
  "benefits" TEXT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "job_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_job_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_job_translations_job_id" FOREIGN KEY ("job_id") REFERENCES "tbl_jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_job_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_job_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_languages";
CREATE TABLE "tbl_languages" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(32) NOT NULL UNIQUE,
  "code" VARCHAR(5) NOT NULL UNIQUE,
  "image_url" TEXT NOT NULL,
  "image_id" TEXT NOT NULL,
  "locale" VARCHAR(255) NOT NULL,
  "sort_order" INT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_languages_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_languages_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_login_attempts";
CREATE TABLE "tbl_login_attempts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "ip_address" INET NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_login_attempts_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_login_attempts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_login_attempts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_login_attempts_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_login_logs";
CREATE TABLE "tbl_login_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "email_id" VARCHAR(128) NOT NULL,
  "first_name" VARCHAR(32) NOT NULL,
  "ip_address" INET NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_login_logs_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_login_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_login_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_login_logs_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_m_seo_meta";
CREATE TABLE "m_seo_meta" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "meta_tag_title" VARCHAR(255) NOT NULL,
  "meta_tag_description" TEXT NOT NULL,
  "meta_tag_keyword" VARCHAR(255) NOT NULL,
  "seo_type" VARCHAR(255) NOT NULL,
  "ref_id" BIGINT NOT NULL, -- pageId, productId etc
  "ref_type" VARCHAR(255), -- page, product etc
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_m_seo_meta_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_m_seo_meta_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_page_groups";
CREATE TABLE "tbl_page_groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_page_groups_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_page_groups_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_page_group_translations";
CREATE TABLE "tbl_page_group_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "page_group_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_page_group_translations_page_group_id" FOREIGN KEY ("page_group_id") REFERENCES "tbl_page_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_page_group_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_page_group_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_page_group_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_pages";
CREATE TABLE "tbl_pages" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL UNIQUE,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "intro" TEXT NOT NULL, -- json
  "full_text" TEXT NOT NULL, --json
  "page_group_id" BIGINT NOT NULL,
  "sort_order" INT NOT NULL,
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" VARCHAR(255),
  "meta_tag_keywords" VARCHAR(255),
  "view_page_count" INT,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_pages_page_group_id" FOREIGN KEY ("page_group_id") REFERENCES "tbl_page_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_pages_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_pages_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_page_translations";
CREATE TABLE "tbl_page_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "intro" TEXT NOT NULL,
  "full_text" TEXT NOT NULL,
  "page_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_page_translations_page_id" FOREIGN KEY ("page_id") REFERENCES "tbl_pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_page_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_page_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_page_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_settings";
CREATE TABLE "tbl_settings" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "site_url" VARCHAR(255),
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" TEXT,
  "meta_tag_keywords" VARCHAR(255),
  "store_name" VARCHAR(255),
  "store_owner" VARCHAR(255),
  "store_address" TEXT,
  "country_id" BIGINT,
  "zone_id" BIGINT,
  "store_email" VARCHAR(128),
  "store_phone_number" VARCHAR(16),
  "site_category" TEXT,
  "store_description" TEXT,
  "store_logo_url" TEXT,
  "store_logo_id" TEXT,
  "maintenance_mode" BOOLEAN NOT NULL DEFAULT 'false',
  "store_language_id" BIGINT,
  "store_currency_id" BIGINT,
  "store_image_url" TEXT,
  "store_image_id" TEXT,
  "google" TEXT,
  "facebook" TEXT,
  "twitter" TEXT,
  "instagram" TEXT,
  "default_order_status_id" BIGINT NOT NULL DEFAULT '1',
  "invoice_prefix" VARCHAR(255),
  "items_per_page" INT,
  "category_product_count" INT,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "email_logo_url" TEXT,
  "email_logo_id" TEXT,
  "invoice_logo_url" TEXT,
  "invoice_logo_id" TEXT,
  "is_guest_allowed" BOOLEAN COMMENT 'IS GUEST OPERATION ALLOWED IN APPLICATION FLAG',
  "currency_format" VARCHAR(25),
  "date_format" VARCHAR(25),
  "time_format" VARCHAR(25),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_settings_country_id" FOREIGN KEY ("country_id") REFERENCES "tbl_countries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settings_zone_id" FOREIGN KEY ("zone_id") REFERENCES "tbl_zones" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settings_store_language_id" FOREIGN KEY ("store_language_id") REFERENCES "tbl_languages" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settings_store_currency_id" FOREIGN KEY ("store_currency_id") REFERENCES "tbl_currencies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settings_default_order_status_id" FOREIGN KEY ("default_order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settings_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settings_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);


DROP TABLE IF EXISTS "tbl_site_maps";
CREATE TABLE "tbl_site_maps" ( -- come here again
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "user_name" VARCHAR(225) NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_site_maps_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_site_maps_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_site_maps_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_taxes";
CREATE TABLE "tbl_taxes" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "tax_name" VARCHAR(255) NOT NULL, -- income, vat, gst
  "tax_percentage" INT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_taxes_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_taxes_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_taxes_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_tax_translations";
CREATE TABLE "tbl_tax_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "tax_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "tax_name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_tax_translations_tax_id" FOREIGN KEY ("tax_id") REFERENCES "tbl_taxes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_tax_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_tax_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_tax_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);


DROP TABLE IF EXISTS "tbl_widgets";
CREATE TABLE "tbl_widgets" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "widget_link_type" INT NOT NULL COMMENT '1-> category 2 -> product',
  "description" TEXT NOT NULL, -- json string
  "position" INT NOT NULL,
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" TEXT,
  "meta_tag_keyword" VARCHAR(255),
  "slug" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'false',
  "show_home_page_widget" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_widgets_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_widgets_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);


DROP TABLE IF EXISTS "tbl_widget_translations";
CREATE TABLE "tbl_widget_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "widget_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_widget_translations_widget_id" FOREIGN KEY ("widget_id") REFERENCES "tbl_widgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_widget_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_widget_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_widget_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_widget_items";
CREATE TABLE "tbl_widget_items" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "widget_id" BIGINT NOT NULL,
  "ref_id" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_widget_items_widget_id" FOREIGN KEY ("widget_id") REFERENCES "tbl_widgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_widget_items_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_widget_items_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_zones";
CREATE TABLE "tbl_zones" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "country_id" BIGINT NOT NULL,
  "code" VARCHAR(32) NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_zones_country_id" FOREIGN KEY ("country_id") REFERENCES "tbl_countries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_zones_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_zones_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_zones_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_zones_to_geo_zones";
CREATE TABLE "tbl_zones_to_geo_zones" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "country_id" BIGINT NOT NULL,
  "zone_id" BIGINT NOT NULL,
  "geo_zone_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_zone_to_geo_zones_country_id" FOREIGN KEY ("country_id") REFERENCES "tbl_countries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_zone_to_geo_zones_zone_id" FOREIGN KEY ("zone_id") REFERENCES "tbl_zones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_zone_to_geo_zones_geo_zone_id" FOREIGN KEY ("geo_zone_id") REFERENCES "tbl_geo_zones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_zones_to_geo_zones_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_zones_to_geo_zones_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_refresh_tokens";
CREATE TABLE "tbl_refresh_tokens" (
  "id" BIGSERIAL PRIMARY KEY,
  "expires_at" TIMESTAMP NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "fk_tbl_refresh_tokens_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_user_logged_in_devices";
CREATE TABLE "tbl_user_logged_in_devices" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_agent" TEXT NOT NULL,
  "public_ip" INET NOT NULL,
  "platform" TEXT NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "logged_out_at" TIMESTAMP,
  "last_logged_in_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("user_id", "user_agent", "public_ip", "platform"),
  CONSTRAINT "fk_tbl_user_logged_in_devices_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_otps";
CREATE TABLE "tbl_otps" (
  "id" BIGSERIAL PRIMARY KEY,
  "otp" CHAR(6) NOT NULL,
  "otp_type" VARCHAR(128) NOT NULL, -- reset_password, account_verification, phone_verification, 2fa
  "expires_at" TIMESTAMP NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  CONSTRAINT "fk_tbl_otps_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_documents";
CREATE TABLE "tbl_documents" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "document_type" VARCHAR(16) NOT NULL, -- pdf, csv, xlsx
  "is_mandatory" BOOLEAN NOT NULL,
  "max_upload_size" INT NOT NULL, -- in MB
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "deleted_at" TIMESTAMP,
  CONSTRAINT "fk_tbl_documents_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_documents_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_documents_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_document_translations";
CREATE TABLE "tbl_document_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "document_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  CONSTRAINT "fk_tbl_document_translations_document_id" FOREIGN KEY ("document_id") REFERENCES "tbl_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_document_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_document_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_document_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_industries";
CREATE TABLE "tbl_industries" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "deleted_at" TIMESTAMP,
  CONSTRAINT "fk_tbl_industries_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_industries_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_industries_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_industry_translations";
CREATE TABLE "tbl_industry_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "industry_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  CONSTRAINT "fk_tbl_industry_translations_industry_id" FOREIGN KEY ("industry_id") REFERENCES "tbl_industries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_industry_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_industry_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_industry_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

############################################# ADMIN MANAGEMENT ##########################################

-- Table which contains the admin user. 
-- as well as
-- Table for users created by admin that have specific set of permissions
-- to manage the admin dashboard on his behalf.
DROP TABLE IF EXISTS "tbl_users";
CREATE TABLE "tbl_users" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_group_id" BIGINT NOT NULL,
  "first_name" VARCHAR(32) NOT NULL,
  "last_name" VARCHAR(32) NOT NULL,
  "email" VARCHAR(128) UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "profile_url" TEXT,
  "profile_id" TEXT,
  "phone_number" VARCHAR(16) NOT NULL DEFAULT '',
  "address" VARCHAR(255) NOT NULL DEFAULT '',
  "2fa_enabled" BOOLEAN NOT NULL DEFAULT 'false',
  "is_admin" BOOLEAN NOT NULL DEFAULT 'false',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_users_user_group_id" FOREIGN KEY ("user_group_id") REFERENCES "tbl_user_groups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_users_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_users_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_users_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_admin_payment_accounts";
CREATE TABLE "tbl_admin_payment_accounts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "account_type" VARCHAR(64) NOT NULL, -- 'stripe', 'paypal'
  "account_id" VARCHAR(255) NOT NULL, -- stripeId, paypalId
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_admin_payment_accounts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_admin_payment_accounts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_admin_payment_accounts_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_module_permission_groups";
CREATE TABLE "tbl_module_permission_groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(128) NOT NULL UNIQUE,
  "slug" VARCHAR(128) NOT NULL UNIQUE,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "sort_order" INT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_module_permission_groups_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permission_groups_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_module_permission_group_translations";
CREATE TABLE "tbl_module_permission_group_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "module_permission_group_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  CONSTRAINT "fk_tbl_module_permission_group_translations_module_permission_group_id" FOREIGN KEY ("module_permission_group_id") REFERENCES "tbl_module_permission_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permission_group_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permission_group_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permission_group_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_module_permissions";
CREATE TABLE "tbl_module_permissions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "module_permission_group_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL UNIQUE,
  "slug" VARCHAR(128) NOT NULL UNIQUE,
  "sort_order" INT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_module_permissions_module_permission_group_id" FOREIGN KEY ("module_permission_group_id") REFERENCES "tbl_module_permission_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permissions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permissions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_module_permission_translations";
CREATE TABLE "tbl_module_permission_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "module_permission_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  CONSTRAINT "fk_tbl_module_permission_translations_module_permission_id" FOREIGN KEY ("module_permission_id") REFERENCES "tbl_module_permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permission_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permission_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_module_permission_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_user_groups";
CREATE TABLE "tbl_user_groups" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" VARCHAR(64) UNIQUE NOT NULL,
  "slug" VARCHAR(64) UNIQUE NOT NULL,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_user_groups_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_groups_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_groups_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_user_group_translations";
CREATE TABLE "tbl_user_group_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_group_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(64) NOT NULL,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  CONSTRAINT "fk_tbl_user_group_translations_user_group_id" FOREIGN KEY ("user_group_id") REFERENCES "tbl_user_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_group_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_group_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_group_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_user_group_module_permissions";
CREATE TABLE "tbl_user_group_module_permissions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_group_id" BIGINT NOT NULL,
  "module_permission_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_user_group_module_permissions_user_group_id" FOREIGN KEY ("user_group_id") REFERENCES "tbl_user_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_group_module_permissions_module_permission_id" FOREIGN KEY ("module_permission_id") REFERENCES "tbl_module_permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_group_module_permissions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_group_module_permissions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_user_module_permissions";
CREATE TABLE "tbl_user_module_permissions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "user_id" BIGINT NOT NULL,
  "module_permission_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_user_module_permissions_user_id" FOREIGN KEY ("user_id") REFERENCES "tbl_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_module_permissions_module_permission_id" FOREIGN KEY ("module_permission_id") REFERENCES "tbl_module_permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_module_permissions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_user_module_permissions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);


############################################# CUSTOMER MANAGEMENT ##########################################


DROP TABLE IF EXISTS "tbl_customer_groups";
CREATE TABLE "tbl_customer_groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(64) NOT NULL UNIQUE,
  "slug" VARCHAR(64) NOT NULL UNIQUE,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "color_code" VARCHAR(255) NOT NULL DEFAULT '',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_groups_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_groups_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_groups_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_customer_group_translations";
CREATE TABLE "tbl_customer_group_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_group_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(64) NOT NULL,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "created_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  "updated_at" TIMESTAMP DEFAULT NOT NULL NOW(),
  CONSTRAINT "fk_tbl_customer_group_translations_customer_group_id" FOREIGN KEY ("customer_group_id") REFERENCES "tbl_customer_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_group_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_group_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_group_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_customers";
CREATE TABLE "tbl_customers" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_group_id" BIGINT,
  "first_name" VARCHAR(32) NOT NULL,
  "last_name" VARCHAR(32) NOT NULL,
  "email" VARCHAR(128) UNIQUE NOT NULL,
  "password" TEXT,
  "phone_number" VARCHAR(16) NOT NULL DEFAULT '',
  "address" VARCHAR(255) NOT NULL DEFAULT '',
  "profile_url" TEXT,
  "profile_id" TEXT,
  "signup_method" VARCHAR(20) NOT NULL DEFAULT 'manual', -- manual, google, facebook
  "is_email_verified" BOOLEAN NOT NULL DEFAULT 'false',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "last_login" TIMESTAMP,
  "dob" DATE NOT NULL DEFAULT '',
  "gender" VARCHAR(32), -- men, women, kid
  "is_subscribed_to_newsletter" BOOLEAN NOT NULL DEFAULT 'false',
  "2fa_enabled" BOOLEAN NOT NULL DEFAULT 'false',
  "is_safe" BOOLEAN NOT NULL DEFAULT 'true',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "landmark" VARCHAR(128),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  "locked_on" TIMESTAMP,
  CONSTRAINT "fk_tbl_customers_customer_group_id" FOREIGN KEY ("customer_group_id") REFERENCES "tbl_customer_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customers_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customers_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customers_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_customers_to_groups";
CREATE TABLE "tbl_customers_to_groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "customer_group_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  CONSTRAINT "fk_tbl_customers_to_groups_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customers_to_groups_customer_group_id" FOREIGN KEY ("customer_group_id") REFERENCES "tbl_customer_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_customer_activities";
CREATE TABLE "tbl_customer_activities" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "activity_id" BIGINT NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "product_id" BIGINT,
  "description" VARCHAR(128) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_activities_activity_id" FOREIGN KEY ("activity_id") REFERENCES "tbl_activities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_activities_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_activities_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_activities_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_activities_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_customer_documents";
CREATE TABLE "tbl_customer_documents" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "document_url" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "document_status" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_documents_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_documents_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_documents_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_customer_ip_addresses";
CREATE TABLE "tbl_customer_ip_addresses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "ip_address" INET NOT NULL,
  "date_added" TIMESTAMP NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_ip_addresses_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_ip_addresses_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_ip_addresses_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);


############################################# VENDOR MANAGEMENT ##########################################


DROP TABLE IF EXISTS "tbl_vendor_groups";
CREATE TABLE "tbl_vendor_groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(64) NOT NULL UNIQUE,
  "slug" VARCHAR(64) NOT NULL UNIQUE,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "vendor_group_commission" DECIMAL(10,2) NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_groups_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_vendor_group_translations";
CREATE TABLE "tbl_vendor_group_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_group_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(64) NOT NULL,
  "description" VARCHAR(512) NOT NULL DEFAULT '',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_group_translations_vendor_group_id" FOREIGN KEY ("vendor_group_id") REFERENCES "tbl_vendor_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_group_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_group_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_group_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendors";
CREATE TABLE "tbl_vendors" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_prefix_id" VARCHAR(255) NOT NULL,
  "vendor_group_id" BIGINT NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "commission" INT,
  "shop_name" VARCHAR(255) NOT NULL UNIQUE,
  "shop_slug" VARCHAR(255) NOT NULL UNIQUE,
  "shop_description" TEXT NOT NULL DEFAULT '', -- json
  "business_segment" VARCHAR(255),
  "business_type" VARCHAR(255),
  "business_number" VARCHAR(32) COMMENT 'GST NUMBER',
  "location" varchar(255),
  "logo_url" TEXT,
  "logo_id" TEXT,
  "banner_url" TEXT,
  "banner_id" TEXT,
  "cheque_payee_name" VARCHAR(128),
  "bank_name" VARCHAR(255),
  "bank_account_number" VARCHAR(255),
  "bank_account_holder_name" VARCHAR(255),
  "bank_account" TEXT, --json
  "shipping_charges" NUMERIC NOT NULL DEFAULT 0,
  "payment_status" VARCHAR(128) NOT NULL DEFAULT 'deactivated', -- activated, deactivated
  "payment_type" VARCHAR(32), -- stripe, bank_transfer, paypal
  "payment_information" TEXT NOT NULL DEFAULT '', -- json
  "ifsc_code" varchar(255),
  "shop_email" VARCHAR(128),
  "shop_phone_number" VARCHAR(16),
  "contact_person_name" VARCHAR(128) NOT NULL,
  "address_1" VARCHAR(255),
  "address_2" VARCHAR(255),
  "country_id" BIGINT,
  "zone_id" BIGINT,
  "state" VARCHAR(255),
  "city" VARCHAR(128),
  "postal_code" VARCHAR(64),
  "avg_rating" NUMERIC(3, 1) DEFAULT NOT NULL 0,
  "total_products_count" BIGINT NOT NULL DEFAULT 0,
  "delivered_orders_count" BIGINT NOT NULL DEFAULT 0,
  "payout_method" VARCHAR(32), -- paypal, stripe, bank_transfer
  "stripe_account_id" VARCHAR(255),
  "paypal_email" VARCHAR(128),
  "instagram" VARCHAR(255),
  "facebook" VARCHAR(255),
  "youtube" VARCHAR(255),
  "twitter" VARCHAR(255),
  "whatsapp" VARCHAR(255),
  "verification" TEXT NOT NULL, --json
  "verification_comment" TEXT NOT NULL, --json
  "verification_detail_comment" TEXT NOT NULL, -- json
  "industry_id" BIGINT NOT NULL,
  "preferred_shipping_method" VARCHAR(55) COMMENT 'CUSTOMER SHIPMENT MODE',
  "capabilities" TEXT, -- json
  "personalized_settings" TEXT, -- json
  "kyc_status" VARCHAR(16) NOT NULL DEFAULT 'pending', -- 'verified','rejected','submitted','in-review','pending'
  "reviews_count" TEXT NOT NULL DEFAULT '{'overall': 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0}',
  "approval_flag" BOOLEAN NOT NULL DEFAULT 'false',
  "approved_by" BIGINT,
  "approved_date" DATE,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_email_verified" BOOLEAN NOT NULL DEFAULT 'false',
  "2fa_enabled" BOOLEAN NOT NULL DEFAULT 'false',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_vendors_vendor_group_id" FOREIGN KEY ("vendor_group_id") REFERENCES "tbl_vendor_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_country_id" FOREIGN KEY ("country_id") REFERENCES "tbl_countries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_zone_id" FOREIGN KEY ("zone_id") REFERENCES "tbl_zones" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_approved_by" FOREIGN KEY ("approved_by") REFERENCES "tbl_admins/users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_industry_id" FOREIGN KEY ("industry_id") REFERENCES "tbl_industries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendors_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_vendor_translations";
CREATE TABLE "tbl_vendor_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "shop_name" VARCHAR(255) NOT NULL,
  "shop_description" VARCHAR(255) NOT NULL,
  "business_segment" VARCHAR(255),
  "business_type" VARCHAR(255),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_translations_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tb;_vendor_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_groups_to_categories";
CREATE TABLE "tbl_vendor_categories" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_group_id" BIGINT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_vendor_group_id" FOREIGN KEY ("vendor_group_id") REFERENCES "tbl_vendor_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_category_id" FOREIGN KEY ("category_id") REFERENCES "tbl_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_contacts";
CREATE TABLE "tbl_vendor_contacts" ( 
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "name" VARCHAR(64) NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "phone_number" VARCHAR(16) NOT NULL,
  "country" VARCHAR(64) NOT NULL,
  "requirement" TEXT, -- come here
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_contacts_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_admins/users/vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_contacts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_contacts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_documents";
CREATE TABLE "tbl_vendor_documents" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "document_id" BIGINT NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "status" VARCHAR(64) NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "is_verified" BOOLEAN NOT NULL DEFAULT 'false',
  "additional_info" TEXT, -- json
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_documents_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_documents_document_id" FOREIGN KEY ("document_id") REFERENCES "tbl_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_documents_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_documents_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE, 
);

DROP TABLE IF EXISTS "tbl_vendor_document_logs";
CREATE TABLE "tbl_vendor_document_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "document_id" BIGINT NOT NULL,
  "status" VARCHAR(64) NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "created_date" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "fk_tbl_vendor_document_logs_document_id" FOREIGN KEY ("document_id") REFERENCES "tbl_vendor_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_vendor_global_settings";
CREATE TABLE "tbl_vendor_global_settings" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "default_commission" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_global_settings_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_global_settings_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_groups_to_categories";
CREATE TABLE "tbl_vendor_group_categories" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_group_id" BIGINT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_vendor_group_id" FOREIGN KEY ("vendor_group_id") REFERENCES "tbl_vendor_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_category_id" FOREIGN KEY ("category_id") REFERENCES "tbl_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_groups_to_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_invoices";
CREATE TABLE "tbl_vendor_invoices" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "invoice_no" VARCHAR(255) NOT NULL,
  "invoice_prefix" VARCHAR(255) NOT NULL,
  "total" INT NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "shipping_first_name" VARCHAR(32) NOT NULL,
  "shipping_last_name" VARCHAR(32) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_invoices_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_invoices_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_invoices_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_invoices_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_invoice_items";
CREATE TABLE "tbl_vendor_invoice_items" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_invoice_id" BIGINT NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_invoice_items_vendor_invoice_id" FOREIGN KEY ("vendor_invoice_id") REFERENCES "tbl_vendor_invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_invoice_items_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_invoice_items_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_invoice_items_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_order_archives";
CREATE TABLE "tbl_vendor_order_archives" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "sub_order_id" VARCHAR(255) NOT NULL,
  "sub_order_status_id" BIGINT NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "commission" INT NOT NULL DEFAULT '0',
  "order_product_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_order_archives_sub_order_status_id" FOREIGN KEY ("sub_order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archives_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archives_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archives_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archives_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archives_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_order_archive_logs";
CREATE TABLE "tbl_vendor_order_archive_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_order_archive_id" BIGINT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "sub_order_id" VARCHAR(255) NOT NULL,
  "sub_order_status_id" BIGINT NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "commission" INT NOT NULL DEFAULT '0',
  "order_product_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_order_archive_logs_sub_order_status_id" FOREIGN KEY ("sub_order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archive_logs_vendor_order_archive_id" FOREIGN KEY ("vendor_order_archive_id") REFERENCES "tbl_vendor_order_archives" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archive_logs_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archive_logs_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archive_logs_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archive_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_archive_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_order_products";
CREATE TABLE "tbl_vendor_order_products" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_order_id" BIGINT NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_order_products_vendor_order_id" FOREIGN KEY ("vendor_order_id") REFERENCES "tbl_vendor_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_products_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_products_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_order_statuses";
CREATE TABLE "tbl_vendor_order_statuses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_status_name" VARCHAR(255) NOT NULL,
  "color_code" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_order_statuses_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_statuses_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_order_status_translations";
CREATE TABLE "tbl_vendor_order_status_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_order_status_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "order_status_name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_order_status_translations_vendor_order_status_id" FOREIGN KEY ("vendor_order_status_id") REFERENCES "tbl_vendor_order_statuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_status_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_status_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_status_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_orders";
CREATE TABLE "tbl_vendor_orders" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "sub_order_id" VARCHAR(255) NOT NULL, -- INV-2024061012791
  "sub_order_status_id" BIGINT NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "commission" INT NOT NULL DEFAULT '0',
  "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  "make_settlement" BOOLEAN NOT NULL DEFAULT 'false',
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  "refunded_status" VARCHAR(64) NOT NULL DEFAULT 'none', -- 'none', 'partial', 'full'
  "payout_status" VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
  "payout_date" TIMESTAMP,
  "vendor_notified" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_orders_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_orders_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_orders_sub_order_status_id" FOREIGN KEY ("sub_order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_orders_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_orders_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_order_logs";
CREATE TABLE "tbl_vendor_order_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_order_id" BIGINT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "sub_order_id" VARCHAR(255) NOT NULL,
  "sub_order_status_id" BIGINT NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_order_logs_sub_order_status_id" FOREIGN KEY ("sub_order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_logs_vendor_order_id" FOREIGN KEY ("vendor_order_id") REFERENCES "tbl_vendor_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_logs_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_logs_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_payments";
CREATE TABLE "tbl_vendor_payments" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "vendor_order_id" BIGINT NOT NULL,
  "payment_item_id" BIGINT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "commission_amount" DECIMAL(10,2) NOT NULL,
  "status" VARCHAR(64) NOT NULL DEFAULT 'pending',
  "refund_deduction" DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  "vendor_payout_id" BIGINT,
  "payout_date" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_payments_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payments_vendor_order_id" FOREIGN KEY ("vendor_order_id") REFERENCES "tbl_vendor_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payments_payment_item_id" FOREIGN KEY ("payment_item_id") REFERENCES "tbl_payment_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payments_vendor_payout_id" FOREIGN KEY ("vendor_payout_id") REFERENCES "tbl_vendor_payouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payments_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payments_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

);

DROP TABLE IF EXISTS "tbl_vendor_payment_archives";
CREATE TABLE "tbl_vendor_payment_archives" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "vendor_order_id" BIGINT NOT NULL,
  "payment_item_id" BIGINT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "commission_amount" DECIMAL(10,2) NOT NULL,
  "vendor_order_archive" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_payment_archives_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payment_archives_vendor_order_id" FOREIGN KEY ("vendor_order_id") REFERENCES "tbl_vendor_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payment_archives_payment_item_id" FOREIGN KEY ("payment_item_id") REFERENCES "tbl_payment_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payment_archives_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payment_archives_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_products";
CREATE TABLE "tbl_vendor_products" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "approval_flag" BOOLEAN NOT NULL DEFAULT 'false',
  "approved_by" BIGINT,
  "approved_date" DATE,
  "vendor_product_commission" INT NOT NULL DEFAULT '0',
  "postal_code_based_delivery" BOOLEAN NOT NULL DEFAULT 'true',
  "quotation_available" BOOLEAN NOT NULL DEFAULT 'false',
  "sku_id" BIGINT NOT NULL,
  "reuse" BOOLEAN,
  "reuse_status" BOOLEAN NOT NULL DEFAULT 'false',
  "common_product_date" TIMESTAMP,
  "reject_reason" TEXT, -- json
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_products_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_products_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_products_approved_by" FOREIGN KEY ("approved_by") REFERENCES "tbl_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_products_sku_id" FOREIGN KEY ("sku_id") REFERENCES "tbl_skus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_products_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_product_additional_files";
CREATE TABLE "tbl_vendor_product_additional_files" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_product_additional_files_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_product_additional_files_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_product_additional_files_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_media";
CREATE TABLE "tbl_vendor_media" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "file_url" TEXT,
  "file_id" TEXT,
  "embedded_url" TEXT,
  "media_type" INT NOT NULL COMMENT '1 - IMAGE 2 - VIDEO',
  "is_default_image" BOOLEAN NOT NULL DEFAULT 'false',
  "video_type" INT NOT NULL DEFAULT '0' COMMENT '1 - UPLOAD 2 - EMBEDDED URL',
  "sort_order" INT NOT NULL DEFAULT '0',
  "show_home_page" BOOLEAN NOT NULL DEFAULT 'false',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_media_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_media_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_media_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

############################################# CATALOG MANAGEMENT #######################################

DROP TABLE IF EXISTS "tbl_answer_abuse_reasons";
CREATE TABLE "tbl_answer_abuse_reasons" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_answer_abuse_reasons_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_abuse_reasons_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_answer_abuse_reason_translations";
CREATE TABLE "tbl_answer_abuse_reason_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "answer_abuse_reason_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_answer_abuse_reason_translations_answer_abuse_reason_id" FOREIGN KEY ("answer_abuse_reason_id") REFERENCES "tbl_answer_abuse_reasons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_abuse_reason_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_abuse_reason_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_abuse_reason_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_answer_report_abuses";
CREATE TABLE "tbl_answer_report_abuses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "question_id" BIGINT NOT NULL,
  "answer_id" BIGINT NOT NULL,
  "abuse_reason_id" BIGINT NOT NULL,
  "remark" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_answer_report_abuses_answer_id" FOREIGN KEY ("answer_id") REFERENCES "tbl_product_answers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuses_question_id" FOREIGN KEY ("question_id") REFERENCES "tbl_product_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuses_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuses_abuse_reason_id" FOREIGN KEY ("abuse_reason_id") REFERENCES "tbl_answer_abuse_reasons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuses_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuses_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_answer_report_abuse_translations";
CREATE TABLE "tbl_answer_report_abuse_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "answer_report_abuse_id" BIGINT NOT NULL,
  "remark" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_answer_report_abuse_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuse_translations_answer_report_abuse_id" FOREIGN KEY ("answer_report_abuse_id") REFERENCES "tbl_answer_report_abuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuse_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_answer_report_abuse_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_attribute_groups";
CREATE TABLE "tbl_attribute_groups" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "sort_order" INT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_attribute_groups_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attribute_groups_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_attribute_group_translations";
CREATE TABLE "tbl_attribute_group_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "attribute_group_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_attribute_group_translations_attribute_group_id" FOREIGN KEY ("attribute_group_id") REFERENCES "tbl_attribute_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attribute_group_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attribute_group_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attribute_group_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_attributes";
CREATE TABLE "tbl_attributes" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "attribute_group_id" BIGINT NOT NULL
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "sort_order" INT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_attributes_attribute_group_id" FOREIGN KEY ("attribute_group_id") REFERENCES "tbl_attributes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attributes_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attributes_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_attribute_translations";
CREATE TABLE "tbl_attribute_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "attribute_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_attribute_translations_attribute_id" FOREIGN KEY ("attribute_id") REFERENCES "tbl_attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attribute_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attribute_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_attribute_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_attributes";
CREATE TABLE "tbl_product_attributes" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "attribute_id" BIGINT NOT NULL,
  "text" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_attributes_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_attributes_attribute_id" FOREIGN KEY ("attribute_id") REFERENCES "tbl_attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_attributes_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_attributes_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_attribute_translations";
CREATE TABLE "tbl_product_attribute_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "product_attribute_id" BIGINT NOT NULL,
  "text" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_attribute_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_attribute_translations_product_attribute_id" FOREIGN KEY ("product_attribute_id") REFERENCES "tbl_product_attributes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_attribute_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_attribute_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_brands";
CREATE TABLE "tbl_brands" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" VARCHAR(128) UNIQUE NOT NULL,
  "slug" VARCHAR(128) UNIQUE NOT NULL,
  "description" VARCHAR(512) NOT NULL,
  "image_url" TEXT,
  "image_id" TEXT,
  "sort_order" INT NOT NULL,
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" TEXT,
  "meta_tag_keyword" VARCHAR(255),
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "is_featured" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_brands_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_brands_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_brand_translations";
CREATE TABLE "tbl_brand_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "brand_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" VARCHAR(512) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_brand_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_brand_translations_brand_id" FOREIGN KEY ("brand_id") REFERENCES "tbl_brands" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_brand_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_brand_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_categories";
CREATE TABLE "tbl_categories" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "image_id" TEXT NOT NULL,
  "parent_id" BIGINT,
  "sort_order" INT NOT NULL,
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" TEXT,
  "meta_tag_keyword" VARCHAR(255),
  "is_active" BOOLEAN NOT NULL DEFAULT' true',
  "is_featured" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "tbl_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP Table IF EXISTS "tbl_category_translations";
CREATE TABLE "tbl_category_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "language_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_category_translations_category_id" FOREIGN KEY ("category_id") REFERENCES "tbl_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_category_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_category_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_category_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_category_commissions";
CREATE TABLE "tbl_category_commissions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "category_id" BIGINT NOT NULL,
  "category_commission_value" INT NOT NULL,
  CONSTRAINT "fk_tbl_category_commissions_category_id" FOREIGN KEY ("category_id") REFERENCES "tbl_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_price_update_file_logs";
CREATE TABLE "tbl_price_update_file_logs" (
  "id" BIGSERIAL NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_price_update_file_logs_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_price_update_file_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_price_update_file_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_products";
CREATE TABLE "tbl_products" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "sku" VARCHAR(64) NOT NULL UNIQUE,
  "upc" VARCHAR(12) NOT NULL DEFAULT '',
  "quantity" INT NOT NULL,
  "stock_status_id" BIGINT NOT NULL,
  "brand_id" BIGINT NOT NULL,
  "image_url" TEXT,
  "image_id" TEXT,
  "shipping" INT NOT NULL, -- come here again
  "price" DECIMAL(10,2) NOT NULL,
  "date_available_from" DATE NOT NULL,
  "sort_order" INT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "short_description" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL, -- json
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "meta_tag_title" VARCHAR(255),
  "meta_tag_description" VARCHAR(255),
  "meta_tag_keyword" VARCHAR(255),
  "discount" INT, -- come here
  "subtract_stock" INT NOT NULL COMMENT '0->no 1->yes',
  "minimum_quantity" INT NOT NULL,
  "location" VARCHAR(255) NOT NULL DEFAULT '',
  "wishlist_status" BOOLEAN NOT NULL DEFAULT 'false',
  "delete_flag" BOOLEAN NOT NULL DEFAULT 'false',
  "is_featured" BOOLEAN NOT NULL DEFAULT 'false',
  "rating" DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  "reviews_count" TEXT NOT NULL DEFAULT '{'overall': 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0}',
  "condition" INT NOT NULL COMMENT '1->new 2->used',
  "today_deals" BOOLEAN NOT NULL DEFAULT 'false',
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "keywords" TEXT NOT NULL DEFAULT '',
  "genders" TEXT NOT NULL DEFAULT '',
  "price_update_file_log_id" BIGINT,
  "service_charges" VARCHAR(255) NOT NULL,
  "tax_type" VARCHAR(64),
  "tax_value" INT, -- 0-100 (percentage)
  "order_product_prefix_id" INT,
  "height" DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  "weight" decimal(15,2) NOT NULL DEFAULT '0.00',
  "length" decimal(15,2) NOT NULL DEFAULT '0.00',
  "width" decimal(15,2) NOT NULL DEFAULT '0.00',
  "has_stock" BOOLEAN NOT NULL DEFAULT 'true',
  "has_tire_price" BOOLEAN NOT NULL DEFAULT 'false',
  "sold_out_units" INT NOT NULL DEFAULT '0',
  "out_of_stock_threshold" INT,
  "notify_min_quantity_below" BOOLEAN NOT NULL DEFAULT 'false',
  "min_quantity_allowed_cart" INT NOT NULL DEFAULT '1',
  "max_quantity_allowed_cart" INT,
  "enable_back_orders" BOOLEAN NOT NULL DEFAULT 'false',
  "postal_code_based_delivery" BOOLEAN NOT NULL DEFAULT 'false',
  "sku_id" BIGINT NOT NULL,
  "is_simplified" BOOLEAN NOT NULL DEFAULT 'true',
  "hsn" VARCHAR(255),
  "attribute_keyword" TEXT NOT NULL DEFAULT '',
  "quotation_available" BOOLEAN NOT NULL DEFAULT 'false',
  "owner" INT NOT NULL DEFAULT '0',
  "is_common" BOOLEAN NOT NULL DEFAULT 'false',
  "setted_as_common_on" TIMESTAMP,
  "is_on_flash_sale" BOOLEAN NOT NULL DEFAULT 'false',
  "flash_sale_start" TIMESTAMP,
  "flash_sale_end" TIMESTAMP,
  "flash_sale_price" DECIMAL(15,2),
  "price_type" INT NOT NULL DEFAULT '1', -- comer here
  "product_highlights" TEXT NOT NULL DEFAULT '[]',
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  CONSTRAINT "fk_tbl_products_stock_status_id" FOREIGN KEY ("stock_status_id") REFERENCES "tbl_stock_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_brand_id" FOREIGN KEY ("brand_id") REFERENCES "tbl_brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_price_update_file_log_id" FOREIGN KEY ("price_update_file_log_id") REFERENCES "tbl_price_update_file_logs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_sku_id" FOREIGN KEY ("sku_id") REFERENCES "tbl_skus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_product_translations";
CREATE TABLE "tbl_product_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "name" TEXT NOT NULL,
  "short_description" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "keywords" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_translations_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_answers";
CREATE TABLE "tbl_product_answers" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "question_id" BIGINT NOT NULL,
  "answer" TEXT NOT NULL,
  "type" INT DEFAULT NULL, -- come here again
  "user_account_id" BIGINT NOT NULL, -- the user who answered the question
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "likes" INT NOT NULL DEFAULT '0',
  "dislikes" INT NOT NULL DEFAULT '0',
  "default_answer" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_answers_question_id" FOREIGN KEY ("question_id") REFERENCES "tbl_product_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answers_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answers_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answers_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_answer_translations";
CREATE TABLE "tbl_product_answer_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "product_answer_id" BIGINT NOT NULL,
  "answer" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_answer_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answer_translations_product_answer_id" FOREIGN KEY ("product_answer_id") REFERENCES "tbl_product_answers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answer_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answer_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_answer_likes_dislikes";
CREATE TABLE "tbl_product_answer_likes_dislikes" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "question_id" BIGINT NOT NULL,
  "answer_id" BIGINT NOT NULL,
  "type" VARCHAR(32) NOT NULL, -- like, dislike
  "customer_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_answer_likes_dislikes_question_id" FOREIGN KEY ("question_id") REFERENCES "tbl_product_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answer_likes_dislikes_answer_id" FOREIGN KEY ("answer_id") REFERENCES "tbl_product_answers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answer_likes_dislikes_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answer_likes_dislikes_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_answer_likes_dislikes_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_discounts";
CREATE TABLE "tbl_product_discounts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "quantity" INT NOT NULL,
  "priority" INT NOT NULL,
  "price" DECIMAL(15,2) NOT NULL,
  "date_start" DATE NOT NULL,
  "date_end" DATE NOT NULL,
  "is_active" BOOLEAN NOT NULL,
  "sku_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_discounts_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_discounts_sku_id" FOREIGN KEY ("sku_id") REFERENCES "tbl_skus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_discounts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_discounts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_images";
CREATE TABLE "tbl_product_images" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "image_url" TEXT NOT NULL,
  "image_id" TEXT NOT NULL,
  "default_image" BOOLEAN NOT NULL,
  "sort_order" INT,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_images_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_images_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_images_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_price_logs";
CREATE TABLE "tbl_product_price_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "sku" VARCHAR(255) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "special_price" DECIMAL(10,2),
  "special_start_date" DATE,
  "special_end_date" DATE,
  "discount_price" DECIMAL(10,2),
  "discount_start_date" DATE,
  "discount_end_date" DATE,
  "price_update_file_log_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_price_logs_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_price_logs_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_price_logs_price_update_file_log_id" FOREIGN KEY ("price_update_file_log_id") REFERENCES "tbl_price_update_file_logs" ("id") ON DELETE CASCADE ON UPDATE CASCADE, 
  CONSTRAINT "fk_tbl_product_price_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_price_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_qr_codes";
CREATE TABLE "tbl_product_qr_codes" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "product_slug" VARCHAR(255) NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_qr_codes_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_qr_codes_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_qr_codes_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_questions";
CREATE TABLE "tbl_product_questions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGSERIAL NOT NULL,
  "question" TEXT NOT NULL,
  "type" INT NOT NULL, -- come here again
  "user_account_id" BIGINT NOT NULL, -- the user who asked the question
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_questions_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_questions_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_questions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_questions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_question_translations";
CREATE TABLE "tbl_product_question_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "product_question_id" BIGINT NOT NULL,
  "question" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_question_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_question_translations_product_question_id" FOREIGN KEY ("product_question_id") REFERENCES "tbl_product_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_question_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_question_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,

);

DROP TABLE IF EXISTS "tbl_product_ratings";
CREATE TABLE "tbl_product_ratings" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "first_name" VARCHAR(32) NOT NULL,
  "last_name" VARCHAR(32) NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "rating" DECIMAL(10,2 NOT NULL,
  "review" TEXT NOT NULL,
  "image_url" TEXT,
  "image_id" TEXT,
  "video_url" TEXT,
  "video_id" TEXT,
  "order_product_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_ratings_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_ratings_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_ratings_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_ratings_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_ratings_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_rating_translations";
CREATE TABLE "tbl_product_rating_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "product_rating_id" BIGINT NOT NULL,
  "review" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_rating_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_rating_translations_product_rating_id" FOREIGN KEY ("product_rating_id") REFERENCES "tbl_product_ratings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_rating_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_rating_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_related_products";
CREATE TABLE "tbl_related_products" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "related_product_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_related_products_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_related_products_related_product_id" FOREIGN KEY ("related_product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_related_products_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_related_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_specials";
CREATE TABLE "tbl_product_specials" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "customer_group_id" BIGINT,
  "priority" INT NOT NULL,
  "price" DECIMAL(15,2) NOT NULL,
  "date_start" DATE NOT NULL,
  "date_end" DATE NOT NULL,
  "sku_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_specials_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_specials_customer_group_id" FOREIGN KEY ("customer_group_id") REFERENCES "tbl_customer_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_specials_sku_id" FOREIGN KEY ("sku_id") REFERENCES "tbl_skus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_specials_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_specials_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_stock_alerts";
CREATE TABLE "tbl_product_stock_alerts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "mail_flag" BOOLEAN NOT NULL DEFAULT 'true',
  "sku_name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_stock_alerts_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_stock_alerts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_stock_alerts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_tags";
CREATE TABLE "tbl_product_tags" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "product_tag_name" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_tags_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tags_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tags_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_tag_translations";
CREATE TABLE "tbl_product_tag_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "product_tag_id" BIGINT NOT NULL,
  "product_tag_name" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_tag_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tag_translations_product_tag_id" FOREIGN KEY ("product_tag_id") REFERENCES "tbl_product_tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tag_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tag_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_tire_prices";
CREATE TABLE "tbl_product_tire_prices" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "quantity" INT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "sku_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_tire_prices_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tire_prices_sku_id" FOREIGN KEY ("sku_id") REFERENCES "tbl_skus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tire_prices_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_tire_prices_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_products_to_categories";
CREATE TABLE "tbl_products_to_categories" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_products_to_categories_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_to_categories_category_id" FOREIGN KEY ("category_id") REFERENCES "tbl_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_to_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_to_categories_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_products_to_variants";
CREATE TABLE "tbl_products_to_variants" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "variant_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_products_to_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_to_variants_variant_id" FOREIGN KEY ("variant_id") REFERENCES "tbl_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_to_variants_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_products_to_variants_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_variant_options";
CREATE TABLE "tbl_product_variant_options" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "variant_name" VARCHAR(255) NOT NULL,
  "product_id" BIGINT NOT NULL,
  "sku_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_variant_options_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_options_sku_id" FOREIGN KEY ("sku_id") REFERENCES "tbl_skus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_options_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_options_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_variant_option_translations";
CREATE TABLE "tbl_product_variant_option_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "product_variant_option_id" BIGINT NOT NULL,
  "variant_name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_variant_option_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_translations_product_variant_option_id" FOREIGN KEY ("product_variant_option_id") REFERENCES "tbl_product_variant_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_variant_option_details";
CREATE TABLE "tbl_product_variant_option_details" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_variant_option_id" BIGINT NOT NULL,
  "variant_value_id" BIGINT NOT NULL,
  "product_variant_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_variant_option_details_product_variant_option_id" FOREIGN KEY ("product_variant_option_id") REFERENCES "tbl_product_variant_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_details_variant_value_id" FOREIGN KEY ("variant_value_id") REFERENCES "tbl_variant_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_details_product_variant_id" FOREIGN KEY ("product_variant_id") REFERENCES "tbl_product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_details_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_details_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_variant_option_images";
CREATE TABLE "tbl_product_variant_option_images" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_variant_option_id" BIGINT NOT NULL,
  "image_url" TEXT NOT NULL,
  "image_id" TEXT NOT NULL,
  "default_image" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_variant_option_images_product_variant_option_id" FOREIGN KEY ("product_variant_option_id") REFERENCES "tbl_product_variant_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_images_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_variant_option_images_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_videos";
CREATE TABLE "tbl_product_videos" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "video_url" TEXT NOT NULL,
  "video_id" TEXT,
  "type" INT NOT NULL COMMENT '1 -> video 2 -> embedded',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_videos_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_videos_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_videos_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_product_view_logs";
CREATE TABLE "tbl_product_view_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "first_name" VARCHAR(32) NOT NULL,
  "last_name" VARCHAR(32) NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "phone_number" VARCHAR(16) NOT NULL,
  "address" VARCHAR(255),
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_product_view_logs_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_view_logs_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_view_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_product_view_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_skus";
CREATE TABLE "tbl_skus" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "sku_name" VARCHAR(255) NOT NULL UNIQUE,
  "price" DECIMAL(10,2) NOT NULL,
  "quantity" INT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "out_of_stock_threshold" INT,
  "notify_min_quantity_below" INT,
  "min_quantity_allowed_cart" INT NOT NULL DEFAULT '1',
  "max_quantity_allowed_cart" INT NOT NULL DEFAULT '5',
  "enable_back_orders" BOOLEAN NOT NULL 'false',
  "back_order_stock_limit" INT NOT NULL DEFAULT '0'
  "vendor_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_skus_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_skus_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_skus_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_stock_logs";
CREATE TABLE "tbl_stock_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "quantity" INT NOT NULL,
  "sku_name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_stock_logs_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stock_logs_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stock_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stock_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_stock_statuses";
CREATE TABLE "tbl_stock_statuses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(32) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_stock_statuses_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stock_statuses_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_stock_status_translations";
CREATE TABLE "tbl_stock_status_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "stock_status_id" BIGINT NOT NULL,
  "name" VARCHAR(64) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_stock_status_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stock_status_translations_stock_status_id" FOREIGN KEY ("stock_status_id") REFERENCES "tbl_stock_statuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stock_status_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stock_status_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_variants";
CREATE TABLE "tbl_variants" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "type" VARCHAR(32) NOT NULL, --dropdown, radio etc
  "name" VARCHAR(255) NOT NULL,
  "sort_order" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_variants_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variants_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_variant_translations";
CREATE TABLE "tbl_variant_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "variant_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_variant_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_translations_variant_id" FOREIGN KEY ("variant_id") REFERENCES "tbl_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_variant_values";
CREATE TABLE "tbl_variant_values" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "variant_id" BIGINT NOT NULL,
  "value_name" VARCHAR(255) NOT NULL,
  "sort_order" INT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_variant_values_variant_id" FOREIGN KEY ("variant_id") REFERENCES "tbl_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_values_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_values_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_variant_value_translations";
CREATE TABLE "tbl_variant_value_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "variant_value_id" BIGINT NOT NULL,
  "value_name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_variant_value_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_value_translations_variant_value_id" FOREIGN KEY ("variant_value_id") REFERENCES "tbl_variant_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_value_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_variant_value_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

############################################# ORDER MANAGEMENT ##########################################


DROP TABLE IF EXISTS "tbl_customer_carts";
CREATE TABLE "tbl_customer_carts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "quantity" INT NOT NULL,
  "product_price" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "tire_price" DECIMAL(10,2) NOT NULL,
  "sku_name" VARCHAR(255) NOT NULL,
  "variant_name" VARCHAR(255),
  "vendor_id" BIGINT NOT NULL,
  "ip_address" INET NOT NULL,
  "option_name" TEXT,
  "option_value_name" VARCHAR(32),
  "product_option_value_id" BIGINT,
  "product_variant_option_id" BIGINT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_carts_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_carts_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_carts_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_carts_product_option_value_id" FOREIGN KEY ("product_option_value_id") REFERENCES "tbl_product_option_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_carts_product_variant_option_id" FOREIGN KEY ("product_variant_option_id") REFERENCES "tbl_product_variant_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_carts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_carts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_customer_cart_translations";
CREATE TABLE "tbl_customer_cart_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "customer_cart_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "variant_name" VARCHAR(255),
  "option_name" TEXT,
  "option_value_name" VARCHAR(32),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_cart_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_cart_translations_customer_cart_id" FOREIGN KEY ("customer_cart_id") REFERENCES "tbl_customer_carts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_cart_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_cart_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_customer_wishlists";
CREATE TABLE "tbl_customer_wishlists" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "product_option_value_id" BIGINT DEFAULT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_wishlists_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_wishlists_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_wishlists_product_option_value_id" FOREIGN KEY ("product_option_value_id") REFERENCES "tbl_product_option_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_wishlists_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_wishlists_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_orders";
CREATE TABLE "tbl_orders" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "currency_id" BIGINT NOT NULL,
  "invoice_no" VARCHAR(64) NOT NULL,
  "invoice_prefix" VARCHAR(32) NOT NULL,
  "order_prefix_id" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(32) NOT NULL,
  "last_name" VARCHAR(32) NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "phone_number" VARCHAR(16) NOT NULL,
  "shipping_address_id" BIGINT NOT NULL,
  "payment_address_id" BIGINT NOT NULL,
  "shipping_address_format" TEXT,
  "payment_address_format" TEXT,
  "shipping_method" VARCHAR(128) NOT NULL, -- 'cargo' etc
  "comment" TEXT,
  "order_status_id" BIGINT NOT NULL,
  "commission" DECIMAL(10,0) NOT NULL,
  "currency_code" VARCHAR(3) NOT NULL,
  "currency_value" DECIMAL(11,0) NOT NULL,
  "ip_address" INET NOT NULL,
  "payment_flag" BOOLEAN NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "payment_type" VARCHAR(45) NOT NULL, -- 'paypal', 'stripe', 'cod'
  "payment_details" VARCHAR(255),
  "discounted_amount" DECIMAL(10,2),
  "subtotal" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "total_discount" DECIMAL(10,2) DEFAULT '0',
  "back_orders" BOOLEAN NOT NULL DEFAULT 'false',
  "customer_gst_no" VARCHAR(255),
  "order_delivered_at" TIMESTAMP,
  "refund_eligible_until" TIMESTAMP,
  "total_refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  "refund_status" VARCHAR(64) NOT NULL DEFAULT 'none', -- 'none', 'partial', 'full'
  "payout_status" VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
  "campaign_id" BIGINT,
  "voucher_id" BIGINT,
  "admin_notified" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_orders_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_currency_id" FOREIGN KEY ("currency_id") REFERENCES "tbl_currencies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_shipping_address_id" FOREIGN KEY ("shipping_address_id") REFERENCES "tbl_customer_addresses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_payment_address_id" FOREIGN KEY ("payment_address_id") REFERENCES "tbl_customer_addresses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_order_status_id" FOREIGN KEY ("order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_campaign_id" FOREIGN KEY ("campaign_id") REFERENCES "tbl_campaigns" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_voucher_id" FOREIGN KEY ("voucher_id") REFERENCES "tbl_vouchers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_cancel_reasons";
CREATE TABLE "tbl_order_cancel_reasons" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_cancel_reasons_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_cancel_reasons_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_history";
CREATE TABLE "tbl_order_history" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "order_status_id" BIGINT NOT NULL,
  "notify" TEXT NOT NULL,
  "comment" TEXT NOT NULL,
  "date_added" TIMESTAMP NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_history_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_history_order_status_id" FOREIGN KEY ("order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_history_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_history_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_logs";
CREATE TABLE "tbl_order_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "currency_id" BIGINT NOT NULL,
  "invoice_no" VARCHAR(45) NOT NULL,
  "invoice_prefix" VARCHAR(26) NOT NULL,
  "order_prefix_id" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(32) NOT NULL,
  "last_name" VARCHAR(32) NOT NULL,
  "email" VARCHAR(128) NOT NULL,
  "phone_number" VARCHAR(16) NOT NULL,
  "shipping_address_id" BIGINT NOT NULL,
  "payment_address_id" BIGINT NOT NULL,
  "shipping_address_format" TEXT,
  "payment_address_format" TEXT,
  "shipping_method" VARCHAR(128) NOT NULL, -- 'cargo' etc
  "comment" TEXT,
  "total" DECIMAL(15,2) NOT NULL,
  "order_status_id" BIGSERIAL NOT NULL,
  "commission" DECIMAL(10,0) NOT NULL,
  "currency_code" VARCHAR(3) NOT NULL,
  "currency_value" DECIMAL(11,0) NOT NULL,
  "ip_address" INET NOT NULL,
  "payment_flag" BOOLEAN NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "order_id" BIGSERIAL NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_logs_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_logs_currency_id" FOREIGN KEY ("currency_id") REFERENCES "tbl_currencies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_logs_shipping_address_id" FOREIGN KEY ("shipping_address_id") REFERENCES "tbl_customer_addresses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_logs_payment_address_id" FOREIGN KEY ("payment_address_id") REFERENCES "tbl_customer_addresses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_logs_order_status_id" FOREIGN KEY ("order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_logs_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_options";
CREATE TABLE "tbl_order_options" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_option_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "product_option_value_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "value" TEXT NOT NULL,
  "type" VARCHAR(32) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_options_product_option_id" FOREIGN KEY ("product_option_id") REFERENCES "tbl_product_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_options_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_options_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_options_product_option_value_id" FOREIGN KEY ("product_option_value_id") REFERENCES "tbl_product_option_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_options_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_options_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_option_translations";
CREATE TABLE "tbl_order_option_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "order_option_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "value" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_option_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_option_translations_order_option_id" FOREIGN KEY ("order_option_id") REFERENCES "tbl_order_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_option_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_option_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_products";
CREATE TABLE "tbl_order_products" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "product_price" DECIMAL(15,2) NOT NULL,
  "quantity" INT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "order_status_id" BIGINT NOT NULL,
  "order_fulfillment_status_id" BIGINT,
  "order_product_prefix_id" VARCHAR(255) NOT NULL,
  "base_price" DECIMAL(10,2) NOT NULL,
  "tax_type" INT NOT NULL, -- 'vat', 'gst'
  "tax_value" INT NOT NULL DEFAULT '0', -- 0-100 (always percentage)
  "total" DECIMAL(15,2) NOT NULL,
  "tax" DECIMAL(15,4),
  "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  "discounted_amount" DECIMAL(10,2) NOT NULL,
  "cancel_request" BOOLEAN NOT NULL DEFAULT 'false',
  "cancel_request_status" VARCHAR(32), -- 'pending', 'rejected', 'approved'
  "cancel_reason" VARCHAR(255),
  "cancel_reason_description" TEXT,
  "variant_name" VARCHAR(255) NOT NULL,
  "product_variant_option_id" BIGINT NOT NULL,
  "sku_name" VARCHAR(255) NOT NULL,
  "price_group_detail_id" BIGINT, -- come here
  "coupon_discount_amount" DECIMAL(16,2) NOT NULL DEFAULT '0.00',
  "refunded_quantity" INT NOT NULL DEFAULT '0',
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  "coupon_id" BIGINT,
  "campaign_discount_amount" DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  "campaign_id" BIGINT,
  "tags" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_products_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_order_fulfillment_status_id" FOREIGN KEY ("order_fulfillment_status_id") REFERENCES "tbl_order_fulfillment_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_order_status_id" FOREIGN KEY ("order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_campaign_id" FOREIGN KEY ("campaign_id") REFERENCES "tbl_campaigns" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_product_variant_option_id" FOREIGN KEY ("product_variant_option_id") REFERENCES "tbl_product_variant_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_products_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_product_translations";
CREATE TABLE "tbl_order_product_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "cancel_reason" VARCHAR(255),
  "cancel_reason_description" TEXT,
  "variant_name" VARCHAR(255) NOT NULL,
  "tags" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_product_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_translations_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_product_logs";
CREATE TABLE "tbl_order_product_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "product_price" DECIMAL(15,2) NOT NULL,
  "quantity" INT NOT NULL,
  "total" DECIMAL(15,4) NOT NULL,
  "tax" DECIMAL(15,4),
  "order_status_id" BIGINT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_product_logs_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_logs_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_logs_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_logs_order_status_id" FOREIGN KEY ("order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_product_logs_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_statuses";
CREATE TABLE "tbl_order_statuses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "color_code" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "priority" INT NOT NULL,
  "parent_id" BIGINT NOT NULL DEFAULT '0',
  "is_admin" BOOLEAN NOT NULL DEFAULT 'true',
  "is_vendor" BOOLEAN NOT NULL DEFAULT 'true',
  "is_buyer" BOOLEAN NOT NULL DEFAULT 'true',
  "is_api" BOOLEAN NOT NULL DEFAULT 'true',
  "default_status_id" BIGINT NOT NULL DEFAULT '0',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_statuses_parent_id" FOREIGN KEY ("parent_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_statuses_default_status_id" FOREIGN KEY ("default_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_statuses_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_statuses_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_status_translations";
CREATE TABLE "tbl_order_status_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "order_status_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_status_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_status_translations_order_status_id" FOREIGN KEY ("order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_status_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_status_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_fulfillment_statuses";
CREATE TABLE "tbl_order_fulfillment_statuses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "color_code" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "priority" INT NOT NULL,
  "parent_id" BIGINT,
  "is_admin" BOOLEAN NOT NULL DEFAULT 'false',
  "is_vendor" BOOLEAN NOT NULL DEFAULT 'false',
  "is_buyer" BOOLEAN NOT NULL DEFAULT 'false',
  "is_api" BOOLEAN NOT NULL DEFAULT 'false',
  "default_status_id" BIGINT NOT NULL DEFAULT '0',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_fulfillment_statuses_parent_id" FOREIGN KEY ("parent_id") REFERENCES "tbl_order_fulfillment_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_fulfillment_statuses_default_status_id" FOREIGN KEY ("default_status_id") REFERENCES "tbl_order_fulfillment_statuses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_fulfillment_statuses_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_fulfillment_statuses_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_fulfillment_status_translations";
CREATE TABLE "tbl_order_fulfillment_status_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "order_fulfillment_status_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_fulfillment_status_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_fulfillment_status_translations_order_fulfillment_status_id" FOREIGN KEY ("order_fulfillment_status_id") REFERENCES "tbl_order_fulfillment_statuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_fulfillment_status_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_fulfillment_status_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_statuses_to_fulfillment_statuses";
CREATE TABLE "tbl_order_statuses_to_fulfillment_statuses" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_status_id" BIGINT NOT NULL,
  "order_fulfillment_status_id" BIGINT NOT NULL,
  CONSTRAINT "fk_tbl_order_statuses_to_fulfillment_statuses_order_status_id" FOREIGN KEY ("order_status_id") REFERENCES "tbl_order_statuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_statuses_to_fulfillment_statuses_order_fulfillment_status_id" FOREIGN KEY ("order_fulfillment_status") REFERENCES "tbl_order_fulfillment_statuses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_order_totals";
CREATE TABLE "tbl_order_totals" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "code" VARCHAR(32),
  "title" VARCHAR(255),
  "text" VARCHAR(255),
  "value" DECIMAL(15,2) NOT NULL,
  "sort_order" INT,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_order_totals_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_totals_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_totals_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_quotations";
CREATE TABLE "tbl_quotations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "product_id" BIGINT NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "quantity" INT NOT NULL,
  "quantity_unit" VARCHAR(255) NOT NULL,
  "order_value" VARCHAR(255) NOT NULL,
  "comments" TEXT,
  "purpose" INT DEFAULT NULL, -- come here again
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_quotations_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_quotations_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_quotations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_quotations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_settlements";
CREATE TABLE "tbl_settlements" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "no_of_orders" INT NOT NULL,
  "total_amount" DECIMAL(10,2) NOT NULL,
  "currency_symbol_left" VARCHAR(255),
  "currency_symbol_right" VARCHAR(255),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_settlements_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settlements_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_settlement_items";
CREATE TABLE "tbl_settlement_items" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_order_id" BIGINT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "company_name" VARCHAR(255) NOT NULL,
  "settlement_id" BIGINT NOT NULL,
  "order_id" BIGINT DEFAULT NULL,
  "order_product_id" BIGINT DEFAULT NULL,
  "order_product_prefix_id" VARCHAR(255) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "commission" INT NOT NULL,
  "commission_amount" DECIMAL(10,2) NOT NULL,
  "net_amount" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_settlement_items_settlement_id" FOREIGN KEY ("settlement_id") REFERENCES "tbl_settlements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settlement_items_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settlement_items_vendor_order_id" FOREIGN KEY ("vendor_order_id") REFERENCES "tbl_vendor_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settlement_items_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settlement_items_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settlement_items_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_settlement_items_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);


DROP TABLE IF EXISTS "tbl_coupons";
CREATE TABLE "tbl_coupons" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "code" VARCHAR(64) NOT NULL UNIQUE,
  "description" TEXT,
  "discount_type" VARCHAR(16) NOT NULL,
  "discount_value" DECIMAL(10,2) NOT NULL,
  "min_purchase_amount" DECIMAL(10,2),
  "max_discount_amount" DECIMAL(10,2),
  "banner_image_url" TEXT,
  "banner_image_id" TEXT,
  "usage_limit" INT,
  "usage_count" INT DEFAULT '0',
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_coupons_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_coupons_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_coupons_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_coupon_translations";
CREATE TABLE "tbl_coupon_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "coupon_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_coupon_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_coupon_translations_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_coupon_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_coupon_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_coupons_to_products";
CREATE TABLE "tbl_coupons_to_products" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "coupon_id" BIGINT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  UNIQUE ("coupon_id", "product_id"),
  CONSTRAINT "fk_tbl_coupons_to_products_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_coupons_to_products_product_id" FOREIGN KEY ("product_id") REFERENCES "tbl_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_coupons_to_categories";
CREATE TABLE "tbl_coupons_to_categories" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "coupon_id" BIGINT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  UNIQUE ("coupon_id", "category_id"),
  CONSTRAINT "fk_tbl_coupons_to_categories_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_coupons_to_categories_category_id" FOREIGN KEY ("category_id") REFERENCES "tbl_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_orders_to_coupons";
CREATE TABLE "tbl_orders_to_coupons" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "coupon_id" BIGINT NOT NULL,
  "discount_amount" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  UNIQUE ("order_id", "coupon_id"),
  CONSTRAINT "fk_tbl_orders_to_coupons_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_orders_to_coupons_coupon_id" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_campaigns";
CREATE TABLE "tbl_campaigns" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_campaigns_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_campaigns_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_campaign_translations";
CREATE TABLE "tbl_campaign_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "campaign_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_campaign_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_campaign_translations_campaign_id" FOREIGN KEY ("campaign_id") REFERENCES "tbl_campaigns" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_campaign_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_campaign_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vouchers";
CREATE TABLE "tbl_vouchers" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "campaign_id" BIGINT,
  "code" VARCHAR(64) NOT NULL UNIQUE,
  "type" VARCHAR(32) NOT NULL, -- 'percentage', 'fixed_amount'
  "discount_value" DECIMAL(10,2) NOT NULL,
  "minimum_spend" DECIMAL(10,2),
  "maximum_discount" DECIMAL(10,2),
  "usage_limit" INT,
  "used_count" INT DEFAULT '0',
  "is_active" BOOLEAN NOT NULL DEFAULT' true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vouchers_campaign_id" FOREIGN KEY ("campaign_id") REFERENCES "tbl_campaigns" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vouchers_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vouchers_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);


############################################# PAYMENT MANAGEMENT ##########################################


DROP TABLE IF EXISTS "tbl_customer_transactions";
CREATE TABLE "tbl_customer_transactions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "order_id" BIGINT NOT NULL,
  "description" TEXT,
  "amount" DECIMAL(15,4) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_customer_transactions_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_transactions_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_transactions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_customer_transactions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_payments";
CREATE TABLE "tbl_payments" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "paid_date" TIMESTAMP NOT NULL,
  "payment_number" VARCHAR(255),
  "payment_information" TEXT, -- json, payment provider response
  "payment_amount" DECIMAL(10,2) NOT NULL,
  "payment_commission_amount" DECIMAL(10,2),
  "payment_type" VARCHAR(64) NOT NULL,
  "payment_status" VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, paid, refunded etc
  "payout_status" VARCHAR(32) NOT NULL DEFAULT 'held', -- held, disbursed, refunded
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "held_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "disbursed_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "disbursed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_payments_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payments_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payments_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_payment_archives";
CREATE TABLE "tbl_payment_archives" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "paid_date" TIMESTAMP NOT NULL,
  "payment_number" VARCHAR(255) NOT NULL,
  "payment_information" TEXT, -- json
  "payment_amount" DECIMAL(10,2) NOT NULL,
  "payment_commission_amount" DECIMAL(10,2),
  "payment_type" VARCHAR(64) NOT NULL,
  "payment_status" VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, paid, refunded etc
  "payout_status" VARCHAR(32) NOT NULL DEFAULT 'held', -- held, disbursed, refunded
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "held_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "disbursed_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "disbursed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_payment_archives_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_archives_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_archives_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_payment_items";
CREATE TABLE "tbl_payment_items" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "payment_id" BIGINT NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "total_amount" DECIMAL(10,2) NOT NULL,
  "product_name" VARCHAR(255) NOT NULL,
  "product_quantity" INT NOT NULL,
  "product_price" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_payment_items_payment_id" FOREIGN KEY ("payment_id") REFERENCES "tbl_payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_items_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_items_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_items_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_payment_item_archives";
CREATE TABLE "tbl_payment_item_archives" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "payment_archive_id" BIGINT NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "total_amount" DECIMAL(10,2) NOT NULL,
  "product_name" VARCHAR(255) NOT NULL,
  "product_quantity" INT NOT NULL,
  "product_price" DECIMAL(10,2) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_payment_item_archives_payment_archive_id" FOREIGN KEY ("payment_archive_id") REFERENCES "tbl_payment_archives" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_item_archives_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_item_archives_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_payment_item_archives_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_paypal_orders";
CREATE TABLE "tbl_paypal_orders" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "paypal_ref_id" VARCHAR(255) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "status" INT NOT NULL,
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_paypal_orders_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_paypal_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_paypal_orders_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_paypal_order_transactions";
CREATE TABLE "tbl_paypal_order_transactions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "paypal_order_id" BIGINT NOT NULL,
  "payment_data" TEXT NOT NULL,
  "payment_type" VARCHAR(255) NOT NULL,
  "payment_status" INT NOT NULL,
  "refund_id" BIGINT,
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "transaction_type" VARCHAR(32) NOT NULL DEFAULT 'payment', -- 'payment', 'refund'
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_paypal_order_transactions_paypal_order_id" FOREIGN KEY ("paypal_order_id") REFERENCES "tbl_paypal_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_paypal_order_transactions_refund_id" FOREIGN KEY ("refund_id") REFERENCES "tbl_paypal_order_transactions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_paypal_order_transactions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_paypal_order_transactions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_stripe_orders";
CREATE TABLE "tbl_stripe_orders" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "stripe_ref_id" VARCHAR(255) NOT NULL,
  "total" VARCHAR(255) NOT NULL,
  "status" VARCHAR(32) NOT NULL,
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_stripe_orders_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stripe_orders_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stripe_orders_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_stripe_order_transactions";
CREATE TABLE "tbl_stripe_order_transactions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "stripe_order_id" BIGINT NOT NULL,
  "payment_type" VARCHAR(255) NOT NULL,
  "payment_data" TEXT NOT NULL,
  "payment_status" VARCHAR(32) NOT NULL,
  "refund_id" BIGINT,
  "refunded_amount" DECIMAL(15,2) NOT NULL DEFAULT '0.0',
  "transaction_type" VARCHAR(32) NOT NULL DEFAULT 'payment', -- 'payment', 'refund'
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_stripe_order_transactions_stripe_order_id" FOREIGN KEY ("stripe_order_id") REFERENCES "tbl_stripe_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stripe_order_transactions_refund_id" FOREIGN KEY ("refund_id") REFERENCES "tbl_refunds" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stripe_order_transactions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stripe_order_transactions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_refunds";
CREATE TABLE "tbl_refunds" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "payment_id" BIGINT NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "refund_amount" DECIMAL(10,2) NOT NULL,
  "refund_reason" TEXT NOT NULL,
  "refund_status" VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed'
  "refund_type" VARCHAR(32) NOT NULL -- 'full', 'partial'
  "processed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_refunds_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refunds_payment_id" FOREIGN KEY ("payment_id") REFERENCES "tbl_payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refunds_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refunds_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refunds_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_refund_items";
CREATE TABLE "tbl_refund_items" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "refund_id" BIGINT NOT NULL,
  "order_product_id" BIGINT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "quantity" INT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_refund_items_refund_id" FOREIGN KEY ("refund_id") REFERENCES "tbl_refunds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_items_order_product_id" FOREIGN KEY ("order_product_id") REFERENCES "tbl_order_products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_items_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_items_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_items_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_refund_status_history";
CREATE TABLE "tbl_refund_status_history" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "refund_id" BIGINT NOT NULL,
  "status" VARCHAR(50) NOT NULL,
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_refund_status_history_refund_id" FOREIGN KEY ("refund_id") REFERENCES "tbl_refunds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_status_history_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_status_history_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_refund_status_history_translations";
CREATE TABLE "tbl_refund_status_history_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "refund_status_history_id" BIGINT NOT NULL,
  "comment" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_refund_status_history_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_status_history_translations_refund_status_history_id" FOREIGN KEY ("refund_status_history_id") REFERENCES "tbl_refund_status_history" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_status_history_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_refund_status_history_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_payout_schedules";
CREATE TABLE "tbl_vendor_payout_schedules" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "payout_day" INT NOT NULL, -- Day of the week (1-7)
  "last_payout_date" TIMESTAMP,
  "next_payout_date" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_payout_schedules_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payout_schedules_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payout_schedules_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_balances";
CREATE TABLE "tbl_vendor_balances" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "available_balance" DECIMAL(15,2) NOT NULL DEFAULT '0',
  "pending_balance" DECIMAL(15,2) NOT NULL DEFAULT '0',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_balances_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_balances_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_balances_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_payouts";
CREATE TABLE "tbl_vendor_payouts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  "payout_method" VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'bank_transfer'
  "transaction_id" VARCHAR(255),
  "payout_date" TIMESTAMP,
  "notification_sent" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_payouts_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payouts_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payouts_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_subscription_plans";
CREATE TABLE "tbl_subscription_plans" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "billing_cycle" VARCHAR(32) NOT NULL, -- 'monthly', 'yearly', etc.
  "features" TEXT NOT NULL, -- json string
  "is_active" BOOLEAN NOT NULL DEFAULT 'true',
  "trial_days" INT NOT NULL DEFAULT '0',
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_subscription_plans_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_plans_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_subscription_plan_translations";
CREATE TABLE "tbl_subscription_plan_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "subscription_plan_id" BIGINT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" TEXT,
  "features" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_subscription_plan_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_plan_translations_subscription_plan_id" PRIMARY KEY ("subscription_plan_id") REFERENCES "tbl_subscription_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_plan_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_plan_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_vendor_subscriptions";
CREATE TABLE "tbl_vendor_subscriptions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "plan_id" BIGINT NOT NULL,
  "status" VARCHAR(32) NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP,
  "trial_end_date" TIMESTAMP,
  "cancellation_date" TIMESTAMP,
  "is_auto_renew" BOOLEAN NOT NULL DEFAULT 'true',
  "payment_method" VARCHAR(32) NOT NULL, -- 'paypal', 'stripe'
  "payment_subscription_id" VARCHAR(255), -- PayPal or Stripe subscription ID
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_vendor_subscriptions_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_subscriptions_plan_id" FOREIGN KEY ("plan_id") REFERENCES "tbl_subscription_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_subscriptions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_subscriptions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_subscription_transactions";
CREATE TABLE "tbl_subscription_transactions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_subscription_id" BIGINT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "transaction_date" TIMESTAMP NOT NULL,
  "status" VARCHAR(20) NOT NULL, -- 'success', 'failed', 'refunded'
  "payment_method" VARCHAR(32) NOT NULL, -- 'paypal', 'stripe'
  "payment_transaction_id" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_subscription_transactions_vendor_subscription_id" FOREIGN KEY ("vendor_subscription_id") REFERENCES "tbl_vendor_subscriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_transactions_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_transactions_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_paypal_subscription_details";
CREATE TABLE "tbl_paypal_subscription_details" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_subscription_id" BIGINT NOT NULL,
  "paypal_subscription_id" VARCHAR(255) NOT NULL,
  "paypal_plan_id" VARCHAR(255) NOT NULL,
  "status" VARCHAR(64) NOT NULL,
  "payer_id" VARCHAR(255),
  "payer_email" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_paypal_subscription_details_vendor_subscription_id" FOREIGN KEY ("vendor_subscription_id") REFERENCES "tbl_vendor_subscriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_paypal_subscription_details_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_paypal_subscription_details_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_stripe_subscription_details";
CREATE TABLE "tbl_stripe_subscription_details" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_subscription_id" BIGINT NOT NULL,
  "stripe_subscription_id" VARCHAR(255) NOT NULL,
  "stripe_customer_id" VARCHAR(255) NOT NULL,
  "stripe_price_id" VARCHAR(255) NOT NULL,
  "status" VARCHAR(64) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_stripe_subscription_details_vendor_subscription_id" FOREIGN KEY ("vendor_subscription_id") REFERENCES "tbl_vendor_subscriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stripe_subscription_details_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_stripe_subscription_details_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_subscription_feature_usage";
CREATE TABLE "tbl_subscription_feature_usage" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_subscription_id" BIGINT NOT NULL,
  "feature_name" VARCHAR(128) NOT NULL,
  "usage_count" INT NOT NULL DEFAULT '0',
  "last_used_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_subscription_feature_usage_vendor_subscription_id" FOREIGN KEY ("vendor_subscription_id") REFERENCES "tbl_vendor_subscriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_feature_usage_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_feature_usage_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_subscription_feature_usage_translations";
CREATE TABLE "tbl_subscription_feature_usage_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "subscription_feature_usage_id" BIGINT NOT NULL,
  "feature_name" VARCHAR(128) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_subscription_feature_usage_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_feature_usage_translations_subscription_feature_usage_id" FOREIGN KEY ("subscription_feature_usage_id") REFERENCES "tbl_subscription_feature_usage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_feature_usage_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_feature_usage_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_subscription_logs";
CREATE TABLE "tbl_subscription_logs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_subscription_id" BIGINT NOT NULL,
  "action" VARCHAR(64) NOT NULL, -- 'created', 'renewed', 'cancelled', 'upgraded', 'downgraded'
  "description" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_by" BIGINT,
  CONSTRAINT "fk_tbl_subscription_logs_vendor_subscription_id" FOREIGN KEY ("vendor_subscription_id") REFERENCES "tbl_vendor_subscriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_subscription_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);


############################################# CHAT MANAGEMENT ##########################################

DROP TABLE IF EXISTS "tbl_message_reactions";
CREATE TABLE "tbl_reactions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "reaction" VARCHAR(64) NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "message_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_reactions_message_id" FOREIGN KEY ("message_id") REFERENCES "tbl_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_reactions_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_messages";
CREATE TABLE "tbl_messages" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "content" TEXT NOT NULL,
  "type" VARCHAR(64) NOT NULL, -- text, emoji-only
  "sender_id" BIGINT, -- sender account id
  "replied_to_msg_id" BIGINT,
  "chat_room_id" BIGINT NOT NULL,
  "is_deleted" BOOLEAN DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_messages_sender_id" FOREIGN KEY ("sender_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_messages_chat_room_id" FOREIGN KEY ("chat_room_id") REFERENCES "tbl_chats" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_messages_replied_to_msg_id" FOREIGN KEY ("replied_to_msg_id") REFERENCES "tbl_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_chat_rooms";
CREATE TABLE "tbl_chats" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "type" VARCHAR(32) NOT NULL, -- 'vendor_admin', 'customer_vendor'
  "vendor_id" BIGINT,
  "customer_id" BIGINT,
  "admin_id" BIGINT
  "last_message" TEXT DEFAULT '',
  "last_message_date" TIMESTAMP,
  "last_message_read_by" BIGINT[], -- account id's
  "last_message_sender_id" BIGINT, -- sender user account id
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_chat_rooms_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_chat_rooms_customer_id" FOREIGN KEY ("customer_id") REFERENCES "tbl_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_chat_rooms_admin_id" FOREIGN KEY ("admin_id") REFERENCES "tbl_admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_chat_rooms_last_message_sender_id" FOREIGN KEY ("last_message_sender_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_unread_message_counts";
CREATE TABLE "tbl_unread_message_counts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "chat_room_id" BIGINT NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "unread_count" INT NOT NULL DEFAULT '0',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_unread_message_counts_chat_room_id" FOREIGN KEY ("chat_room_id") REFERENCES "tbl_chat_rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_unread_message_counts_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_read_receipts";
CREATE TABLE "tbl_read_receipts" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "chat_room_id" BIGINT NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "last_read_message_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_read_receipts_chat_room_id" FOREIGN KEY ("chat_room_id") REFERENCES "tbl_chat_rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_read_receipts_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_read_receipts_last_read_message_id" FOREIGN KEY ("last_read_message_id") REFERENCES "tbl_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

############################################# NOTIFICATION MANAGEMENT ##########################################


DROP TABLE IF EXISTS "tbl_order_notifications";
CREATE TABLE "tbl_order_notifications" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "order_id" BIGINT NOT NULL,
  "recipient_id" BIGINT NOT NULL, -- user account id
  "notification_type" VARCHAR(64) NOT NULL, -- 'new_order', 'order_update', etc.
  "notification_headline" TEXT NOT NULL,
  "status" VARCHAR(64) NOT NULL DEFAULT 'unread', -- unread, read, archived
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_order_notifications_order_id" FOREIGN KEY ("order_id") REFERENCES "tbl_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_order_notifications_recipient_id" FOREIGN KEY ("recipient_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_vendor_order_notifications";
CREATE TABLE "tbl_vendor_order_notifications" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_order_id" BIGINT NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "notification_type" VARCHAR(64) NOT NULL, -- 'new_order', 'order_update', etc.
  "notification_headline" TEXT NOT NULL,
  "status" VARCHAR(64) NOT NULL DEFAULT 'unread', -- unread, read, archived
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_vendor_order_notifications_vendor_order_id" FOREIGN KEY ("vendor_order_id") REFERENCES "tbl_vendor_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_notifications_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_chat_notifications";
CREATE TABLE "tbl_chat_notifications" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "status" VARCHAR(64) NOT NULL DEFAULT 'unread', -- unread, read, archived
  "recipient_id" BIGINT NOT NULL, -- user account id
  "notification_headline" TEXT NOT NULL,
  "is_admin_seller_chat" BOOLEAN NOT NULL,
  "chat_room_id" BIGINT NOT NULL,
  "message_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_chat_notifications_chat_room_id" FOREIGN KEY ("chat_room_id") REFERENCES "tbl_chat_rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_chat_notifications_message_id" FOREIGN KEY ("message_id") REFERENCES "tbl_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_chat_notifications_recipient_id" FOREIGN KEY ("recipient_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_vendor_payout_notifications";
CREATE TABLE "tbl_vendor_payout_notifications" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "vendor_id" BIGINT NOT NULL,
  "payout_id" BIGINT NOT NULL,
  "notification_headline" TEXT NOT NULL,
  "status" VARCHAR(64) NOT NULL DEFAULT 'unread', -- unread, read, archived
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_vendor_payout_notifications_vendor_id" FOREIGN KEY ("vendor_id") REFERENCES "tbl_vendors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_payout_notifications_payout_id" FOREIGN KEY ("payout_id") REFERENCES "tbl_vendor_payouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_vendor_order_refund_notifications";
CREATE TABLE "tbl_vendor_order_refund_notifications" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "status" VARCHAR(64) NOT NULL DEFAULT 'unread', -- unread, read, archived
  "recipient_id" BIGINT NOT NULL, -- user account id
  "notification_headline" TEXT NOT NULL,
  "refund_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "fk_tbl_vendor_order_refund_notifications_refund_id" FOREIGN KEY ("refund_id") REFERENCES "tbl_refunds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_vendor_order_refund_notifications_recipient_id" FOREIGN KEY ("recipient_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);


############################################ Media Gallery #######################################################

DROP TABLE IF EXISTS "tbl_media_gallery_folders";
CREATE TABLE "tbl_media_gallery_folders" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "user_account_id" BIGINT NOT NULL, -- id of user account to which this media gallery belongs
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  UNIQUE("name", "user_account_id"),
  CONSTRAINT "fk_tbl_media_gallery_folders_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_folders_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_folders_user_account_id" FOREIGN KEY ("user)account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS "tbl_media_gallery_folder_translations";
CREATE TABLE "tbl_media_gallery_folder_translations" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "language_id" BIGINT NOT NULL,
  "media_gallery_folder_id" BIGINT NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  CONSTRAINT "fk_tbl_media_gallery_folder_translations_language_id" FOREIGN KEY ("language_id") REFERENCES "tbl_languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_folder_translations_media_gallery_folder_id" FOREIGN KEY ("media_gallery_folder_id") REFERENCES "tbl_media_gallery_folders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_folder_translations_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_folder_translations_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);

DROP TABLE IF EXISTS "tbl_media_gallery_files";
CREATE TABLE "tbl_media_gallery_files" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "file_original_name" VARCHAR(512) NOT NULL,
  "file_type" VARCHAR(128) NOT NULL,
  "file_size" BIGINT NOT NULL,
  "file_id" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "user_account_id" BIGINT NOT NULL,
  "media_gallery_folder_id" BIGINT,
  "metadata" TEXT NOT NULL DEFAULT '{}', --  field stores additional file information (dimensions, etc.)
  "is_deleted" BOOLEAN NOT NULL DEFAULT 'false',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "deleted_at" BIGINT,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "deleted_by" BIGINT,
  "created_by_type" VARCHAR(16),
  "updated_by_type" VARCHAR(16),
  "deleted_by_type" VARCHAR(16),
  CONSTRAINT "fk_tbl_media_gallery_files_media_gallery_folder_id" FOREIGN KEY ("media_gallery_folder_id") REFERENCES "tbl_media_gallery_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_files_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_files_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_files_deleted_by" FOREIGN KEY ("deleted_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_files_user_account_id" FOREIGN KEY ("user_account_id") REFERENCES "tbl_user_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tracks where each media file is used in the application
-- entity_type and entity_id create a polymorphic relationship
-- Allows tracking usage across different contexts (products, categories, etc.)
DROP TABLE IF EXISTS "tbl_media_gallery_file_usage";
CREATE TABLE "tbl_media_gallery_file_usage" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "media_gallery_file_id" BIGINT NOT NULL,
  "entity_type" VARCHAR(64) NOT NULL, -- product, category etc
  "entity_id" BIGINT NOT NULL,
  "usage_type" VARCHAR(64) NOT NULL, -- product_main, product_variant, vendor_profile, vendor_banner, vendor_logo
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "created_by" BIGINT,
  "updated_by" BIGINT,
  UNIQUE('media_gallery_file_id', 'entity_type', 'entity_id', 'usage_type'),
  CONSTRAINT "fk_tbl_media_gallery_file_usage_media_gallery_file_id" FOREIGN KEY ("media_gallery_file_id") REFERENCES  "tbl_media_gallery_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_file_usage_created_by" FOREIGN KEY ("created_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "fk_tbl_media_gallery_file_usage_updated_by" FOREIGN KEY ("updated_by") REFERENCES "tbl_user_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
);
