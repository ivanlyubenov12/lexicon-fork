-- ═══════════════════════════════════════════════════════════════════════════
-- SETUP: Демо модератор за seed данните
-- Изпълни ПЪРВО, преди останалите seed файлове.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@lexicon.bg',
  '$2a$10$placeholder_not_real_password_hash_xxxxxxxxxxxxx',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;
