-- SQL Script to set up DrivePro tables in the Supabase SQL Editor
-- Copy and run this script to set up all tables and seed them with initial data.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Learners Table
CREATE TABLE IF NOT EXISTS learners (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  level TEXT DEFAULT 'Beginner',
  driving_score INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  wallet_balance NUMERIC DEFAULT 0,
  preferred_vehicle TEXT DEFAULT 'Car',
  goal TEXT DEFAULT 'Obtain driving license',
  test_ready BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  gender TEXT DEFAULT 'female',
  preferred_instructor_gender TEXT DEFAULT 'any'
);

-- Create Instructors Table
CREATE TABLE IF NOT EXISTS instructors (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT[] DEFAULT ARRAY['Car'],
  experience_years INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  availability TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  time_slots TEXT[] DEFAULT ARRAY['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
  auto_accept BOOLEAN DEFAULT TRUE,
  price_per_session INTEGER DEFAULT 250,
  bio TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  total_earnings NUMERIC DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  gender TEXT DEFAULT 'female',
  driving_score INTEGER DEFAULT 95,
  accidents_recorded INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  background_check_verified BOOLEAN DEFAULT TRUE,
  dl_number TEXT,
  dl_document_url TEXT
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  learner_email TEXT REFERENCES learners(email) ON DELETE CASCADE,
  learner_name TEXT,
  instructor_email TEXT REFERENCES instructors(email) ON DELETE CASCADE,
  instructor_name TEXT,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  vehicle_type TEXT DEFAULT 'Car',
  price NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'paid', -- 'pending', 'paid', 'refunded'
  feedback_given BOOLEAN DEFAULT FALSE,
  rating INTEGER,
  review_comment TEXT
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT REFERENCES learners(email) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'credit', 'debit'
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  learner_email TEXT NOT NULL,
  learner_name TEXT NOT NULL,
  instructor_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- MIGRATION SCRIPT FOR EXISTING DATABASE
-- (Run this if your tables already exist)
-- ==========================================

ALTER TABLE learners ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'female';
ALTER TABLE learners ADD COLUMN IF NOT EXISTS preferred_instructor_gender TEXT DEFAULT 'any';

ALTER TABLE instructors ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'female';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS dl_number TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS dl_document_url TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS driving_score INTEGER DEFAULT 95;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS accidents_recorded INTEGER DEFAULT 0;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS background_check_verified BOOLEAN DEFAULT TRUE;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS feedback_given BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS review_comment TEXT;
