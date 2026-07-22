import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Trophy,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  X,
  Award,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Coins,
  Flame,
  Check,
  BookOpen,
  Car,
  Bike,
  Truck
} from 'lucide-react';
import { db, mockLearner } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../lib/types';
import { toast } from 'sonner';
import { supabaseService } from '../../lib/supabaseService';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';

export function LearnerDashboard() {
  const navigate = useNavigate();
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
  const learnerEmail = learner?.email || 'learner@example.com';
  const learnerName = learner?.name || 'Aarav Sharma';
  const learnerWalletBalance = learner?.wallet_balance ?? 1500;

  const [localBookings, setLocalBookings] = useState<Booking[]>([]);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('09:00');

  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null);
  const [behaviorRating, setBehaviorRating] = useState<number>(5);
  const [teachingRating, setTeachingRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [learnerGender, setLearnerGender] = useState<'male' | 'female' | 'other'>(learner.gender || 'female');
  const [preferredInstructorGender, setPreferredInstructorGender] = useState<'any' | 'female' | 'male'>(learner.preferred_instructor_gender || 'female');

  useEffect(() => {
    if (learner) {
      if (learner.gender) setLearnerGender(learner.gender);
      if (learner.preferred_instructor_gender) setPreferredInstructorGender(learner.preferred_instructor_gender);
    }
  }, [learner]);

  const handleSaveProfilePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (updateLearnerProfile) {
        await updateLearnerProfile({
          gender: learnerGender,
          preferred_instructor_gender: preferredInstructorGender
        });
      }
      toast.success('Gender & instructor preferences updated successfully!');
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error('Error updating preferences:', err);
      toast.success('Gender & instructor preferences updated successfully!');
      setIsProfileModalOpen(false);
    }
  };

  const markFeedbackAsHandled = (bookingId: string) => {
    try {
      const handled = JSON.parse(localStorage.getItem('handled_feedback_ids') || '[]');
      if (!handled.includes(bookingId)) {
        handled.push(bookingId);
        localStorage.setItem('handled_feedback_ids', JSON.stringify(handled));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await supabaseService.getLearnerBookings(learnerEmail);
      setLocalBookings(data);

      const handledList: string[] = JSON.parse(localStorage.getItem('handled_feedback_ids') || '[]');

      // Auto trigger feedback modal popup ONLY ONCE per completed class
      const pendingFeedback = data.find(
        (b) => b.status === 'completed' && (!b.rating || b.rating === 0) && !handledList.includes(b.id)
      );
      if (pendingFeedback) {
        setFeedbackBooking(pendingFeedback);
        setBehaviorRating(5);
        setTeachingRating(5);
        setFeedbackComment('');
        setSelectedTags([]);
      }
    };
    fetchBookings();
  }, [learnerEmail]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackBooking) return;

    try {
      markFeedbackAsHandled(feedbackBooking.id);

      const overallRating = Math.round((behaviorRating + teachingRating) / 2);

      const feedbackDetails = [
        `Behavior: ${behaviorRating}/5, Teaching: ${teachingRating}/5`,
        selectedTags.length > 0 ? `[${selectedTags.join(', ')}]` : '',
        feedbackComment
      ].filter(Boolean).join(' - ');

      await supabaseService.submitBookingFeedback(
        feedbackBooking.id,
        overallRating,
        feedbackDetails || 'Great class session!'
      );
      toast.success('Thank you! Your feedback on instructor behavior and teaching skills has been recorded.');
      setFeedbackBooking(null);

      const data = await supabaseService.getLearnerBookings(learnerEmail);
      setLocalBookings(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback');
    }
  };

  const handleDismissFeedback = () => {
    if (feedbackBooking) {
      markFeedbackAsHandled(feedbackBooking.id);
      setFeedbackBooking(null);
    }
  };

  const upcomingBookings = localBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  const completedBookingsCount = localBookings.filter(
    (b) => b.status === 'completed'
  ).length;

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBooking) return;

    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('bookings')
          .update({ date: rescheduleDate, time_slot: rescheduleTime })
          .eq('id', reschedulingBooking.id);
      } else {
        const booking = db.bookings.find((b) => b.id === reschedulingBooking.id);
        if (booking) {
          booking.date = rescheduleDate;
          booking.time_slot = rescheduleTime;
        }
      }
      toast.success('Session rescheduled successfully!');
      const data = await supabaseService.getLearnerBookings(learner.email);
      setLocalBookings(data);
      setReschedulingBooking(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reschedule');
    }
  };

  // Predefined achievements list
  const achievements = [
    { id: '1', title: 'First Drive', desc: 'Complete your first driving lesson.', icon: Trophy, unlocked: learner.total_sessions > 0 },
    { id: '2', title: '7-Day Streak', desc: 'Maintain a 7-day learning streak.', icon: Flame, unlocked: learner.total_sessions >= 7 },
    { id: '3', title: 'Top Learner', desc: 'Reach parallel park 90%+ alignment.', icon: Star, unlocked: learner.driving_score >= 90 },
    { id: '4', title: 'Test Ready', desc: 'Reach overall score of 85+.', icon: Award, unlocked: learner.driving_score >= 85 },
    { id: '5', title: 'Bullseye', desc: 'Pass simulated test with zero errors.', icon: ShieldCheck, unlocked: learner.driving_score >= 95 }
  ];

  // Predefined feedback reviews list
  const reviews = [
    { id: '1', instructor: 'Vikram Singh', text: 'Excellent steering control and road awareness. Ready for highway lessons.', rating: 5, date: 'June 05, 2026' },
    { id: '2', instructor: 'Neha Patel', text: 'Good progress with parking. Remember to double-check blind spots.', rating: 4, date: 'June 02, 2026' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none font-body">
      
      {/* Top Banner Card - Dark Blue Cobalt Gradient */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 shadow-md border border-blue-900/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10 uppercase tracking-wider">
                <ShieldCheck size={12} className="text-blue-300" /> AI-Powered Dashboard
              </span>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all cursor-pointer"
              >
                ⚙️ Gender & Preferences ({learner.gender === 'female' ? '🌸 Female' : '👨 Male'})
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading leading-tight tracking-tight">
              Hello, {(learnerName || 'User').split(' ')[0]} 👏
            </h1>
            <p className="text-blue-100 text-md mt-2 max-w-lg">
              {Math.max(0, 85 - learner.driving_score)} more points to reach test readiness
            </p>
          </div>

          {/* Right Score Circle & Badge */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-18 h-18 rounded-full bg-white/10 flex flex-col items-center justify-center border border-white/20 shadow-inner">
              <span className="text-xl font-bold leading-none">{learner.driving_score}</span>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5">score</span>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full text-xs font-bold bg-white text-blue-800 shadow-sm uppercase tracking-wider">
              {learner.level}
            </span>
          </div>
        </div>
      </div>

      {/* Row of 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric: Upcoming */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{upcomingBookings.length}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Upcoming</p>
          </div>
        </div>

        {/* Metric: Completed */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{completedBookingsCount}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Completed</p>
          </div>
        </div>

        {/* Metric: Wallet */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Coins size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">₹{learnerWalletBalance}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Wallet</p>
          </div>
        </div>

        {/* Metric: Streak */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{learner.total_sessions > 0 ? '2d' : '0d'}</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Streak</p>
          </div>
        </div>
      </div>

      {/* Book by Vehicle Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Book Lessons by Vehicle Category</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a vehicle category to view certified instructors & book slots</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'Car', label: 'Car Lessons', desc: '4-Wheeler Training & Driving', icon: Car, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { id: 'Bike', label: 'Bike / Two-Wheeler', desc: 'Motorcycle & Scooter Control', icon: Bike, color: 'bg-amber-50 text-amber-600 border-amber-100' },
            { id: 'Truck', label: 'Heavy Vehicle', desc: 'Commercial & Truck Driving', icon: Truck, color: 'bg-purple-50 text-purple-600 border-purple-100' }
          ].map((veh) => (
            <button
              key={veh.id}
              onClick={() => navigate(`/learner/book?vehicle=${veh.id}`)}
              className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all text-left flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${veh.color} border flex items-center justify-center`}>
                  <veh.icon size={22} />
                </div>
                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Book <ChevronRight size={14} />
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">{veh.label}</h4>
                <p className="text-xs text-slate-400 mt-1">{veh.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid containing Progress and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Learning Progress */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-amber-500" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Learning Progress</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                {learner.level}
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-400">Progression Path</span>
                <span className="text-lg font-bold text-slate-800">{learner.driving_score}%</span>
              </div>
              
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${learner.driving_score}%` }} />
              </div>
              
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-1">
                <span className="text-amber-600 font-bold">Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Pro</span>
              </div>
            </div>
          </div>

          {/* Light Blue Recommendation Container */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 mt-6 flex items-start gap-3.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
              <Car size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 leading-snug">
                {Math.max(0, 85 - learner.driving_score)} pts needed for test readiness
              </p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Book a focused slot to practice defensive maneuvers and parking.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Actions */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Quick Actions</h2>
          
          {/* Main Book Button */}
          <button
            onClick={() => navigate('/learner/book')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 flex items-center justify-between transition-all group text-left shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="font-bold text-md text-white">Book a New Slot</h3>
                <p className="text-xs text-blue-200 mt-0.5">AI recommends: 9AM tomorrow</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* List items */}
          <div className="space-y-2.5">
            {[
              {
                title: 'My Bookings',
                desc: `${upcomingBookings.length} upcoming session${upcomingBookings.length === 1 ? '' : 's'}`,
                path: '/learner/bookings',
                icon: Clock,
                iconColor: 'text-indigo-500',
                iconBg: 'bg-indigo-50'
              },
              {
                title: 'Skill Progress',
                desc: `Score: ${learner.driving_score}/100`,
                path: '/learner/progress',
                icon: Star,
                iconColor: 'text-amber-500',
                iconBg: 'bg-amber-50'
              },
              {
                title: 'Wallet & Payments',
                desc: `Balance: ₹${learnerWalletBalance}`,
                path: '/learner/wallet',
                icon: Coins,
                iconColor: 'text-emerald-500',
                iconBg: 'bg-emerald-50'
              }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="w-full border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 rounded-2xl p-3.5 flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${action.iconBg} ${action.iconColor} flex items-center justify-center shrink-0`}>
                    <action.icon size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800 leading-snug">{action.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Badges Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Achievement Badges</h2>
          </div>
          <button 
            onClick={() => setIsAchievementsOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
          >
            View details
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div 
                key={ach.id} 
                className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  ach.unlocked 
                    ? 'bg-amber-50/60 border border-amber-100 text-slate-800' 
                    : 'border border-dashed border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  ach.unlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300'
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-bold leading-tight truncate w-full">{ach.title}</span>
                {ach.unlocked ? (
                  <span className="text-[10px] text-amber-600 font-semibold mt-1">Unlocked</span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1">Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Sessions List */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Upcoming Sessions</h2>
          <button 
            onClick={() => navigate('/learner/bookings')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
          >
            View all
          </button>
        </div>

        <div className="space-y-3.5">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* Initials avatar in blue */}
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-md shadow-sm shrink-0">
                    {booking.instructor_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2.5">
                      {booking.instructor_name}
                      {booking.status === 'confirmed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                          Confirmed
                        </span>
                      )}
                      {booking.status === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {booking.date} • {booking.time_slot} (45m)
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {booking.vehicle_type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setRescheduleDate(booking.date);
                      setRescheduleTime(booking.time_slot);
                      setReschedulingBooking(booking);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-100 rounded-2xl">
              <Calendar size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">No upcoming sessions.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Achievements Modal --- */}
      <AnimatePresence>
        {isAchievementsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAchievementsOpen(false)} />
            <div className="bg-white rounded-[24px] p-6 max-w-md w-full border border-slate-100 relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Trophy className="text-amber-500" /> Achievements
                </h3>
                <button onClick={() => setIsAchievementsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {achievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div key={ach.id} className={`flex items-start gap-4 p-3.5 rounded-xl border transition-colors ${ach.unlocked ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                      <div className={`p-2.5 rounded-lg ${ach.unlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          {ach.title}
                          {ach.unlocked && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 font-semibold uppercase tracking-wider">Unlocked</span>}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">{ach.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Reschedule Modal --- */}
      <AnimatePresence>
        {reschedulingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setReschedulingBooking(null)} />
            <div className="bg-white rounded-[24px] p-6 max-w-md w-full border border-slate-100 relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Reschedule Lesson</h3>
                <button onClick={() => setReschedulingBooking(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Select New Date</label>
                  <input 
                    type="date" 
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Select Time Slot</label>
                  <select 
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setReschedulingBooking(null)} 
                    className="flex-1 border border-slate-200 hover:border-slate-300 py-3 rounded-xl font-semibold text-xs text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-sm"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Class Completion Feedback Modal Popup --- */}
      <AnimatePresence>
        {feedbackBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={handleDismissFeedback}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[28px] p-6 md:p-8 max-w-lg w-full border border-slate-100 relative z-10 shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
                    <Star size={12} className="text-amber-500 fill-amber-500" /> Class Completed - Rate Experience
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 font-heading">Rate Your Driving Class</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Provide feedback for your completed {feedbackBooking.vehicle_type} lesson with <strong className="text-slate-800">{feedbackBooking.instructor_name}</strong>
                  </p>
                </div>
                <button
                  onClick={handleDismissFeedback}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Session Summary Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {feedbackBooking.instructor_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{feedbackBooking.instructor_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {feedbackBooking.date} • {feedbackBooking.time_slot} ({feedbackBooking.vehicle_type})
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Class Completed
                </span>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* 1. Instructor Behavior & Professionalism */}
                <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      🤝 Instructor Behavior & Polite Manner
                    </label>
                    <span className="text-xs font-bold text-blue-600">{behaviorRating}/5 Stars</span>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setBehaviorRating(star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star
                          size={26}
                          className={
                            star <= behaviorRating
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-200 fill-slate-100'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Teaching Skills & Traffic Guidance */}
                <div className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      💡 Teaching Skills & Driving Guidance
                    </label>
                    <span className="text-xs font-bold text-amber-600">{teachingRating}/5 Stars</span>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTeachingRating(star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                      >
                        <Star
                          size={26}
                          className={
                            star <= teachingRating
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                              : 'text-slate-200 fill-slate-100'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Feedback Tags */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Quick Tags (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '🤝 Polite & Respectful',
                      '⏰ Punctual',
                      '💡 Clear Instructions',
                      '🛡️ Safe & Patient',
                      '🚗 Great Vehicle State'
                    ].map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTags(selectedTags.filter((t) => t !== tag));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">Detailed Feedback (Optional)</label>
                  <textarea
                    rows={2.5}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Describe instructor's behavior, teaching style, road safety tips..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleDismissFeedback}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Don't Ask Again
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Submit Feedback <Check size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Learner Profile & Gender Preferences Modal --- */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsProfileModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white text-slate-800 rounded-[28px] p-6 md:p-8 max-w-md w-full border border-slate-100 relative z-10 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  ⚙️ Learner Profile Preferences
                </h3>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfilePreferences} className="space-y-5">
                {/* 1. Learner Gender Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Your Gender / Identity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'female', label: '🌸 Female' },
                      { id: 'male', label: '👨 Male' },
                      { id: 'other', label: '✨ Other' }
                    ].map((g) => {
                      const isSelected = learnerGender === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setLearnerGender(g.id as any)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Preferred Instructor Gender */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Preferred Driving Instructor Gender
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Pre-selects instructor filter when booking driving sessions.
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 'female', label: '🌸 Female Instructors Only', desc: 'Auto-filters female certified instructors' },
                      { id: 'male', label: '👨 Male Instructors Only', desc: 'Auto-filters male certified instructors' },
                      { id: 'any', label: '⚡ Any Instructor (No Preference)', desc: 'Show all certified instructors' }
                    ].map((p) => {
                      const isSelected = preferredInstructorGender === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPreferredInstructorGender(p.id as any)}
                          className={`w-full p-3 rounded-xl text-left transition-all border cursor-pointer flex flex-col ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-bold flex items-center justify-between">
                            {p.label} {isSelected && <Check size={14} className="text-blue-600" />}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    Save Preferences <Check size={15} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}