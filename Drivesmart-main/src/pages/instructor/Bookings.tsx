import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock3,
  Check,
  X } from
'lucide-react';
import { db, mockInstructorSelf } from '../../data/mockDb';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../lib/supabaseService';
import { useEffect } from 'react';
import { getSlotDisplay } from '../../lib/pricing';
import { Booking } from '../../lib/types';

export function InstructorBookings() {
  const { instructorProfile, updateInstructorProfile } = useAuth();
  const instructor = instructorProfile || mockInstructorSelf;
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>(
    'all');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await supabaseService.getInstructorBookings(instructor.email);
      setBookings(data);
    };
    fetchBookings();
  }, [instructor.email]);

  const filteredBookings =
  filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);
  const handleStatusUpdate = async (id: string, status: any) => {
    await supabaseService.updateBookingStatus(id, status);

    if (status === 'completed') {
      const completedBooking = bookings.find((b) => b.id === id);
      if (completedBooking) {
        const newEarnings = (instructor.total_earnings || 0) + completedBooking.price;
        const newSessions = (instructor.total_sessions || 0) + 1;
        await updateInstructorProfile({
          total_earnings: newEarnings,
          total_sessions: newSessions
        });
      }
    }

    const data = await supabaseService.getInstructorBookings(instructor.email);
    setBookings(data);
    toast.success(`Booking marked as ${status}`);
  };
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
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Manage Bookings</h1>
          <p className="text-navy-200 mt-1">
            Review and manage your lesson schedule
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
              No {filter !== 'all' ? filter : ''} requests at the moment.
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
                <div className="w-12 h-12 rounded-full bg-navy-600 flex items-center justify-center shrink-0 border border-white/10">
                  <span className="font-bold text-lg">
                    {booking.learner_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {booking.learner_name}
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
                      <span>{booking.vehicle_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
              
                  <span className="capitalize">{booking.status}</span>
                </div>

                {booking.status === 'pending' &&
            <div className="flex gap-2 w-full md:w-auto">
                    <button
                onClick={() =>
                handleStatusUpdate(booking.id, 'confirmed')
                }
                className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1">
                
                      <Check size={16} /> Accept
                    </button>
                    <button
                onClick={() =>
                handleStatusUpdate(booking.id, 'cancelled')
                }
                className="flex-1 md:flex-none bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1">
                
                      <X size={16} /> Reject
                    </button>
                  </div>
            }

                {booking.status === 'confirmed' &&
            <button
              onClick={() => handleStatusUpdate(booking.id, 'completed')}
              className="w-full md:w-auto bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1">
              
                    <CheckCircle2 size={16} /> Mark Completed
                  </button>
            }
              </div>
            </motion.div>
        )
        }
      </div>
    </div>);

}