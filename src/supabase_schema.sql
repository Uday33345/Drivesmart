-- SQL Script to set up DrivePro tables in the Supabase SQL Editor
-- Copy and run this script to set up all tables and seed them with initial data.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to avoid conflict (CAUTION: clears data)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS learners CASCADE;

-- Create Learners Table
CREATE TABLE learners (
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
  photo_url TEXT
);

-- Create Instructors Table
CREATE TABLE instructors (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT[] DEFAULT ARRAY['Car'],
  experience_years INTEGER DEFAULT 5,
  rating NUMERIC DEFAULT 4.8,
  total_reviews INTEGER DEFAULT 0,
  availability TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  time_slots TEXT[] DEFAULT ARRAY['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
  auto_accept BOOLEAN DEFAULT TRUE,
  price_per_session INTEGER DEFAULT 260,
  bio TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  total_earnings NUMERIC DEFAULT 0,
  total_sessions INTEGER DEFAULT 0
);

-- Create Bookings Table
CREATE TABLE bookings (
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
  payment_status TEXT DEFAULT 'paid' -- 'pending', 'paid', 'refunded'
);

-- Create Transactions Table
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT REFERENCES learners(email) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'credit', 'debit'
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL
);

-- -- --- SEED MOCK DATA ---
-- Mock data seed instructions removed to start database freshly.

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

