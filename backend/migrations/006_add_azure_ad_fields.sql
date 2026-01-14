/*
  # Add Azure AD SSO fields to users table

  1. Changes to Tables
    - `users`
      - Add `azure_ad_id` (text, unique, nullable) - Azure AD object ID (oid)
      - Add `department` (text, nullable) - User's department from Azure AD
      - Add `is_sso_user` (boolean, default false) - Flag to identify SSO users
      - Modify `password` to be nullable (SSO users don't have passwords)

  2. Important Notes
    - Azure AD ID is unique when present
    - SSO users will have azure_ad_id populated
    - Traditional users will continue using email/password
    - Department is auto-populated from Azure AD claims
    - Password is now nullable to support SSO-only users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'azure_ad_id'
  ) THEN
    ALTER TABLE users ADD COLUMN azure_ad_id text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'department'
  ) THEN
    ALTER TABLE users ADD COLUMN department text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_sso_user'
  ) THEN
    ALTER TABLE users ADD COLUMN is_sso_user boolean DEFAULT false;
  END IF;
END $$;

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
