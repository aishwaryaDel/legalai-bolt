/*
  # Create helpdesk_questions table

  1. New Tables
    - `helpdesk_questions`
      - `id` (uuid, primary key) - Unique identifier for each question
      - `user_id` (uuid, foreign key) - Reference to the user who submitted the question
      - `question` (text, not null) - The question text submitted by the user
      - `status` (text, not null) - Current status (pending, in_progress, resolved, closed)
      - `response` (text, nullable) - Response from the helpdesk team
      - `responded_by` (uuid, nullable) - ID of the user who responded
      - `responded_at` (timestamptz, nullable) - When response was provided
      - `created_at` (timestamptz) - When question was created
      - `updated_at` (timestamptz) - When question was last updated

  2. Important Notes
    - Default status is 'pending'
    - Foreign key constraint ensures data integrity with users table
    - Indexes added for performance on common queries
*/

CREATE TABLE IF NOT EXISTS helpdesk_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  response text,
  responded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_helpdesk_questions_user_id ON helpdesk_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_helpdesk_questions_status ON helpdesk_questions(status);
CREATE INDEX IF NOT EXISTS idx_helpdesk_questions_created_at ON helpdesk_questions(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_helpdesk_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS helpdesk_questions_updated_at ON helpdesk_questions;
CREATE TRIGGER helpdesk_questions_updated_at
  BEFORE UPDATE ON helpdesk_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_helpdesk_questions_updated_at();
