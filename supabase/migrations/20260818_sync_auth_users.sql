-- Migration: 20260818_sync_auth_users.sql
-- Description: Sync seeded users in public.users to Supabase auth.users and auth.identities schema

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Function to sync public.users to auth.users and auth.identities
DO $$
DECLARE
    u RECORD;
    v_encrypted_pw TEXT;
BEGIN
    FOR u IN SELECT * FROM public.users LOOP
        IF u.email IS NOT NULL AND u.password_hash IS NOT NULL THEN
            v_encrypted_pw := extensions.crypt(u.password_hash, extensions.gen_salt('bf'));
            
            -- Insert into auth.users if email does not exist
            IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = u.email) THEN
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
                    updated_at
                ) VALUES (
                    u.id,
                    '00000000-0000-0000-0000-000000000000',
                    'authenticated',
                    'authenticated',
                    u.email,
                    v_encrypted_pw,
                    NOW(),
                    '{"provider": "email", "providers": ["email"]}'::jsonb,
                    jsonb_build_object('role', u.role, 'nama_lengkap', COALESCE(u.nama_lengkap, u.email)),
                    COALESCE(u.created_at, NOW()),
                    COALESCE(u.updated_at, NOW())
                );
                
                -- Insert into auth.identities
                INSERT INTO auth.identities (
                    id,
                    user_id,
                    identity_data,
                    provider,
                    provider_id,
                    last_sign_in_at,
                    created_at,
                    updated_at
                ) VALUES (
                    gen_random_uuid(),
                    u.id,
                    jsonb_build_object('sub', u.id::text, 'email', u.email),
                    'email',
                    u.email,
                    NOW(),
                    COALESCE(u.created_at, NOW()),
                    COALESCE(u.updated_at, NOW())
                );
            ELSE
                -- Update encrypted password and user metadata if auth user already exists
                UPDATE auth.users
                SET encrypted_password = v_encrypted_pw,
                    raw_user_meta_data = jsonb_build_object('role', u.role, 'nama_lengkap', COALESCE(u.nama_lengkap, u.email)),
                    updated_at = NOW()
                WHERE email = u.email;
            END IF;
        END IF;
    END LOOP;
END $$;

COMMIT;
