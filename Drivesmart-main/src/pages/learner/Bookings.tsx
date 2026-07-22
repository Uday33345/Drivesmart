import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock3,
  Star,
  X,
  Check } from
'lucide-react';
import { db, mockLearner } from '../../data/mockDb';
import { Booking } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../lib/supabaseService';
import { getSlotDisplay } from '../../lib/pricing';
import { toast } from 'sonner';

export function LearnerBookings() {
  const { learnerProfile } = useAuth();
  
  // Safe fallback learner object to prevent runtime import/database resolution issues
  const safeMockLearner = {
    email: 'learner@example.com',
    name: 'Aarav Sharma',
    phone: '+91 9876543210',
    level: 'Intermediate',
    driving_score: 78,
    total_sessions: 12,
    wallet_balance: 1500,
    preferred_vehicle: 'Car',
    goal: "Get Driver's License by next month",
    test_ready: false,
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  };

  const learner = learnerProfile || mockLearner || safeMockLearner;
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>(
    'all');
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await supabaseService.getLearnerBookings(learner.email);
      setAllBookings(data);
    };
    fetchBookings();
  }, [learner.email]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackBooking) return;
    try {
      await supabaseService.submitBookingFeedback(
        feedbackBooking.id,
        feedbackRating,
        feedbackComment || 'Great lesson!'
      );
      toast.success('Feedback submitted successfully!');
      setFeedbackBooking(null);
      const data = await supabaseService.getLearnerBookings(learner.email);
      setAllBookings(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback');
    }
  };

  const filteredBookings =
  filter === 'all' ?
  allBookings :
  allBookings.filter((b) => b.status === filter);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 size={16} />;
      case 'pending':
        return <Clock3 size={16} />;
      case 'completed':
        return <CheckCircle2 size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">My Bookings</h1>
          <p className="text-navy-200 mt-1">
            Manage your upcoming and past driving lessons
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
            (f) =>
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-primary-500 text-white shadow-glow-sm' : 'glass text-navy-200 hover:text-white'}`}>
              
                {f}
              </button>

          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBookings.length === 0 ?
        <div className="glass rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-navy-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-navy-200">
              You don't have any {filter !== 'all' ? filter : ''} bookings yet.
            </p>
          </div> :

        filteredBookings.map((booking, index) =>
        <motion.div
          key={booking.id}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.1
          }}
          className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-white/[0.06] transition-colors">
          
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center shrink-0">
                  <span className="font-bold text-lg">
                    {booking.instructor_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {booking.instructor_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-navy-200">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-primary-400" />
                      <span>
                        {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-primary-400" />
                      <span>{getSlotDisplay(booking.time_slot)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-primary-400" />
                      <span>{booking.vehicle_type} Training</span>
                    </div>
                  </div>

                  {booking.status === 'completed' && !booking.rating && (
                    <button
                      onClick={() => {
                        setFeedbackBooking(booking);
                        setFeedbackRating(5);
                        setFeedbackComment('');
                      }}
                      className="mt-3 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Star size={13} className="fill-amber-400 text-amber-400" /> Give Feedback
                    </button>
                  )}

                  {booking.status === 'completed' && booking.rating && (
                    <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg inline-flex items-center gap-1.5">
                      <Star size={12} className="fill-amber-400 text-amber-400" /> Rated {booking.rating}/5 {booking.feedback && `• "${booking.feedback}"`}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
              
                  {getStatusIcon(booking.status)}
                  <span className="capitalize">{booking.status}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{booking.price}</div>
                  <div className="text-xs text-navy-300 capitalize">
                    {booking.payment_status}
                  </div>
                </div>
              </div>
            </motion.div>
        )
        }
      </div>

      {/* --- Feedback Modal Popup --- */}
      <AnimatePresence>
        {feedbackBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setFeedbackBooking(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white text-slate-800 rounded-[24px] p-6 max-w-md w-full border border-slate-100 relative z-10 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500" size={18} /> Rate Your Lesson
                </h3>
                <button onClick={() => setFeedbackBooking(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Session with <strong className="text-slate-800">{feedbackBooking.instructor_name}</strong> on {feedbackBooking.date} ({feedbackBooking.vehicle_type})
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="flex justify-center gap-2 py-2 bg-amber-50/50 rounded-xl border border-amber-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Your Feedback</label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Write a review about your driving lesson..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackBooking(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1"
                  >
                    Submit <Check size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>);

}