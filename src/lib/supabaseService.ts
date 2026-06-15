import { supabase, isSupabaseConfigured } from './supabaseClient';
import { db } from '../data/mockDb';
import { Booking, InstructorProfile, LearnerProfile, Notification } from './types';

export const supabaseService = {
  async getLearnerBookings(email: string): Promise<Booking[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('learner_email', email)
        .order('date', { ascending: false });
      if (error) console.error(error);
      return data || [];
    } else {
      return db.getLearnerBookings(email);
    }
  },

  async getInstructorBookings(email: string): Promise<Booking[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('instructor_email', email)
        .order('date', { ascending: false });
      if (error) console.error(error);
      return data || [];
    } else {
      return db.getInstructorBookings(email);
    }
  },

  async addBooking(booking: Booking): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('bookings').insert([booking]);
      if (error) console.error(error);
    } else {
      db.addBooking(booking);
    }
  },

  async updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
    let booking: Booking | undefined;
    if (isSupabaseConfigured) {
      const { data, error: fetchErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!fetchErr && data) {
        booking = data;
      }
    } else {
      booking = db.bookings.find((b) => b.id === id);
    }

    if (!booking) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      if (error) console.error(error);
    } else {
      db.updateBookingStatus(id, status);
    }

    // Trigger notification
    if (status === 'confirmed') {
      const notification = {
        id: `NOT-${Math.floor(100000 + Math.random() * 900000)}`,
        user_email: booking.learner_email,
        title: 'Booking Accepted',
        message: `Your session with ${booking.instructor_name} on ${booking.date} at ${booking.time_slot} has been accepted.`,
        type: 'success' as const,
        read: false,
        created_at: new Date().toISOString()
      };
      await supabaseService.addNotification(notification);
    } else if (status === 'cancelled') {
      const notification = {
        id: `NOT-${Math.floor(100000 + Math.random() * 900000)}`,
        user_email: booking.learner_email,
        title: 'Booking Rejected',
        message: `Your session request with ${booking.instructor_name} on ${booking.date} at ${booking.time_slot} has been rejected.`,
        type: 'error' as const,
        read: false,
        created_at: new Date().toISOString()
      };
      await supabaseService.addNotification(notification);
    } else if (status === 'completed') {
      const notification = {
        id: `NOT-${Math.floor(100000 + Math.random() * 900000)}`,
        user_email: booking.learner_email,
        title: 'Session Completed',
        message: `Your session with ${booking.instructor_name} on ${booking.date} has been marked as completed.`,
        type: 'info' as const,
        read: false,
        created_at: new Date().toISOString()
      };
      await supabaseService.addNotification(notification);
    }
  },

  async addNotification(notification: any): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notifications').insert([notification]);
      if (error) console.error('Error adding notification:', error);
    } else {
      db.notifications.push(notification);
    }
  },

  async getLearnerNotifications(email: string): Promise<Notification[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching notifications:', error);
      return data || [];
    } else {
      return db.notifications.filter((n) => n.user_email === email);
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) console.error('Error marking notification as read:', error);
    } else {
      const notification = db.notifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    }
  },

  async deleteBooking(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) console.error(error);
    } else {
      db.deleteBooking(id);
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false });
      if (error) console.error(error);
      return data || [];
    } else {
      return db.bookings;
    }
  },

  async getInstructorStudents(email: string): Promise<LearnerProfile[]> {
    if (isSupabaseConfigured) {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('learner_email')
        .eq('instructor_email', email);

      if (!bookingsData || bookingsData.length === 0) return [];
      const studentEmails = [...new Set(bookingsData.map((b) => b.learner_email))];

      const { data: learnersData, error } = await supabase
        .from('learners')
        .select('*')
        .in('email', studentEmails);
      if (error) console.error(error);
      return (learnersData as LearnerProfile[]) || [];
    } else {
      return db.getInstructorStudents(email);
    }
  },

  async getLearnerTransactions(email: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_email', email)
        .order('id', { ascending: false });
      if (error) console.error(error);
      return data || [];
    } else {
      return [
        { id: 1, type: 'debit', title: 'Session with Vikram', date: 'Today, 09:00 AM', amount: 300 },
        { id: 2, type: 'credit', title: 'Wallet Top-up', date: 'Yesterday', amount: 1000 },
        { id: 3, type: 'debit', title: 'Session with Neha', date: 'Jun 05, 2026', amount: 260 },
        { id: 4, type: 'credit', title: 'Cashback - 10 Session Pack', date: 'Jun 01, 2026', amount: 260 }
      ];
    }
  },

  async addLearnerTransaction(email: string, tx: { type: string; title: string; amount: number; date: string }) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('transactions').insert([{
        user_email: email,
        type: tx.type,
        title: tx.title,
        amount: tx.amount,
        date: tx.date
      }]);
      if (error) console.error(error);
    }
  },

  async getAllUsers() {
    if (isSupabaseConfigured) {
      const { data: learners, error: lErr } = await supabase.from('learners').select('*');
      const { data: instructors, error: iErr } = await supabase.from('instructors').select('*');
      if (lErr) console.error(lErr);
      if (iErr) console.error(iErr);
      return {
        learners: learners || [],
        instructors: instructors || []
      };
    } else {
      return db.getAllUsers();
    }
  },

  async deleteUser(email: string, role: 'learner' | 'instructor'): Promise<void> {
    if (isSupabaseConfigured) {
      if (role === 'learner') {
        await supabase.from('learners').delete().eq('email', email);
      } else {
        await supabase.from('instructors').delete().eq('email', email);
      }
    } else {
      db.deleteUser(email, role);
    }
  },

  async toggleInstructorStatus(email: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('instructors').select('status').eq('email', email).maybeSingle();
      if (data) {
        const nextStatus = data.status === 'active' ? 'suspended' : 'active';
        await supabase.from('instructors').update({ status: nextStatus }).eq('email', email);
      }
    } else {
      db.toggleInstructorStatus(email);
    }
  },

  async getInstructors(): Promise<InstructorProfile[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('instructors').select('*');
      if (error) console.error(error);
      return (data as InstructorProfile[]) || [];
    } else {
      return db.instructors;
    }
  }
};
