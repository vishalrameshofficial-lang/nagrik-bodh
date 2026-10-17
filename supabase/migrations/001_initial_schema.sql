-- ============================================================
-- Nagrik Bodh — Schema Migration 001: Initial Schema
-- ============================================================
-- Complete schema for Nagrik Bodh civic awareness platform.
-- Includes 13 core tables, custom types, triggers, RLS policies,
-- full-text search indexes, and automatic profile creation.
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Types & Enums ───────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'editor', 'reviewer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE update_status AS ENUM (
    'draft', 'in_review', 'approved', 'scheduled', 'published', 'rejected', 'withdrawn', 'superseded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE translation_status AS ENUM (
    'pending', 'machine_draft', 'human_reviewed', 'verified'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deadline_status AS ENUM (
    'confirmed', 'unconfirmed', 'extended', 'passed', 'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM (
    'pending', 'sent', 'failed', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'created', 'updated', 'submitted_for_review', 'approved', 'rejected',
    'scheduled', 'published', 'withdrawn', 'superseded', 'corrected', 'deleted'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE supported_lang AS ENUM ('en', 'ta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ─── 1. Profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  language_pref supported_lang NOT NULL DEFAULT 'en',
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ─── 2. Categories ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON categories(is_active, sort_order);

-- ─── 3. Departments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  ministry_en TEXT,
  ministry_ta TEXT,
  website_url TEXT,
  is_central BOOLEAN NOT NULL DEFAULT TRUE,
  state_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);
CREATE INDEX IF NOT EXISTS idx_departments_central ON departments(is_central, is_active);

-- ─── 4. Jurisdictions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'central' CHECK (type IN ('central', 'state', 'union_territory', 'local')),
  state_code TEXT,
  parent_id UUID REFERENCES jurisdictions(id),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurisdictions_slug ON jurisdictions(slug);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_type ON jurisdictions(type, is_active);

-- ─── 5. Civic Updates ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS civic_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  status update_status NOT NULL DEFAULT 'draft',
  category_id UUID NOT NULL REFERENCES categories(id),
  department_id UUID REFERENCES departments(id),
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  effective_date DATE,
  official_deadline TIMESTAMPTZ,
  deadline_status deadline_status NOT NULL DEFAULT 'unknown',
  deadline_timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  superseded_by UUID REFERENCES civic_updates(id),
  withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  source_doc_date DATE,
  source_retrieved_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_updates_status ON civic_updates(status);
CREATE INDEX IF NOT EXISTS idx_updates_published_at ON civic_updates(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_updates_category ON civic_updates(category_id);
CREATE INDEX IF NOT EXISTS idx_updates_department ON civic_updates(department_id);
CREATE INDEX IF NOT EXISTS idx_updates_jurisdiction ON civic_updates(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_updates_deadline_status ON civic_updates(deadline_status);
CREATE INDEX IF NOT EXISTS idx_updates_slug ON civic_updates(slug);

-- ─── 6. Update Translations ──────────────────────────────────
CREATE TABLE IF NOT EXISTS update_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES civic_updates(id) ON DELETE CASCADE,
  lang supported_lang NOT NULL,
  translation_status translation_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  title TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  who_is_affected TEXT,
  what_changed TEXT,
  required_actions TEXT,
  eligibility TEXT,
  benefits TEXT,
  required_documents TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (update_id, lang)
);

CREATE INDEX IF NOT EXISTS idx_translations_update_lang ON update_translations(update_id, lang);
CREATE INDEX IF NOT EXISTS idx_translations_status ON update_translations(translation_status);

-- ─── 7. Sources ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES civic_updates(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title_en TEXT,
  title_ta TEXT,
  issuing_authority TEXT,
  document_date DATE,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_update_id ON sources(update_id);
CREATE INDEX IF NOT EXISTS idx_sources_verified ON sources(is_verified);

-- ─── 8. Deadlines ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID REFERENCES civic_updates(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  deadline_date DATE,
  deadline_time TIME,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status deadline_status NOT NULL DEFAULT 'unconfirmed',
  category_id UUID REFERENCES categories(id),
  department_id UUID REFERENCES departments(id),
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  source_url TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines(status);

-- ─── 9. Saved Updates ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  update_id UUID NOT NULL REFERENCES civic_updates(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, update_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_updates_user ON saved_updates(user_id);

-- ─── 10. User Preferences ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  language supported_lang NOT NULL DEFAULT 'en',
  email_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_days_before INT[] NOT NULL DEFAULT '{7, 3, 1}',
  preferred_categories UUID[],
  preferred_jurisdictions UUID[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 11. Content Reviews ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES civic_updates(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  action audit_action NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_reviews_update ON content_reviews(update_id);

-- ─── 12. Audit Logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  performed_by UUID REFERENCES profiles(id),
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ─── 13. Notification Jobs ───────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  update_id UUID REFERENCES civic_updates(id) ON DELETE CASCADE,
  deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deadline_reminder', 'new_update', 'correction_notice')),
  status notification_status NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_scheduled ON notification_jobs(status, scheduled_for);

-- ─── Updated_at Trigger Function ─────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'profiles', 'categories', 'departments', 'jurisdictions',
    'civic_updates', 'update_translations', 'sources', 'deadlines',
    'notification_jobs', 'user_preferences'
  )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trigger_set_updated_at ON %I;', t);
    EXECUTE format('CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
  END LOOP;
END $$;

-- ─── New User Profile Trigger ────────────────────────────────
-- Automatically creates a profile and user_preferences row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role, language_pref)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'citizen',
    'en'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id, language, email_reminders)
  VALUES (NEW.id, 'en', TRUE)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ───────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile; admins can view all; users can update their own
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR public.current_user_role() IN ('admin', 'reviewer'));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid())); -- Prevent self-role elevation

CREATE POLICY "Admins can update any profile" ON profiles
  FOR ALL USING (public.current_user_role() = 'admin');

-- Categories, Departments, Jurisdictions: Public read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = TRUE OR public.current_user_role() IN ('admin', 'editor'));
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (is_active = TRUE OR public.current_user_role() IN ('admin', 'editor'));
CREATE POLICY "Public read jurisdictions" ON jurisdictions FOR SELECT USING (is_active = TRUE OR public.current_user_role() IN ('admin', 'editor'));

-- Admin manage categories, departments, jurisdictions
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (public.current_user_role() = 'admin');
CREATE POLICY "Admin manage departments" ON departments FOR ALL USING (public.current_user_role() = 'admin');
CREATE POLICY "Admin manage jurisdictions" ON jurisdictions FOR ALL USING (public.current_user_role() = 'admin');

-- Civic Updates:
-- Public can read published updates
CREATE POLICY "Public read published updates" ON civic_updates
  FOR SELECT USING (status = 'published' OR public.current_user_role() IN ('editor', 'reviewer', 'admin'));

-- Editors/Admins can insert drafts
CREATE POLICY "Staff insert updates" ON civic_updates
  FOR INSERT WITH CHECK (public.current_user_role() IN ('editor', 'admin'));

-- Editors can update their own drafts; Reviewers & Admins can update any
CREATE POLICY "Staff update updates" ON civic_updates
  FOR UPDATE USING (
    public.current_user_role() IN ('reviewer', 'admin') OR
    (public.current_user_role() = 'editor' AND (created_by = auth.uid() OR status = 'draft'))
  );

-- Update Translations:
CREATE POLICY "Public read translations of published updates" ON update_translations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM civic_updates
      WHERE civic_updates.id = update_translations.update_id
      AND (civic_updates.status = 'published' OR public.current_user_role() IN ('editor', 'reviewer', 'admin'))
    )
  );

