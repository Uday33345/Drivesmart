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
  gender?: 'male' | 'female' | 'other';
  preferred_instructor_gender?: 'any' | 'female' | 'male';
}

export interface InstructorProfile {
  email: string;
  name: string;
  phone: string;
  specialization: (
  'Car' |
  'Bike' |
  'Truck' |
  'Heavy Vehicle' |
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
  gender?: 'male' | 'female' | 'other';
  driving_score?: number; // 0-100 safety score
  accidents_recorded?: number; // 0, 1, etc.
  verification_status?: 'verified' | 'pending' | 'under_review' | 'rejected';
  background_check_verified?: boolean;
  dl_number?: string;
  dl_document_url?: string;
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

export interface FeedbackReview {
  id: string;
  booking_id?: string;
  learner_email: string;
  learner_name: string;
  instructor_email: string;
  rating: number;
  comment: string;
  created_at: string;
}