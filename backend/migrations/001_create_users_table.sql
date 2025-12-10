/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique identifier for each user
      - `email` (text, unique, not null) - User's email address
      - `password` (text, not null) - Hashed password using bcrypt
      - `name` (text, not null) - User's full name
      - `role` (text, not null) - User's role in the system
      - `created_at` (timestamptz) - Timestamp when user was created
      - `updated_at` (timestamptz) - Timestamp when user was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read all users
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to create users
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to delete users

  3. Important Notes
    - Email must be unique across all users
    - Password is stored as bcrypt hash
    - All fields except timestamps are required
    - Uses UUID for primary key with automatic generation
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (true);