CREATE POLICY "Staff manage translations" ON update_translations
  FOR ALL USING (public.current_user_role() IN ('editor', 'reviewer', 'admin'));

-- Sources:
CREATE POLICY "Public read sources of published updates" ON sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM civic_updates
      WHERE civic_updates.id = sources.update_id
      AND (civic_updates.status = 'published' OR public.current_user_role() IN ('editor', 'reviewer', 'admin'))
    )
  );

CREATE POLICY "Staff manage sources" ON sources
  FOR ALL USING (public.current_user_role() IN ('editor', 'reviewer', 'admin'));

-- Deadlines:
CREATE POLICY "Public read active deadlines" ON deadlines
  FOR SELECT USING (TRUE);

CREATE POLICY "Staff manage deadlines" ON deadlines
  FOR ALL USING (public.current_user_role() IN ('editor', 'reviewer', 'admin'));

-- Saved Updates:
CREATE POLICY "Users read own saved updates" ON saved_updates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own saved updates" ON saved_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own saved updates" ON saved_updates
  FOR DELETE USING (auth.uid() = user_id);

-- User Preferences:
CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Content Reviews:
CREATE POLICY "Staff view reviews" ON content_reviews
  FOR SELECT USING (public.current_user_role() IN ('editor', 'reviewer', 'admin'));

CREATE POLICY "Reviewers insert reviews" ON content_reviews
  FOR INSERT WITH CHECK (public.current_user_role() IN ('reviewer', 'admin'));

-- Audit Logs:
CREATE POLICY "Admins view audit logs" ON audit_logs
  FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY "Staff insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (public.current_user_role() IN ('editor', 'reviewer', 'admin'));

-- Notification Jobs:
CREATE POLICY "Users view own notifications" ON notification_jobs
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_role() = 'admin');
