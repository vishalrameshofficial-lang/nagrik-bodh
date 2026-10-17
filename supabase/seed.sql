-- ============================================================
-- Nagrik Bodh — Demo Seed Data
-- ============================================================
-- WARNING: These are DEMONSTRATION records only.
-- They must be replaced with manually verified official content
-- before public launch. All records are marked is_demo = TRUE.
-- Run: psql $SUPABASE_DB_URL -f supabase/seed.sql
-- ============================================================

-- ─── Reference data ─────────────────────────────────────────

INSERT INTO categories (id, slug, name_en, name_ta, description_en, description_ta, icon, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'government-schemes', 'Government Schemes', 'அரசாங்க திட்டங்கள்', 'Welfare schemes, subsidies and entitlement programmes', 'நலத் திட்டங்கள், மானியங்கள் மற்றும் உரிமை திட்டங்கள்', 'Landmark', 1),
  ('22222222-2222-2222-2222-222222222222', 'rules-regulations', 'New Rules & Regulations', 'புதிய விதிகள் மற்றும் ஒழுங்குமுறைகள்', 'Changes in laws, regulations and compliance requirements', 'சட்டங்கள், ஒழுங்குமுறைகள் மற்றும் இணக்க தேவைகளில் மாற்றங்கள்', 'FileText', 2),
  ('33333333-3333-3333-3333-333333333333', 'tax-compliance', 'Tax & Compliance Deadlines', 'வரி மற்றும் இணக்க காலக்கெடுக்கள்', 'Income tax, GST and other compliance deadlines', 'வருமான வரி, ஜிஎஸ்டி மற்றும் பிற இணக்க காலக்கெடுக்கள்', 'Shield', 3),
  ('44444444-4444-4444-4444-444444444444', 'public-services', 'Public Services', 'பொது சேவைகள்', 'Updates on government services, digital platforms and entitlements', 'அரசாங்க சேவைகள், டிஜிட்டல் தளங்கள் மற்றும் உரிமைகள் பற்றிய புதுப்பிப்புகள்', 'CheckCircle2', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO departments (id, slug, name_en, name_ta, ministry_en, is_central) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'min-finance', 'Ministry of Finance', 'நிதி அமைச்சகம்', 'Ministry of Finance', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cbdt', 'Central Board of Direct Taxes', 'நேரடி வரிகள் மத்திய வாரியம்', 'Ministry of Finance', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'min-labour', 'Ministry of Labour and Employment', 'தொழிலாளர் மற்றும் வேலைவாய்ப்பு அமைச்சகம்', 'Ministry of Labour and Employment', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'meity', 'Ministry of Electronics and IT', 'மின்னணு மற்றும் தகவல் தொழில்நுட்ப அமைச்சகம்', 'Ministry of Electronics and IT', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jurisdictions (id, slug, name_en, name_ta, type, sort_order) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'india', 'All India', 'அகில இந்தியா', 'central', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'tamil-nadu', 'Tamil Nadu', 'தமிழ்நாடு', 'state', 2),
  ('12121212-1212-1212-1212-121212121212', 'maharashtra', 'Maharashtra', 'மகாராஷ்டிரா', 'state', 3)
ON CONFLICT (slug) DO NOTHING;

-- ─── Create system admin profile placeholder ─────────────────
-- Replace '00000000-0000-0000-0000-000000000000' with the actual
-- Supabase auth.users ID of your first admin after running bootstrap.

-- ─── Demo updates ────────────────────────────────────────────

-- We use a DO block because we need to reference a valid profile ID.
-- In production, replace the created_by values with your admin user's ID.

DO $$
DECLARE
  v_admin_id UUID;
  v_update1_id UUID := gen_random_uuid();
  v_update2_id UUID := gen_random_uuid();
  v_update3_id UUID := gen_random_uuid();
  v_update4_id UUID := gen_random_uuid();
BEGIN
  -- Get first admin/editor user (or skip if no users exist yet)
  SELECT id INTO v_admin_id FROM profiles WHERE role IN ('admin', 'editor') LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Run bootstrap-admin.sql first, then re-run seed.sql.';
    RETURN;
  END IF;

  -- ── Demo 1: Government Scheme ──────────────────────────────
  INSERT INTO civic_updates (
    id, slug, status, category_id, department_id, jurisdiction_id,
    is_demo, created_by, reviewed_by, published_at, last_verified_at,
    deadline_status
  ) VALUES (
    v_update1_id,
    'pm-kisan-demo-scheme',
    'published',
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    TRUE,
    v_admin_id, v_admin_id,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    'unknown'
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO update_translations (update_id, lang, translation_status, title, short_summary, who_is_affected, what_changed, required_actions, eligibility, benefits, required_documents, created_by) VALUES
  (v_update1_id, 'en', 'verified',
    '[DEMO] PM-KISAN: Income Support Scheme for Farmers',
    'This is a demonstration record. The PM-KISAN scheme provides income support of ₹6,000 per year to eligible farmer families, paid in three instalments of ₹2,000 each directly to their bank accounts.',
    'Small and marginal farmer families who own cultivable land.',
    'This demonstration record illustrates the Nagrik Bodh format. The scheme details are sourced from the official PM-KISAN portal.',
    'Register on the PM-KISAN portal (pmkisan.gov.in) or visit your nearest Common Service Centre (CSC). Have your Aadhaar number and bank account details ready.',
    'Farmer families with cultivable land. Certain categories including government employees, income taxpayers and professionals are excluded. See the official portal for the complete exclusion list.',
    '₹6,000 per year (₹2,000 × 3 instalments) directly to the farmer''s linked bank account.',
    'Aadhaar card, bank account details (linked to Aadhaar), land ownership documents.',
    v_admin_id
  ),
  (v_update1_id, 'ta', 'verified',
    '[விளக்க பதிவு] பிஎம்-கிசான்: விவசாயிகளுக்கான வருமான ஆதரவு திட்டம்',
    'இது ஒரு விளக்க பதிவு. பிஎம்-கிசான் திட்டம் தகுதியான விவசாயி குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 வருமான ஆதரவை வழங்குகிறது, இது மூன்று தவணைகளில் நேரடியாக வங்கி கணக்குகளுக்கு செலுத்தப்படுகிறது.',
    'சிறு மற்றும் குறுவிவசாயி குடும்பங்கள்.',
    'இந்த விளக்க பதிவு நாகரிக் போத் வடிவமைப்பை விளக்குகிறது.',
    'பிஎம்-கிசான் போர்ட்டலில் (pmkisan.gov.in) பதிவு செய்யுங்கள் அல்லது உங்கள் நெருங்கிய பொது சேவை மையத்தை (CSC) சந்தியுங்கள்.',
    'தகுதியான விவசாயி குடும்பங்கள். விரிவான விலக்கு பட்டியலுக்கு அதிகாரப்பூர்வ போர்ட்டலை பார்க்கவும்.',
    'ஆண்டுக்கு ₹6,000 (₹2,000 × 3 தவணைகள்).',
    'ஆதார் அட்டை, வங்கி கணக்கு விவரங்கள், நில உடைமை ஆவணங்கள்.',
    v_admin_id
  ) ON CONFLICT (update_id, lang) DO NOTHING;

  INSERT INTO sources (update_id, url, title_en, issuing_authority, is_primary, is_verified, verified_by, verified_at, created_by) VALUES
  (v_update1_id, 'https://pmkisan.gov.in/', 'PM-KISAN Official Portal', 'Ministry of Agriculture & Farmers Welfare', TRUE, TRUE, v_admin_id, NOW(), v_admin_id)
  ON CONFLICT DO NOTHING;

  -- ── Demo 2: New Rule ───────────────────────────────────────
  INSERT INTO civic_updates (
    id, slug, status, category_id, department_id, jurisdiction_id,
    is_demo, created_by, reviewed_by, published_at, last_verified_at,
    deadline_status, effective_date
  ) VALUES (
    v_update2_id,
    'pan-aadhaar-link-demo',
    'published',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    TRUE,
    v_admin_id, v_admin_id,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    'unknown',
    '2023-06-30'
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO update_translations (update_id, lang, translation_status, title, short_summary, who_is_affected, what_changed, required_actions, eligibility, created_by) VALUES
  (v_update2_id, 'en', 'verified',
    '[DEMO] PAN-Aadhaar Linking — Demonstration Record',
    'This is a demonstration record illustrating Nagrik Bodh format. PAN-Aadhaar linking was a Central Board of Direct Taxes requirement. The official deadline and current status must be verified directly on the Income Tax e-filing portal.',
    'Individual PAN card holders in India.',
    'This record demonstrates how Nagrik Bodh presents rule-change notifications. Actual details must be verified from the official source.',
    'Visit incometax.gov.in to check the current linking status and any applicable requirements.',
    'Individual PAN holders. Certain categories may be exempt — verify on the official portal.',
    v_admin_id
  ),
  (v_update2_id, 'ta', 'human_reviewed',
    '[விளக்க பதிவு] பான்-ஆதார் இணைத்தல் — விளக்க பதிவு',
    'இது ஒரு விளக்க பதிவு. பான்-ஆதார் இணைத்தல் மத்திய நேரடி வரி வாரிய தேவையாக இருந்தது. தற்போதைய நிலை மற்றும் காலக்கெடுவை வருமான வரி போர்ட்டலில் நேரடியாக சரிபார்க்க வேண்டும்.',
    'இந்தியாவில் தனிநபர் பான் அட்டை வைத்திருப்பவர்கள்.',
    'இந்த பதிவு நாகரிக் போத் வடிவமைப்பை விளக்குகிறது.',
    'incometax.gov.in இல் தற்போதைய இணைத்தல் நிலையை சரிபார்க்கவும்.',
    'தனிநபர் பான் வைத்திருப்பவர்கள்.',
    v_admin_id
  ) ON CONFLICT (update_id, lang) DO NOTHING;

  INSERT INTO sources (update_id, url, title_en, issuing_authority, is_primary, created_by) VALUES
  (v_update2_id, 'https://incometax.gov.in/', 'Income Tax e-Filing Portal', 'Central Board of Direct Taxes', TRUE, v_admin_id)
  ON CONFLICT DO NOTHING;

  -- ── Demo 3: Compliance Deadline ───────────────────────────
  INSERT INTO civic_updates (
    id, slug, status, category_id, department_id, jurisdiction_id,
    is_demo, created_by, reviewed_by, published_at, last_verified_at,
    deadline_status, official_deadline
  ) VALUES (
    v_update3_id,
    'itr-filing-demo',
    'published',
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    TRUE,
    v_admin_id, v_admin_id,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    'unconfirmed',
    '2025-07-31'
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO update_translations (update_id, lang, translation_status, title, short_summary, who_is_affected, what_changed, required_actions, created_by) VALUES
  (v_update3_id, 'en', 'verified',
    '[DEMO] Income Tax Return Filing Deadline — Demonstration Record',
    'This is a demonstration record. The ITR filing deadline is typically 31 July for individuals not requiring audit. The official deadline for any given year must be verified from the Income Tax Department. This record illustrates Nagrik Bodh''s deadline format.',
    'Individual taxpayers, salaried employees and self-employed individuals with taxable income.',
    'This demonstration record shows how Nagrik Bodh presents compliance deadline notifications.',
    'File your Income Tax Return at incometax.gov.in. Verify the current year''s official deadline before filing.',
    v_admin_id
  ),
  (v_update3_id, 'ta', 'pending',
    '[விளக்க பதிவு] வருமான வரி தாக்கல் காலக்கெடு — விளக்க பதிவு',
    'இது ஒரு விளக்க பதிவு. வருமான வரி தாக்கல் காலக்கெடுவை வருமான வரித் துறையிடம் நேரடியாக சரிபார்க்க வேண்டும்.',
    'தனிநபர் வரி செலுத்துவோர்.',
    'இந்த விளக்க பதிவு நாகரிக் போத் வடிவமைப்பை விளக்குகிறது.',
    'incometax.gov.in இல் வருமான வரி தாக்கல் செய்யுங்கள்.',
    v_admin_id
  ) ON CONFLICT (update_id, lang) DO NOTHING;

  INSERT INTO sources (update_id, url, title_en, issuing_authority, is_primary, created_by) VALUES
  (v_update3_id, 'https://incometax.gov.in/', 'Income Tax Department', 'Central Board of Direct Taxes', TRUE, v_admin_id)
  ON CONFLICT DO NOTHING;

  -- ── Demo 4: Public Service ────────────────────────────────
  INSERT INTO civic_updates (
    id, slug, status, category_id, department_id, jurisdiction_id,
    is_demo, created_by, reviewed_by, published_at, last_verified_at,
    deadline_status
  ) VALUES (
    v_update4_id,
    'digilocker-demo',
    'published',
    '44444444-4444-4444-4444-444444444444',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    TRUE,
    v_admin_id, v_admin_id,
    NOW(),
    NOW(),
    'unknown'
  ) ON CONFLICT (slug) DO NOTHING;

  INSERT INTO update_translations (update_id, lang, translation_status, title, short_summary, who_is_affected, what_changed, required_actions, benefits, created_by) VALUES
  (v_update4_id, 'en', 'verified',
    '[DEMO] DigiLocker: Digital Document Storage — Demonstration Record',
    'This is a demonstration record illustrating the public services category. DigiLocker is a government digital locker service for storing and sharing official documents.',
    'All Indian citizens with an Aadhaar number.',
    'This demonstration record illustrates the public services category format on Nagrik Bodh.',
    'Register at digilocker.gov.in using your Aadhaar-linked mobile number.',
    'Store and share official documents digitally. Many documents stored in DigiLocker are legally equivalent to originals for government purposes.',
    v_admin_id
  ),
  (v_update4_id, 'ta', 'human_reviewed',
    '[விளக்க பதிவு] டிஜிலாக்கர்: டிஜிட்டல் ஆவண சேமிப்பகம் — விளக்க பதிவு',
    'இது ஒரு விளக்க பதிவு. டிஜிலாக்கர் என்பது அதிகாரப்பூர்வ ஆவணங்களை சேமிக்கவும் பகிர்ந்துகொள்ளவும் அரசாங்க டிஜிட்டல் லாக்கர் சேவையாகும்.',
    'ஆதார் எண் கொண்ட அனைத்து இந்திய குடிமக்களும்.',
    'இந்த விளக்க பதிவு நாகரிக் போதில் பொது சேவைகள் வகையை விளக்குகிறது.',
    'உங்கள் ஆதார் இணைக்கப்பட்ட மொபைல் எண்ணைப் பயன்படுத்தி digilocker.gov.in இல் பதிவு செய்யுங்கள்.',
    'அதிகாரப்பூர்வ ஆவணங்களை டிஜிட்டலாக சேமித்து பகிருங்கள்.',
    v_admin_id
  ) ON CONFLICT (update_id, lang) DO NOTHING;

  INSERT INTO sources (update_id, url, title_en, issuing_authority, is_primary, created_by) VALUES
  (v_update4_id, 'https://digilocker.gov.in/', 'DigiLocker Official Portal', 'Ministry of Electronics and IT', TRUE, v_admin_id)
  ON CONFLICT DO NOTHING;

  -- ── Demo Deadlines ────────────────────────────────────────
  INSERT INTO deadlines (title_en, title_ta, description_en, description_ta, deadline_date, status, category_id, department_id, jurisdiction_id, source_url, created_by) VALUES
  (
    '[DEMO] ITR Filing Deadline (AY 2025-26) — Unconfirmed',
    '[விளக்க பதிவு] வருமான வரி தாக்கல் காலக்கெடு — உறுதிப்படுத்தப்படவில்லை',
    'Demonstration record. Verify the actual deadline at incometax.gov.in.',
    'விளக்க பதிவு. உண்மையான காலக்கெடுவை incometax.gov.in இல் சரிபார்க்கவும்.',
    '2025-07-31',
    'unconfirmed',
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'https://incometax.gov.in/',
    v_admin_id
  ),
  (
    '[DEMO] GST Annual Return Deadline — Unconfirmed',
    '[விளக்க பதிவு] ஜிஎஸ்டி வருடாந்திர வருமான காலக்கெடு — உறுதிப்படுத்தப்படவில்லை',
    'Demonstration record. Verify the official GST annual return deadline at gst.gov.in.',
    'விளக்க பதிவு. உண்மையான காலக்கெடுவை gst.gov.in இல் சரிபார்க்கவும்.',
    '2025-12-31',
    'unconfirmed',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'https://gst.gov.in/',
    v_admin_id
  );

  RAISE NOTICE 'Seed data inserted successfully for admin user: %', v_admin_id;
END;
$$;
