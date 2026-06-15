import {
  LearnerProfile,
  InstructorProfile,
  Booking,
  Notification } from
'../lib/types';

export const mockLearner: LearnerProfile = {
  email: '',
  name: '',
  phone: '',
  level: 'Beginner',
  driving_score: 0,
  total_sessions: 0,
  wallet_balance: 0,
  preferred_vehicle: 'Car',
  goal: '',
  test_ready: false,
  photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
};

export const mockLearners: LearnerProfile[] = [];

export const mockInstructors: InstructorProfile[] = [];

export const mockBookings: Booking[] = [];

export const mockNotifications: Notification[] = [];

export const mockInstructorSelf: InstructorProfile = {
  email: '',
  name: '',
  phone: '',
  specialization: ['Car'],
  experience_years: 0,
  rating: 0,
  total_reviews: 0,
  availability: [],
  time_slots: [],
  auto_accept: false,
  price_per_session: 0,
  bio: '',
  photo_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80',
  status: 'active',
  total_earnings: 0,
  total_sessions: 0
};

// Simple in-memory store for the session
class DbStore {
  learners = [...mockLearners];
  instructors = [...mockInstructors];
  bookings = [...mockBookings];
  notifications = [...mockNotifications];

  getLearner(email: string) {
    return this.learners.find((l) => l.email === email);
  }

  getInstructor(email: string) {
    return this.instructors.find((i) => i.email === email);
  }

  updateLearner(email: string, updates: Partial<LearnerProfile>) {
    const idx = this.learners.findIndex((l) => l.email === email);
    if (idx !== -1) {
      this.learners[idx] = { ...this.learners[idx], ...updates };
    }
  }

  updateInstructor(email: string, updates: Partial<InstructorProfile>) {
    const idx = this.instructors.findIndex((i) => i.email === email);
    if (idx !== -1) {
      this.instructors[idx] = { ...this.instructors[idx], ...updates };
    }
  }

  addBooking(booking: Booking) {
    this.bookings.push(booking);
  }

  getLearnerBookings(email: string) {
    return this.bookings.filter((b) => b.learner_email === email);
  }

  getInstructorBookings(email: string) {
    return this.bookings.filter((b) => b.instructor_email === email);
  }

  updateBookingStatus(id: string, status: Booking['status']) {
    const booking = this.bookings.find((b) => b.id === id);
    if (booking) {
      booking.status = status;
    }
  }

  getInstructorStudents(email: string) {
    const studentEmails = new Set(
      this.bookings.
      filter((b) => b.instructor_email === email).
      map((b) => b.learner_email)
    );
    return this.learners.filter((l) => studentEmails.has(l.email));
  }

  // Admin Methods
  getAllUsers() {
    return {
      learners: this.learners,
      instructors: this.instructors
    };
  }

  deleteBooking(id: string) {
    this.bookings = this.bookings.filter((b) => b.id !== id);
  }

  toggleInstructorStatus(email: string) {
    const instructor = this.instructors.find((i) => i.email === email);
    if (instructor) {
      instructor.status =
      instructor.status === 'active' ? 'suspended' : 'active';
    }
  }

  deleteUser(email: string, role: 'learner' | 'instructor') {
    if (role === 'learner') {
      this.learners = this.learners.filter((l) => l.email !== email);
      this.bookings = this.bookings.filter((b) => b.learner_email !== email);
    } else {
      this.instructors = this.instructors.filter((i) => i.email !== email);
      this.bookings = this.bookings.filter((b) => b.instructor_email !== email);
    }
  }
}

export const db = new DbStore();