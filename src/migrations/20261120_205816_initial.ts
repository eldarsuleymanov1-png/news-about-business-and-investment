import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('uk', 'en');
  CREATE TYPE "public"."enum_materials_check_criteria_criterion" AS ENUM('registration', 'owners', 'licenses', 'regulator-lists', 'promised-returns', 'reporting', 'court-cases');
  CREATE TYPE "public"."enum_materials_check_criteria_status" AS ENUM('ok', 'question', 'violation');
  CREATE TYPE "public"."enum_materials_check_verdict_history_verdict" AS ENUM('no-risks', 'questions', 'high-risk', 'fraud-signs');
  CREATE TYPE "public"."enum_materials_audience" AS ENUM('in-ukraine', 'diaspora', 'foreigners');
  CREATE TYPE "public"."enum_materials_status" AS ENUM('draft', 'editing', 'fact-check', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum_materials_format" AS ENUM('news', 'analysis', 'check', 'guide', 'case', 'interview', 'numbers', 'digest');
  CREATE TYPE "public"."enum_materials_sponsorship_label" AS ENUM('advertising', 'partner');
  CREATE TYPE "public"."enum_materials_check_verdict" AS ENUM('no-risks', 'questions', 'high-risk', 'fraud-signs');
  CREATE TYPE "public"."enum_materials_check_right_of_reply_outcome" AS ENUM('pending', 'responded', 'no-response');
  CREATE TYPE "public"."enum__materials_v_version_check_criteria_criterion" AS ENUM('registration', 'owners', 'licenses', 'regulator-lists', 'promised-returns', 'reporting', 'court-cases');
  CREATE TYPE "public"."enum__materials_v_version_check_criteria_status" AS ENUM('ok', 'question', 'violation');
  CREATE TYPE "public"."enum__materials_v_version_check_verdict_history_verdict" AS ENUM('no-risks', 'questions', 'high-risk', 'fraud-signs');
  CREATE TYPE "public"."enum__materials_v_version_audience" AS ENUM('in-ukraine', 'diaspora', 'foreigners');
  CREATE TYPE "public"."enum__materials_v_version_status" AS ENUM('draft', 'editing', 'fact-check', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum__materials_v_version_format" AS ENUM('news', 'analysis', 'check', 'guide', 'case', 'interview', 'numbers', 'digest');
  CREATE TYPE "public"."enum__materials_v_version_sponsorship_label" AS ENUM('advertising', 'partner');
  CREATE TYPE "public"."enum__materials_v_version_check_verdict" AS ENUM('no-risks', 'questions', 'high-risk', 'fraud-signs');
  CREATE TYPE "public"."enum__materials_v_version_check_right_of_reply_outcome" AS ENUM('pending', 'responded', 'no-response');
  CREATE TYPE "public"."enum_authors_socials_network" AS ENUM('linkedin', 'facebook', 'x', 'telegram', 'instagram', 'website');
  CREATE TYPE "public"."enum_media_license" AS ENUM('own', 'stock', 'press', 'cc');
  CREATE TYPE "public"."enum_tags_kind" AS ENUM('topic', 'company', 'person', 'fund');
  CREATE TYPE "public"."enum_regions_kind" AS ENUM('country', 'region');
  CREATE TYPE "public"."enum_check_requests_status" AS ENUM('new', 'in-progress', 'published', 'rejected');
  CREATE TYPE "public"."enum_check_requests_locale" AS ENUM('uk', 'en');
  CREATE TYPE "public"."enum_error_reports_status" AS ENUM('new', 'fixed', 'not-an-error');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'chief-editor', 'editor', 'author', 'ad-manager');
  CREATE TYPE "public"."enum_audit_log_action" AS ENUM('create', 'update', 'publish', 'unpublish', 'status-change', 'delete');
  CREATE TYPE "public"."enum_homepage_blocks_kind" AS ENUM('latest-news', 'sections', 'section', 'latest-checks', 'subscribe');
  CREATE TYPE "public"."enum__homepage_v_version_blocks_kind" AS ENUM('latest-news', 'sections', 'section', 'latest-checks', 'subscribe');
  CREATE TABLE "materials_check_criteria" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"criterion" "enum_materials_check_criteria_criterion",
  	"status" "enum_materials_check_criteria_status"
  );
  
  CREATE TABLE "materials_check_criteria_locales" (
  	"comment" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "materials_check_verdict_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"verdict" "enum_materials_check_verdict_history_verdict"
  );
  
  CREATE TABLE "materials_check_verdict_history_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "materials_digest_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"material_id" integer,
  	"external_url" varchar
  );
  
  CREATE TABLE "materials_digest_items_locales" (
  	"headline" varchar,
  	"comment" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "materials_audience" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_materials_audience",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "materials_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "materials_sources_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "materials_previous_paths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL
  );
  
  CREATE TABLE "materials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_materials_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"content_updated_at" timestamp(3) with time zone,
  	"format" "enum_materials_format" DEFAULT 'news' NOT NULL,
  	"sponsorship_is_sponsored" boolean DEFAULT false,
  	"sponsorship_label" "enum_materials_sponsorship_label" DEFAULT 'advertising',
  	"sponsorship_sponsor_name" varchar,
  	"military_checklist_no_locations" boolean,
  	"military_checklist_no_specs" boolean,
  	"military_checklist_no_non_public_data" boolean,
  	"created_by_id" integer,
  	"cover_id" integer,
  	"show_toc" boolean DEFAULT true,
  	"primary_source_url" varchar,
  	"check_verdict" "enum_materials_check_verdict",
  	"check_subject_company_id" integer,
  	"check_subject_name" varchar,
  	"check_subject_website" varchar,
  	"check_subject_legal_entity" varchar,
  	"check_subject_edrpou" varchar,
  	"check_subject_country" varchar,
  	"check_right_of_reply_request_sent_at" timestamp(3) with time zone,
  	"check_right_of_reply_outcome" "enum_materials_check_right_of_reply_outcome" DEFAULT 'pending',
  	"verified_at" timestamp(3) with time zone,
  	"interviewee_photo_id" integer,
  	"section_id" integer NOT NULL,
  	"rubric_id" integer NOT NULL,
  	"seo_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"distribution_telegram_posted_at" timestamp(3) with time zone,
  	"distribution_telegram_message_url" varchar,
  	"distribution_include_in_digest" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "materials_locales" (
  	"slug" varchar,
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"tldr" varchar,
  	"content" jsonb,
  	"investor_takeaway" varchar,
  	"check_verdict_change_note" varchar,
  	"check_right_of_reply_response" varchar,
  	"case_study_invested" varchar,
  	"case_study_term" varchar,
  	"case_study_result" varchar,
  	"interviewee_name" varchar,
  	"interviewee_position" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "materials_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"evidence_id" integer,
  	"regions_id" integer,
  	"companies_id" integer,
  	"tags_id" integer,
  	"materials_id" integer
  );
  
  CREATE TABLE "_materials_v_version_check_criteria" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"criterion" "enum__materials_v_version_check_criteria_criterion",
  	"status" "enum__materials_v_version_check_criteria_status",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_materials_v_version_check_criteria_locales" (
  	"comment" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_materials_v_version_check_verdict_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"verdict" "enum__materials_v_version_check_verdict_history_verdict",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_materials_v_version_check_verdict_history_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_materials_v_version_digest_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"material_id" integer,
  	"external_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_materials_v_version_digest_items_locales" (
  	"headline" varchar,
  	"comment" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_materials_v_version_audience" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__materials_v_version_audience",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_materials_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_materials_v_version_sources_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_materials_v_version_previous_paths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_materials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_status" "enum__materials_v_version_status" DEFAULT 'draft' NOT NULL,
  	"version_published_at" timestamp(3) with time zone,
  	"version_content_updated_at" timestamp(3) with time zone,
  	"version_format" "enum__materials_v_version_format" DEFAULT 'news' NOT NULL,
  	"version_sponsorship_is_sponsored" boolean DEFAULT false,
  	"version_sponsorship_label" "enum__materials_v_version_sponsorship_label" DEFAULT 'advertising',
  	"version_sponsorship_sponsor_name" varchar,
  	"version_military_checklist_no_locations" boolean,
  	"version_military_checklist_no_specs" boolean,
  	"version_military_checklist_no_non_public_data" boolean,
  	"version_created_by_id" integer,
  	"version_cover_id" integer,
  	"version_show_toc" boolean DEFAULT true,
  	"version_primary_source_url" varchar,
  	"version_check_verdict" "enum__materials_v_version_check_verdict",
  	"version_check_subject_company_id" integer,
  	"version_check_subject_name" varchar,
  	"version_check_subject_website" varchar,
  	"version_check_subject_legal_entity" varchar,
  	"version_check_subject_edrpou" varchar,
  	"version_check_subject_country" varchar,
  	"version_check_right_of_reply_request_sent_at" timestamp(3) with time zone,
  	"version_check_right_of_reply_outcome" "enum__materials_v_version_check_right_of_reply_outcome" DEFAULT 'pending',
  	"version_verified_at" timestamp(3) with time zone,
  	"version_interviewee_photo_id" integer,
  	"version_section_id" integer NOT NULL,
  	"version_rubric_id" integer NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_distribution_telegram_posted_at" timestamp(3) with time zone,
  	"version_distribution_telegram_message_url" varchar,
  	"version_distribution_include_in_digest" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_materials_v_locales" (
  	"version_slug" varchar,
  	"version_title" varchar NOT NULL,
  	"version_lead" varchar,
  	"version_tldr" varchar,
  	"version_content" jsonb,
  	"version_investor_takeaway" varchar,
  	"version_check_verdict_change_note" varchar,
  	"version_check_right_of_reply_response" varchar,
  	"version_case_study_invested" varchar,
  	"version_case_study_term" varchar,
  	"version_case_study_result" varchar,
  	"version_interviewee_name" varchar,
  	"version_interviewee_position" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_materials_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"evidence_id" integer,
  	"regions_id" integer,
  	"companies_id" integer,
  	"tags_id" integer,
  	"materials_id" integer
  );
  
  CREATE TABLE "authors_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_authors_socials_network" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors_locales" (
  	"name" varchar NOT NULL,
  	"position" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "authors_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar NOT NULL,
  	"license" "enum_media_license" DEFAULT 'own',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sections_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rubrics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"section_id" integer NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"requires_military_checklist" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rubrics_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"kind" "enum_tags_kind" DEFAULT 'topic',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "regions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"kind" "enum_regions_kind" DEFAULT 'country' NOT NULL,
  	"iso_code" varchar,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "regions_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"legal_name" varchar,
  	"edrpou" varchar,
  	"registration_number" varchar,
  	"industry" varchar,
  	"country_id" integer,
  	"website" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "companies_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "check_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_check_requests_status" DEFAULT 'new' NOT NULL,
  	"assignee_id" integer,
  	"project_name" varchar NOT NULL,
  	"url" varchar,
  	"description" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"locale" "enum_check_requests_locale" DEFAULT 'uk',
  	"company_id" integer,
  	"result_material_id" integer,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "check_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"request_files_id" integer
  );
  
  CREATE TABLE "evidence" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"company_id" integer,
  	"collected_at" timestamp(3) with time zone NOT NULL,
  	"source_url" varchar,
  	"notes" varchar,
  	"is_public" boolean DEFAULT false,
  	"retain_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "request_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "corrections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"material_id" integer NOT NULL,
  	"error_report_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "corrections_locales" (
  	"summary" varchar NOT NULL,
  	"details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "error_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_error_reports_status" DEFAULT 'new',
  	"material_id" integer,
  	"page_url" varchar,
  	"selected_text" varchar NOT NULL,
  	"comment" varchar,
  	"email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'author' NOT NULL,
  	"author_profile_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"action" "enum_audit_log_action" NOT NULL,
  	"collection_slug" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"summary" varchar,
  	"status_from" varchar,
  	"status_to" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materials_id" integer,
  	"authors_id" integer,
  	"media_id" integer,
  	"sections_id" integer,
  	"rubrics_id" integer,
  	"tags_id" integer,
  	"regions_id" integer,
  	"companies_id" integer,
  	"check_requests_id" integer,
  	"evidence_id" integer,
  	"request_files_id" integer,
  	"corrections_id" integer,
  	"error_reports_id" integer,
  	"users_id" integer,
  	"audit_log_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_homepage_blocks_kind" NOT NULL,
  	"section_id" integer,
  	"hidden" boolean
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materials_id" integer
  );
  
  CREATE TABLE "_homepage_v_version_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__homepage_v_version_blocks_kind" NOT NULL,
  	"section_id" integer,
  	"hidden" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materials_id" integer
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"publisher_owner" varchar,
  	"publisher_chief_editor" varchar,
  	"publisher_email" varchar,
  	"publisher_address" varchar,
  	"publisher_media_registration" varchar,
  	"social_telegram" varchar,
  	"social_linkedin" varchar,
  	"social_facebook" varchar,
  	"social_x" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"site_name" varchar DEFAULT 'InvestNews' NOT NULL,
  	"tagline" varchar,
  	"disclaimer_short" varchar DEFAULT 'Матеріал має інформаційний характер і не є інвестиційною рекомендацією. Рішення про інвестиції ви ухвалюєте самостійно.' NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "materials_check_criteria" ADD CONSTRAINT "materials_check_criteria_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_check_criteria_locales" ADD CONSTRAINT "materials_check_criteria_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials_check_criteria"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_check_verdict_history" ADD CONSTRAINT "materials_check_verdict_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_check_verdict_history_locales" ADD CONSTRAINT "materials_check_verdict_history_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials_check_verdict_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_digest_items" ADD CONSTRAINT "materials_digest_items_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials_digest_items" ADD CONSTRAINT "materials_digest_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_digest_items_locales" ADD CONSTRAINT "materials_digest_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials_digest_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_audience" ADD CONSTRAINT "materials_audience_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_sources" ADD CONSTRAINT "materials_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_sources_locales" ADD CONSTRAINT "materials_sources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_previous_paths" ADD CONSTRAINT "materials_previous_paths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_check_subject_company_id_companies_id_fk" FOREIGN KEY ("check_subject_company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_interviewee_photo_id_media_id_fk" FOREIGN KEY ("interviewee_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials" ADD CONSTRAINT "materials_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materials_locales" ADD CONSTRAINT "materials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_rels" ADD CONSTRAINT "materials_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_rels" ADD CONSTRAINT "materials_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_rels" ADD CONSTRAINT "materials_rels_evidence_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_rels" ADD CONSTRAINT "materials_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_rels" ADD CONSTRAINT "materials_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_rels" ADD CONSTRAINT "materials_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materials_rels" ADD CONSTRAINT "materials_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_check_criteria" ADD CONSTRAINT "_materials_v_version_check_criteria_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_check_criteria_locales" ADD CONSTRAINT "_materials_v_version_check_criteria_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v_version_check_criteria"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_check_verdict_history" ADD CONSTRAINT "_materials_v_version_check_verdict_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_check_verdict_history_locales" ADD CONSTRAINT "_materials_v_version_check_verdict_history_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v_version_check_verdict_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_digest_items" ADD CONSTRAINT "_materials_v_version_digest_items_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v_version_digest_items" ADD CONSTRAINT "_materials_v_version_digest_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_digest_items_locales" ADD CONSTRAINT "_materials_v_version_digest_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v_version_digest_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_audience" ADD CONSTRAINT "_materials_v_version_audience_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_sources" ADD CONSTRAINT "_materials_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_sources_locales" ADD CONSTRAINT "_materials_v_version_sources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v_version_sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_version_previous_paths" ADD CONSTRAINT "_materials_v_version_previous_paths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_parent_id_materials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_version_check_subject_company_id_companies_id_fk" FOREIGN KEY ("version_check_subject_company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_version_interviewee_photo_id_media_id_fk" FOREIGN KEY ("version_interviewee_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_version_section_id_sections_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_version_rubric_id_rubrics_id_fk" FOREIGN KEY ("version_rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v" ADD CONSTRAINT "_materials_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materials_v_locales" ADD CONSTRAINT "_materials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_rels" ADD CONSTRAINT "_materials_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_materials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_rels" ADD CONSTRAINT "_materials_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_rels" ADD CONSTRAINT "_materials_v_rels_evidence_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_rels" ADD CONSTRAINT "_materials_v_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_rels" ADD CONSTRAINT "_materials_v_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_rels" ADD CONSTRAINT "_materials_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materials_v_rels" ADD CONSTRAINT "_materials_v_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors_socials" ADD CONSTRAINT "authors_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors_locales" ADD CONSTRAINT "authors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors_texts" ADD CONSTRAINT "authors_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sections_locales" ADD CONSTRAINT "sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rubrics_locales" ADD CONSTRAINT "rubrics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_locales" ADD CONSTRAINT "tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions" ADD CONSTRAINT "regions_parent_id_regions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regions_locales" ADD CONSTRAINT "regions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_country_id_regions_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies_locales" ADD CONSTRAINT "companies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "check_requests" ADD CONSTRAINT "check_requests_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "check_requests" ADD CONSTRAINT "check_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "check_requests" ADD CONSTRAINT "check_requests_result_material_id_materials_id_fk" FOREIGN KEY ("result_material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "check_requests_rels" ADD CONSTRAINT "check_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."check_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "check_requests_rels" ADD CONSTRAINT "check_requests_rels_request_files_fk" FOREIGN KEY ("request_files_id") REFERENCES "public"."request_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "evidence" ADD CONSTRAINT "evidence_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "corrections" ADD CONSTRAINT "corrections_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "corrections" ADD CONSTRAINT "corrections_error_report_id_error_reports_id_fk" FOREIGN KEY ("error_report_id") REFERENCES "public"."error_reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "corrections_locales" ADD CONSTRAINT "corrections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."corrections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "error_reports" ADD CONSTRAINT "error_reports_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_author_profile_id_authors_id_fk" FOREIGN KEY ("author_profile_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sections_fk" FOREIGN KEY ("sections_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rubrics_fk" FOREIGN KEY ("rubrics_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_check_requests_fk" FOREIGN KEY ("check_requests_id") REFERENCES "public"."check_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_evidence_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_request_files_fk" FOREIGN KEY ("request_files_id") REFERENCES "public"."request_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_corrections_fk" FOREIGN KEY ("corrections_id") REFERENCES "public"."corrections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_error_reports_fk" FOREIGN KEY ("error_reports_id") REFERENCES "public"."error_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks" ADD CONSTRAINT "homepage_blocks_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks" ADD CONSTRAINT "homepage_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_id_materials_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_blocks" ADD CONSTRAINT "_homepage_v_version_blocks_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_blocks" ADD CONSTRAINT "_homepage_v_version_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_id_materials_id_fk" FOREIGN KEY ("version_hero_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_materials_fk" FOREIGN KEY ("materials_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "materials_check_criteria_order_idx" ON "materials_check_criteria" USING btree ("_order");
  CREATE INDEX "materials_check_criteria_parent_id_idx" ON "materials_check_criteria" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "materials_check_criteria_locales_locale_parent_id_unique" ON "materials_check_criteria_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "materials_check_criteria_locales_parent_id_idx" ON "materials_check_criteria_locales" USING btree ("_parent_id");
  CREATE INDEX "materials_check_verdict_history_order_idx" ON "materials_check_verdict_history" USING btree ("_order");
  CREATE INDEX "materials_check_verdict_history_parent_id_idx" ON "materials_check_verdict_history" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "materials_check_verdict_history_locales_locale_parent_id_uni" ON "materials_check_verdict_history_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "materials_check_verdict_history_locales_parent_id_idx" ON "materials_check_verdict_history_locales" USING btree ("_parent_id");
  CREATE INDEX "materials_digest_items_order_idx" ON "materials_digest_items" USING btree ("_order");
  CREATE INDEX "materials_digest_items_parent_id_idx" ON "materials_digest_items" USING btree ("_parent_id");
  CREATE INDEX "materials_digest_items_material_idx" ON "materials_digest_items" USING btree ("material_id");
  CREATE UNIQUE INDEX "materials_digest_items_locales_locale_parent_id_unique" ON "materials_digest_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "materials_digest_items_locales_parent_id_idx" ON "materials_digest_items_locales" USING btree ("_parent_id");
  CREATE INDEX "materials_audience_order_idx" ON "materials_audience" USING btree ("order");
  CREATE INDEX "materials_audience_parent_idx" ON "materials_audience" USING btree ("parent_id");
  CREATE INDEX "materials_sources_order_idx" ON "materials_sources" USING btree ("_order");
  CREATE INDEX "materials_sources_parent_id_idx" ON "materials_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "materials_sources_locales_locale_parent_id_unique" ON "materials_sources_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "materials_sources_locales_parent_id_idx" ON "materials_sources_locales" USING btree ("_parent_id");
  CREATE INDEX "materials_previous_paths_order_idx" ON "materials_previous_paths" USING btree ("_order");
  CREATE INDEX "materials_previous_paths_parent_id_idx" ON "materials_previous_paths" USING btree ("_parent_id");
  CREATE INDEX "materials_status_idx" ON "materials" USING btree ("status");
  CREATE INDEX "materials_published_at_idx" ON "materials" USING btree ("published_at");
  CREATE INDEX "materials_format_idx" ON "materials" USING btree ("format");
  CREATE INDEX "materials_created_by_idx" ON "materials" USING btree ("created_by_id");
  CREATE INDEX "materials_cover_idx" ON "materials" USING btree ("cover_id");
  CREATE INDEX "materials_check_subject_check_subject_company_idx" ON "materials" USING btree ("check_subject_company_id");
  CREATE INDEX "materials_interviewee_interviewee_photo_idx" ON "materials" USING btree ("interviewee_photo_id");
  CREATE INDEX "materials_section_idx" ON "materials" USING btree ("section_id");
  CREATE INDEX "materials_rubric_idx" ON "materials" USING btree ("rubric_id");
  CREATE INDEX "materials_seo_seo_image_idx" ON "materials" USING btree ("seo_image_id");
  CREATE INDEX "materials_updated_at_idx" ON "materials" USING btree ("updated_at");
  CREATE INDEX "materials_created_at_idx" ON "materials" USING btree ("created_at");
  CREATE INDEX "materials_slug_idx" ON "materials_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "materials_locales_locale_parent_id_unique" ON "materials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "materials_locales_parent_id_idx" ON "materials_locales" USING btree ("_parent_id");
  CREATE INDEX "materials_rels_order_idx" ON "materials_rels" USING btree ("order");
  CREATE INDEX "materials_rels_parent_idx" ON "materials_rels" USING btree ("parent_id");
  CREATE INDEX "materials_rels_path_idx" ON "materials_rels" USING btree ("path");
  CREATE INDEX "materials_rels_authors_id_idx" ON "materials_rels" USING btree ("authors_id");
  CREATE INDEX "materials_rels_evidence_id_idx" ON "materials_rels" USING btree ("evidence_id");
  CREATE INDEX "materials_rels_regions_id_idx" ON "materials_rels" USING btree ("regions_id");
  CREATE INDEX "materials_rels_companies_id_idx" ON "materials_rels" USING btree ("companies_id");
  CREATE INDEX "materials_rels_tags_id_idx" ON "materials_rels" USING btree ("tags_id");
  CREATE INDEX "materials_rels_materials_id_idx" ON "materials_rels" USING btree ("materials_id");
  CREATE INDEX "_materials_v_version_check_criteria_order_idx" ON "_materials_v_version_check_criteria" USING btree ("_order");
  CREATE INDEX "_materials_v_version_check_criteria_parent_id_idx" ON "_materials_v_version_check_criteria" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_materials_v_version_check_criteria_locales_locale_parent_id" ON "_materials_v_version_check_criteria_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_materials_v_version_check_criteria_locales_parent_id_idx" ON "_materials_v_version_check_criteria_locales" USING btree ("_parent_id");
  CREATE INDEX "_materials_v_version_check_verdict_history_order_idx" ON "_materials_v_version_check_verdict_history" USING btree ("_order");
  CREATE INDEX "_materials_v_version_check_verdict_history_parent_id_idx" ON "_materials_v_version_check_verdict_history" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_materials_v_version_check_verdict_history_locales_locale_pa" ON "_materials_v_version_check_verdict_history_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_materials_v_version_check_verdict_history_locales_paren_idx" ON "_materials_v_version_check_verdict_history_locales" USING btree ("_parent_id");
  CREATE INDEX "_materials_v_version_digest_items_order_idx" ON "_materials_v_version_digest_items" USING btree ("_order");
  CREATE INDEX "_materials_v_version_digest_items_parent_id_idx" ON "_materials_v_version_digest_items" USING btree ("_parent_id");
  CREATE INDEX "_materials_v_version_digest_items_material_idx" ON "_materials_v_version_digest_items" USING btree ("material_id");
  CREATE UNIQUE INDEX "_materials_v_version_digest_items_locales_locale_parent_id_u" ON "_materials_v_version_digest_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_materials_v_version_digest_items_locales_parent_id_idx" ON "_materials_v_version_digest_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_materials_v_version_audience_order_idx" ON "_materials_v_version_audience" USING btree ("order");
  CREATE INDEX "_materials_v_version_audience_parent_idx" ON "_materials_v_version_audience" USING btree ("parent_id");
  CREATE INDEX "_materials_v_version_sources_order_idx" ON "_materials_v_version_sources" USING btree ("_order");
  CREATE INDEX "_materials_v_version_sources_parent_id_idx" ON "_materials_v_version_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_materials_v_version_sources_locales_locale_parent_id_unique" ON "_materials_v_version_sources_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_materials_v_version_sources_locales_parent_id_idx" ON "_materials_v_version_sources_locales" USING btree ("_parent_id");
  CREATE INDEX "_materials_v_version_previous_paths_order_idx" ON "_materials_v_version_previous_paths" USING btree ("_order");
  CREATE INDEX "_materials_v_version_previous_paths_parent_id_idx" ON "_materials_v_version_previous_paths" USING btree ("_parent_id");
  CREATE INDEX "_materials_v_parent_idx" ON "_materials_v" USING btree ("parent_id");
  CREATE INDEX "_materials_v_version_version_status_idx" ON "_materials_v" USING btree ("version_status");
  CREATE INDEX "_materials_v_version_version_published_at_idx" ON "_materials_v" USING btree ("version_published_at");
  CREATE INDEX "_materials_v_version_version_format_idx" ON "_materials_v" USING btree ("version_format");
  CREATE INDEX "_materials_v_version_version_created_by_idx" ON "_materials_v" USING btree ("version_created_by_id");
  CREATE INDEX "_materials_v_version_version_cover_idx" ON "_materials_v" USING btree ("version_cover_id");
  CREATE INDEX "_materials_v_version_check_subject_version_check_subject_idx" ON "_materials_v" USING btree ("version_check_subject_company_id");
  CREATE INDEX "_materials_v_version_interviewee_version_interviewee_pho_idx" ON "_materials_v" USING btree ("version_interviewee_photo_id");
  CREATE INDEX "_materials_v_version_version_section_idx" ON "_materials_v" USING btree ("version_section_id");
  CREATE INDEX "_materials_v_version_version_rubric_idx" ON "_materials_v" USING btree ("version_rubric_id");
  CREATE INDEX "_materials_v_version_seo_version_seo_image_idx" ON "_materials_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_materials_v_version_version_updated_at_idx" ON "_materials_v" USING btree ("version_updated_at");
  CREATE INDEX "_materials_v_version_version_created_at_idx" ON "_materials_v" USING btree ("version_created_at");
  CREATE INDEX "_materials_v_created_at_idx" ON "_materials_v" USING btree ("created_at");
  CREATE INDEX "_materials_v_updated_at_idx" ON "_materials_v" USING btree ("updated_at");
  CREATE INDEX "_materials_v_version_version_slug_idx" ON "_materials_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_materials_v_locales_locale_parent_id_unique" ON "_materials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_materials_v_locales_parent_id_idx" ON "_materials_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_materials_v_rels_order_idx" ON "_materials_v_rels" USING btree ("order");
  CREATE INDEX "_materials_v_rels_parent_idx" ON "_materials_v_rels" USING btree ("parent_id");
  CREATE INDEX "_materials_v_rels_path_idx" ON "_materials_v_rels" USING btree ("path");
  CREATE INDEX "_materials_v_rels_authors_id_idx" ON "_materials_v_rels" USING btree ("authors_id");
  CREATE INDEX "_materials_v_rels_evidence_id_idx" ON "_materials_v_rels" USING btree ("evidence_id");
  CREATE INDEX "_materials_v_rels_regions_id_idx" ON "_materials_v_rels" USING btree ("regions_id");
  CREATE INDEX "_materials_v_rels_companies_id_idx" ON "_materials_v_rels" USING btree ("companies_id");
  CREATE INDEX "_materials_v_rels_tags_id_idx" ON "_materials_v_rels" USING btree ("tags_id");
  CREATE INDEX "_materials_v_rels_materials_id_idx" ON "_materials_v_rels" USING btree ("materials_id");
  CREATE INDEX "authors_socials_order_idx" ON "authors_socials" USING btree ("_order");
  CREATE INDEX "authors_socials_parent_id_idx" ON "authors_socials" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_photo_idx" ON "authors" USING btree ("photo_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "authors_locales_locale_parent_id_unique" ON "authors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "authors_locales_parent_id_idx" ON "authors_locales" USING btree ("_parent_id");
  CREATE INDEX "authors_texts_order_parent" ON "authors_texts" USING btree ("order","parent_id");
  CREATE INDEX "authors_texts_locale_parent" ON "authors_texts" USING btree ("locale","parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sections_slug_idx" ON "sections" USING btree ("slug");
  CREATE INDEX "sections_updated_at_idx" ON "sections" USING btree ("updated_at");
  CREATE INDEX "sections_created_at_idx" ON "sections" USING btree ("created_at");
  CREATE UNIQUE INDEX "sections_locales_locale_parent_id_unique" ON "sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sections_locales_parent_id_idx" ON "sections_locales" USING btree ("_parent_id");
  CREATE INDEX "rubrics_slug_idx" ON "rubrics" USING btree ("slug");
  CREATE INDEX "rubrics_section_idx" ON "rubrics" USING btree ("section_id");
  CREATE INDEX "rubrics_updated_at_idx" ON "rubrics" USING btree ("updated_at");
  CREATE INDEX "rubrics_created_at_idx" ON "rubrics" USING btree ("created_at");
  CREATE UNIQUE INDEX "rubrics_locales_locale_parent_id_unique" ON "rubrics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rubrics_locales_parent_id_idx" ON "rubrics_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_locales_locale_parent_id_unique" ON "tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tags_locales_parent_id_idx" ON "tags_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "regions_slug_idx" ON "regions" USING btree ("slug");
  CREATE INDEX "regions_parent_idx" ON "regions" USING btree ("parent_id");
  CREATE INDEX "regions_updated_at_idx" ON "regions" USING btree ("updated_at");
  CREATE INDEX "regions_created_at_idx" ON "regions" USING btree ("created_at");
  CREATE UNIQUE INDEX "regions_locales_locale_parent_id_unique" ON "regions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "regions_locales_parent_id_idx" ON "regions_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "companies_slug_idx" ON "companies" USING btree ("slug");
  CREATE INDEX "companies_edrpou_idx" ON "companies" USING btree ("edrpou");
  CREATE INDEX "companies_country_idx" ON "companies" USING btree ("country_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE UNIQUE INDEX "companies_locales_locale_parent_id_unique" ON "companies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "companies_locales_parent_id_idx" ON "companies_locales" USING btree ("_parent_id");
  CREATE INDEX "check_requests_assignee_idx" ON "check_requests" USING btree ("assignee_id");
  CREATE INDEX "check_requests_company_idx" ON "check_requests" USING btree ("company_id");
  CREATE INDEX "check_requests_result_material_idx" ON "check_requests" USING btree ("result_material_id");
  CREATE INDEX "check_requests_updated_at_idx" ON "check_requests" USING btree ("updated_at");
  CREATE INDEX "check_requests_created_at_idx" ON "check_requests" USING btree ("created_at");
  CREATE INDEX "check_requests_rels_order_idx" ON "check_requests_rels" USING btree ("order");
  CREATE INDEX "check_requests_rels_parent_idx" ON "check_requests_rels" USING btree ("parent_id");
  CREATE INDEX "check_requests_rels_path_idx" ON "check_requests_rels" USING btree ("path");
  CREATE INDEX "check_requests_rels_request_files_id_idx" ON "check_requests_rels" USING btree ("request_files_id");
  CREATE INDEX "evidence_company_idx" ON "evidence" USING btree ("company_id");
  CREATE INDEX "evidence_updated_at_idx" ON "evidence" USING btree ("updated_at");
  CREATE INDEX "evidence_created_at_idx" ON "evidence" USING btree ("created_at");
  CREATE UNIQUE INDEX "evidence_filename_idx" ON "evidence" USING btree ("filename");
  CREATE INDEX "request_files_updated_at_idx" ON "request_files" USING btree ("updated_at");
  CREATE INDEX "request_files_created_at_idx" ON "request_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "request_files_filename_idx" ON "request_files" USING btree ("filename");
  CREATE INDEX "corrections_material_idx" ON "corrections" USING btree ("material_id");
  CREATE INDEX "corrections_error_report_idx" ON "corrections" USING btree ("error_report_id");
  CREATE INDEX "corrections_updated_at_idx" ON "corrections" USING btree ("updated_at");
  CREATE INDEX "corrections_created_at_idx" ON "corrections" USING btree ("created_at");
  CREATE UNIQUE INDEX "corrections_locales_locale_parent_id_unique" ON "corrections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "corrections_locales_parent_id_idx" ON "corrections_locales" USING btree ("_parent_id");
  CREATE INDEX "error_reports_material_idx" ON "error_reports" USING btree ("material_id");
  CREATE INDEX "error_reports_updated_at_idx" ON "error_reports" USING btree ("updated_at");
  CREATE INDEX "error_reports_created_at_idx" ON "error_reports" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_author_profile_idx" ON "users" USING btree ("author_profile_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "audit_log_user_idx" ON "audit_log" USING btree ("user_id");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_materials_id_idx" ON "payload_locked_documents_rels" USING btree ("materials_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("sections_id");
  CREATE INDEX "payload_locked_documents_rels_rubrics_id_idx" ON "payload_locked_documents_rels" USING btree ("rubrics_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_regions_id_idx" ON "payload_locked_documents_rels" USING btree ("regions_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_check_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("check_requests_id");
  CREATE INDEX "payload_locked_documents_rels_evidence_id_idx" ON "payload_locked_documents_rels" USING btree ("evidence_id");
  CREATE INDEX "payload_locked_documents_rels_request_files_id_idx" ON "payload_locked_documents_rels" USING btree ("request_files_id");
  CREATE INDEX "payload_locked_documents_rels_corrections_id_idx" ON "payload_locked_documents_rels" USING btree ("corrections_id");
  CREATE INDEX "payload_locked_documents_rels_error_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("error_reports_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_blocks_order_idx" ON "homepage_blocks" USING btree ("_order");
  CREATE INDEX "homepage_blocks_parent_id_idx" ON "homepage_blocks" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_section_idx" ON "homepage_blocks" USING btree ("section_id");
  CREATE INDEX "homepage_hero_idx" ON "homepage" USING btree ("hero_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_materials_id_idx" ON "homepage_rels" USING btree ("materials_id");
  CREATE INDEX "_homepage_v_version_blocks_order_idx" ON "_homepage_v_version_blocks" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_blocks_parent_id_idx" ON "_homepage_v_version_blocks" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_blocks_section_idx" ON "_homepage_v_version_blocks" USING btree ("section_id");
  CREATE INDEX "_homepage_v_version_version_hero_idx" ON "_homepage_v" USING btree ("version_hero_id");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_materials_id_idx" ON "_homepage_v_rels" USING btree ("materials_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "materials_check_criteria" CASCADE;
  DROP TABLE "materials_check_criteria_locales" CASCADE;
  DROP TABLE "materials_check_verdict_history" CASCADE;
  DROP TABLE "materials_check_verdict_history_locales" CASCADE;
  DROP TABLE "materials_digest_items" CASCADE;
  DROP TABLE "materials_digest_items_locales" CASCADE;
  DROP TABLE "materials_audience" CASCADE;
  DROP TABLE "materials_sources" CASCADE;
  DROP TABLE "materials_sources_locales" CASCADE;
  DROP TABLE "materials_previous_paths" CASCADE;
  DROP TABLE "materials" CASCADE;
  DROP TABLE "materials_locales" CASCADE;
  DROP TABLE "materials_rels" CASCADE;
  DROP TABLE "_materials_v_version_check_criteria" CASCADE;
  DROP TABLE "_materials_v_version_check_criteria_locales" CASCADE;
  DROP TABLE "_materials_v_version_check_verdict_history" CASCADE;
  DROP TABLE "_materials_v_version_check_verdict_history_locales" CASCADE;
  DROP TABLE "_materials_v_version_digest_items" CASCADE;
  DROP TABLE "_materials_v_version_digest_items_locales" CASCADE;
  DROP TABLE "_materials_v_version_audience" CASCADE;
  DROP TABLE "_materials_v_version_sources" CASCADE;
  DROP TABLE "_materials_v_version_sources_locales" CASCADE;
  DROP TABLE "_materials_v_version_previous_paths" CASCADE;
  DROP TABLE "_materials_v" CASCADE;
  DROP TABLE "_materials_v_locales" CASCADE;
  DROP TABLE "_materials_v_rels" CASCADE;
  DROP TABLE "authors_socials" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "authors_locales" CASCADE;
  DROP TABLE "authors_texts" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "sections" CASCADE;
  DROP TABLE "sections_locales" CASCADE;
  DROP TABLE "rubrics" CASCADE;
  DROP TABLE "rubrics_locales" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "tags_locales" CASCADE;
  DROP TABLE "regions" CASCADE;
  DROP TABLE "regions_locales" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "companies_locales" CASCADE;
  DROP TABLE "check_requests" CASCADE;
  DROP TABLE "check_requests_rels" CASCADE;
  DROP TABLE "evidence" CASCADE;
  DROP TABLE "request_files" CASCADE;
  DROP TABLE "corrections" CASCADE;
  DROP TABLE "corrections_locales" CASCADE;
  DROP TABLE "error_reports" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_blocks" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_version_blocks" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_materials_check_criteria_criterion";
  DROP TYPE "public"."enum_materials_check_criteria_status";
  DROP TYPE "public"."enum_materials_check_verdict_history_verdict";
  DROP TYPE "public"."enum_materials_audience";
  DROP TYPE "public"."enum_materials_status";
  DROP TYPE "public"."enum_materials_format";
  DROP TYPE "public"."enum_materials_sponsorship_label";
  DROP TYPE "public"."enum_materials_check_verdict";
  DROP TYPE "public"."enum_materials_check_right_of_reply_outcome";
  DROP TYPE "public"."enum__materials_v_version_check_criteria_criterion";
  DROP TYPE "public"."enum__materials_v_version_check_criteria_status";
  DROP TYPE "public"."enum__materials_v_version_check_verdict_history_verdict";
  DROP TYPE "public"."enum__materials_v_version_audience";
  DROP TYPE "public"."enum__materials_v_version_status";
  DROP TYPE "public"."enum__materials_v_version_format";
  DROP TYPE "public"."enum__materials_v_version_sponsorship_label";
  DROP TYPE "public"."enum__materials_v_version_check_verdict";
  DROP TYPE "public"."enum__materials_v_version_check_right_of_reply_outcome";
  DROP TYPE "public"."enum_authors_socials_network";
  DROP TYPE "public"."enum_media_license";
  DROP TYPE "public"."enum_tags_kind";
  DROP TYPE "public"."enum_regions_kind";
  DROP TYPE "public"."enum_check_requests_status";
  DROP TYPE "public"."enum_check_requests_locale";
  DROP TYPE "public"."enum_error_reports_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_audit_log_action";
  DROP TYPE "public"."enum_homepage_blocks_kind";
  DROP TYPE "public"."enum__homepage_v_version_blocks_kind";`)
}
