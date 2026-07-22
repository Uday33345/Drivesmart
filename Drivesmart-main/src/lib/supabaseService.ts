import { supabase, isSupabaseConfigured } from './supabaseClient';
import { db } from '../data/mockDb';
import { Booking, InstructorProfile, LearnerProfile, Notification, FeedbackReview } from './types';

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
        message: `Your session with ${booking.instructor_name} on ${booking.date} has been marked as completed. Please submit your feedback!`,
        type: 'info' as const,
        read: false,
        created_at: new Date().toISOString()
      };
      await supabaseService.addNotification(notification);
    }
  },

  async submitBookingFeedback(id: string, rating: number, feedback: string): Promise<void> {
    let booking: Booking | undefined;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
      if (data) booking = data as Booking;
    } else {
      booking = db.bookings.find((b) => b.id === id);
    }

    if (isSupabaseConfigured) {
      const { error: bErr } = await supabase
        .from('bookings')
        .update({ rating, feedback })
        .eq('id', id);
      if (bErr) console.error('Error updating booking feedback:', bErr);

      if (booking) {
        const feedbackObj = {
          id: `FDB-${Math.floor(100000 + Math.random() * 900000)}`,
          booking_id: id,
          learner_email: booking.learner_email,
          learner_name: booking.learner_name || 'Learner',
          instructor_email: booking.instructor_email,
          rating: rating,
          comment: feedback,
          created_at: new Date().toISOString()
        };
        const { error: fErr } = await supabase.from('feedbacks').insert([feedbackObj]);
        if (fErr) console.error('Error inserting into feedbacks table:', fErr);

        // Recalculate instructor rating and total_reviews count
        try {
          const instReviews = await supabaseService.getInstructorReviews(booking.instructor_email, booking.instructor_name);
          const totalCount = instReviews.length;
          const avgRating = totalCount > 0 
            ? Number((instReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1))
            : rating;

          await supabase
            .from('instructors')
            .update({ rating: avgRating, total_reviews: totalCount })
            .eq('email', booking.instructor_email);
        } catch (rErr) {
          console.error('Error updating instructor rating in DB:', rErr);
        }
      }
    } else {
      if (booking) {
        booking.rating = rating;
        booking.feedback = feedback;

        const feedbackObj: FeedbackReview = {
          id: `FDB-${Math.floor(100000 + Math.random() * 900000)}`,
          booking_id: id,
          learner_email: booking.learner_email,
          learner_name: booking.learner_name || 'Learner',
          instructor_email: booking.instructor_email,
          rating: rating,
          comment: feedback,
          created_at: new Date().toISOString()
        };
        db.addFeedback(feedbackObj);

        // Update mock instructor stats
        const inst = db.instructors.find((i) => i.email.toLowerCase() === booking!.instructor_email.toLowerCase());
        if (inst) {
          const instReviews = db.getInstructorFeedbacks(inst.email);
          inst.total_reviews = instReviews.length;
          if (instReviews.length > 0) {
            inst.rating = Number((instReviews.reduce((sum, r) => sum + r.rating, 0) / instReviews.length).toFixed(1));
          }
        }
      }
    }
  },

  async getInstructorReviews(instructorEmail: string, instructorName?: string): Promise<FeedbackReview[]> {
    const cleanEmail = (instructorEmail || '').trim().toLowerCase();
    const cleanName = (instructorName || '').trim().toLowerCase();
    const allReviews: FeedbackReview[] = [];

    if (isSupabaseConfigured) {
      try {
        // 1. Fetch from feedbacks table
        const { data: fbData, error: fbErr } = await supabase
          .from('feedbacks')
          .select('*')
          .order('created_at', { ascending: false });

        if (fbErr) console.error('Error fetching feedbacks:', fbErr);

        if (fbData) {
          for (const item of fbData) {
            const itemEmail = (item.instructor_email || '').trim().toLowerCase();
            if (
              itemEmail === cleanEmail ||
              (cleanEmail && itemEmail.includes(cleanEmail)) ||
              (cleanName && itemEmail.includes(cleanName))
            ) {
              allReviews.push({
                id: item.id || `FDB-${Math.random()}`,
                booking_id: item.booking_id,
                learner_email: item.learner_email,
                learner_name: item.learner_name || 'Learner',
                instructor_email: item.instructor_email,
                rating: Number(item.rating) || 5,
                comment: item.comment || 'Great session!',
                created_at: item.created_at || new Date().toISOString()
              });
            }
          }
        }

        // 2. Fetch from bookings table where rating is present
        const { data: bData, error: bErr } = await supabase
          .from('bookings')
          .select('*')
          .not('rating', 'is', null);

        if (bErr) console.error('Error fetching bookings reviews:', bErr);

        if (bData) {
          for (const b of bData) {
            const bEmail = (b.instructor_email || '').trim().toLowerCase();
            const bName = (b.instructor_name || '').trim().toLowerCase();
            const matches =
              bEmail === cleanEmail ||
              (cleanEmail && bEmail.includes(cleanEmail)) ||
              (cleanName && bName === cleanName) ||
              (cleanName && bEmail.includes(cleanName));

            if (matches && b.rating) {
              const alreadyInFb = allReviews.some((r) => r.booking_id === b.id);
              if (!alreadyInFb) {
                allReviews.push({
                  id: `FDB-${b.id}`,
                  booking_id: b.id,
                  learner_email: b.learner_email,
                  learner_name: b.learner_name || 'Learner',
                  instructor_email: b.instructor_email || instructorEmail,
                  rating: Number(b.rating) || 5,
                  comment: b.feedback || 'Great session!',
                  created_at: b.date || new Date().toISOString()
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error in getInstructorReviews:', err);
      }
    }

    // In-memory fallback / merge for dbStore
    const directFeedbacks = db.getInstructorFeedbacks(instructorEmail);
    const bookingFeedbacks = db.bookings
      .filter((b) => {
        if (!b.rating) return false;
        const bEmail = (b.instructor_email || '').trim().toLowerCase();
        const bName = (b.instructor_name || '').trim().toLowerCase();
        return bEmail === cleanEmail || (cleanName && bName === cleanName);
      })
      .map((b) => ({
        id: `FDB-${b.id}`,
        booking_id: b.id,
        learner_email: b.learner_email,
        learner_name: b.learner_name || 'Learner',
        instructor_email: b.instructor_email,
        rating: b.rating!,
        comment: b.feedback || 'Great session!',
        created_at: b.date || new Date().toISOString()
      }));

    for (const item of [...directFeedbacks, ...bookingFeedbacks]) {
      if (!allReviews.some((r) => r.id === item.id || (r.booking_id && r.booking_id === item.booking_id))) {
        allReviews.push(item);
      }
    }

    return allReviews;
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
    let all: InstructorProfile[] = [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('instructors').select('*');
      if (error) console.error(error);
      all = (data as InstructorProfile[]) || [];
    } else {
      all = db.instructors;
    }

    // Filter to ONLY return active and verified instructors to learners
    return all.filter((i) => {
      const isStatusActive = i.status === 'active';
      const isVerified = !i.verification_status || i.verification_status === 'verified';
      return isStatusActive && isVerified;
    });
  },

  async getAllInstructorsForAdmin(): Promise<InstructorProfile[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('instructors').select('*');
      if (error) console.error(error);
      return (data as InstructorProfile[]) || [];
    } else {
      return db.instructors;
    }
  },

  async updateInstructorVerification(email: string, updates: Partial<InstructorProfile>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('instructors').update(updates).eq('email', email);
      if (error) console.error('Error updating instructor verification:', error);
    } else {
      const inst = db.instructors.find((i) => i.email === email);
      if (inst) Object.assign(inst, updates);
    }
  }
};
