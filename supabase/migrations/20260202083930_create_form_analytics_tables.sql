/*
  # Form Analytics Tables

  1. New Tables
    - `form_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exercise_id` (text)
      - `session_id` (uuid)
      - `rep_number` (int)
      - `form_score` (float)
      - `timestamp` (timestamptz)
      - `biomechanics_data` (jsonb) - stores detailed angle measurements, velocity, etc.
      - `detected_issues` (text[]) - array of form issues detected
      - `coaching_cues_shown` (text[]) - array of cues displayed to user
      - `created_at` (timestamptz)
    
    - `exercise_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exercise_id` (text)
      - `workout_id` (uuid, nullable)
      - `total_reps` (int)
      - `average_form_score` (float)
      - `duration_seconds` (int)
      - `camera_view` (text)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `form_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exercise_id` (text)
      - `insight_type` (text) - 'trend', 'achievement', 'suggestion'
      - `metric` (text) - 'form_score', 'rep_consistency', etc.
      - `value` (jsonb)
      - `generated_at` (timestamptz)
      - `read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create form_analytics table
CREATE TABLE IF NOT EXISTS form_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  session_id uuid NOT NULL,
  rep_number int NOT NULL,
  form_score float NOT NULL CHECK (form_score >= 0 AND form_score <= 100),
  timestamp timestamptz NOT NULL DEFAULT now(),
  biomechanics_data jsonb DEFAULT '{}'::jsonb,
  detected_issues text[] DEFAULT ARRAY[]::text[],
  coaching_cues_shown text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Create exercise_sessions table
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  workout_id uuid,
  total_reps int NOT NULL DEFAULT 0,
  average_form_score float,
  duration_seconds int NOT NULL DEFAULT 0,
  camera_view text DEFAULT 'side',
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create form_insights table
CREATE TABLE IF NOT EXISTS form_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  insight_type text NOT NULL CHECK (insight_type IN ('trend', 'achievement', 'suggestion', 'warning')),
  metric text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_analytics
CREATE POLICY "Users can view own form analytics"
  ON form_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own form analytics"
  ON form_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own form analytics"
  ON form_analytics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for exercise_sessions
CREATE POLICY "Users can view own exercise sessions"
  ON exercise_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise sessions"
  ON exercise_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise sessions"
  ON exercise_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise sessions"
  ON exercise_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for form_insights
CREATE POLICY "Users can view own form insights"
  ON form_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own form insights"
  ON form_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own form insights"
  ON form_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own form insights"
  ON form_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form_analytics_user_exercise 
  ON form_analytics(user_id, exercise_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_form_analytics_session 
  ON form_analytics(session_id, rep_number);

CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user 
  ON exercise_sessions(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_form_insights_user_unread 
  ON form_insights(user_id, read, generated_at DESC)
  WHERE read = false;