export type Role = 'learner' | 'instructor' | 'admin' | null;

export interface User {
  email: string;
  role: Role;
  onboarded: boolean;
}

export interface LearnerProfile {
  email: string;
  name: string;
  phone: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  driving_score: number; // 0-100
  total_sessions: number;
  wallet_balance: number;
  preferred_vehicle: 'Car' | 'Bike' | 'Truck';
  goal: string;
  test_ready: boolean;
  photo_url: string;
}

export interface InstructorProfile {
  email: string;
  name: string;
  phone: string;
  specialization: (
  'Car' |
  'Bike' |
  'Truck' |
  'Defensive Driving' |
  'Night Driving')[];

  experience_years: number;
  rating: number;
  total_reviews: number;
  availability: string[]; // e.g., ['Monday', 'Tuesday']
  time_slots: string[]; // e.g., ['08:00', '09:00']
  auto_accept: boolean;
  price_per_session: number; // Base price
  bio: string;
  photo_url: string;
  status: 'active' | 'suspended';
  total_earnings: number;
  total_sessions: number;
}

export interface Booking {
  id: string;
  learner_email: string;
  learner_name: string;
  instructor_email: string;
  instructor_name: string;
  date: string; // YYYY-MM-DD
  time_slot: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  vehicle_type: 'Car' | 'Bike' | 'Truck';
  price: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  rating?: number;
  feedback?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user_email: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}