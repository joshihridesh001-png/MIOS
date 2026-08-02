-- ============================================================
-- 002_create_ceo_user.sql
-- Creates default CEO@Hridesh account with role = 'ceo'
-- Compatible with Supabase GoTrue Auth
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 0. Clean up any existing broken auth attempts
DELETE FROM auth.identities WHERE user_id = '11111111-1111-1111-1111-111111111111' OR identity_data->>'email' ILIKE '%ceo@hridesh%';
DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111' OR email ILIKE '%ceo@hridesh%';
DELETE FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- 1. Create user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'authenticated',
  'authenticated',
  'ceo@hridesh.co',
  crypt('SaSokKWqkpobCPAE', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Hridesh","role":"ceo"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 2. Create identity in auth.identities (NOTE: provider_id MUST be the user ID in Supabase GoTrue)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"ceo@hridesh.co","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  '11111111-1111-1111-1111-111111111111',
  now(),
  now(),
  now()
);

-- 3. Set CEO role in public.profiles
INSERT INTO public.profiles (id, full_name, role)
VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'Hridesh', 'ceo')
ON CONFLICT (id) DO UPDATE
SET full_name = 'Hridesh',
    role = 'ceo';
