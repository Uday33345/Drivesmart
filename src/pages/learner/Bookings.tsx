import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock3 } from
'lucide-react';
import { db, mockLearner } from '../../data/mockDb';
import { Booking } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../lib/supabaseService';
import { useEffect } from 'react';
import { getSlotDisplay } from '../../lib/pricing';

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

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await supabaseService.getLearnerBookings(learner.email);
      setAllBookings(data);
    };
    fetchBookings();
  }, [learner.email]);

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
    </div>);

}