import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { supabaseService } from '../../lib/supabaseService';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Booking } from '../../lib/types';
import { getSlotDisplay } from '../../lib/pricing';

export function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await supabaseService.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await supabaseService.deleteBooking(id);
      await fetchBookings();
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
    booking.learner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.instructor_name.
    toLowerCase().
    includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
    statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary-500/20 text-primary-400 border-primary-500/20';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/20';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-display">Booking Management</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-200" />
            
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-navy-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 w-full sm:w-64" />
            
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-navy-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 text-sm">
            
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking, i) =>
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: i * 0.05
          }}
          key={booking.id}
          className="glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-navy-200 mb-1">Booking ID</p>
                <p className="font-medium font-mono">{booking.id}</p>
                <span
                className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(booking.status)}`}>
                
                  {booking.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-navy-200 mb-1">Learner</p>
                <p className="font-medium">{booking.learner_name}</p>
                <p className="text-sm text-navy-200">{booking.learner_email}</p>
              </div>

              <div>
                <p className="text-xs text-navy-200 mb-1">Instructor</p>
                <p className="font-medium">{booking.instructor_name}</p>
                <p className="text-sm text-navy-200">{booking.vehicle_type}</p>
              </div>

              <div>
                <p className="text-xs text-navy-200 mb-1">Schedule</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-primary-400" />
                  {format(parseISO(booking.date), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Clock size={14} className="text-primary-400" />
                  {getSlotDisplay(booking.time_slot)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t border-white/10 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-xs text-navy-200 mb-1">Amount</p>
                <p className="text-xl font-bold font-display">
                  ₹{booking.price}
                </p>
              </div>
              <button
              onClick={() => handleDelete(booking.id)}
              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Delete Booking">
              
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {filteredBookings.length === 0 &&
        <div className="glass p-12 rounded-2xl text-center text-navy-200">
            No bookings found matching your search.
          </div>
        }
      </div>
    </div>);

}