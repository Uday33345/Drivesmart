import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  IndianRupee,
  TrendingUp,
  Map,
  Check,
  X } from
'lucide-react';
import { db, mockInstructorSelf } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../lib/types';
import { toast } from 'sonner';
import { supabaseService } from '../../lib/supabaseService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';

const weeklyData = [
  { day: 'Mon', sessions: 4 },
  { day: 'Tue', sessions: 6 },
  { day: 'Wed', sessions: 5 },
  { day: 'Thu', sessions: 8 },
  { day: 'Fri', sessions: 7 },
  { day: 'Sat', sessions: 10 },
  { day: 'Sun', sessions: 2 }
];

export function InstructorDashboard() {
  const { instructorProfile } = useAuth();
  const instructor = instructorProfile || mockInstructorSelf;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const bData = await supabaseService.getInstructorBookings(instructor.email);
      setBookings(bData);
      const sData = await supabaseService.getInstructorStudents(instructor.email);
      setStudentsList(sData);
    };
    fetchDashboardData();
  }, [instructor.email]);

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const upcomingLessons = bookings.filter((b) => b.status === 'confirmed').slice(0, 3);
  const students = studentsList;

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled') => {
    await supabaseService.updateBookingStatus(id, status);
    const bData = await supabaseService.getInstructorBookings(instructor.email);
    setBookings(bData);
    toast.success(`Booking request ${status === 'confirmed' ? 'accepted' : 'rejected'}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Overview</h1>
        <p className="text-navy-200 mt-1">
          Welcome back, {instructor.name.split(' ')[0]}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
        {
          label: 'Total Earnings',
          value: `₹${instructor.total_earnings.toLocaleString('en-IN')}`,
          icon: IndianRupee,
          color: 'text-green-400',
          bg: 'bg-green-400/10'
        },
        {
          label: 'Total Sessions',
          value: instructor.total_sessions,
          icon: Calendar,
          color: 'text-blue-400',
          bg: 'bg-blue-400/10'
        },
        {
          label: 'Active Students',
          value: students.length,
          icon: Users,
          color: 'text-purple-400',
          bg: 'bg-purple-400/10'
        },
        {
          label: 'Rating',
          value: instructor.rating,
          icon: TrendingUp,
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10'
        }].
        map((stat, i) =>
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-2xl p-6 flex items-center gap-4">
          
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-navy-200">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 lg:col-span-2 h-[400px]">
          
          <h2 className="text-xl font-semibold mb-6">Weekly Sessions</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 0, right: 0, bottom: 20, left: -20 }}>
              
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false} />
              
              <XAxis
                dataKey="day"
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
                axisLine={false}
                tickLine={false} />
              
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b' }}
                axisLine={false}
                tickLine={false} />
              
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  backgroundColor: '#0a1628',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }} />
              
              <Bar dataKey="sessions" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 flex flex-col">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
            <span className="bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full text-xs font-bold">
              {pendingRequests.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-auto">
            {pendingRequests.length === 0 ?
            <div className="text-center text-navy-300 py-8">
                No pending requests
              </div> :

            pendingRequests.map((req) =>
            <div
              key={req.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10">
              
                  <p className="font-semibold">{req.learner_name}</p>
                  <p className="text-xs text-navy-200 mt-1">
                    {req.date} at {req.time_slot}
                  </p>
                  <p className="text-xs text-primary-400 mt-1">
                    {req.vehicle_type} Training
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'confirmed')}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-1.5 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors">
                      <Check size={14} /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'cancelled')}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1.5 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
            )
            }
          </div>
        </motion.div>

        {/* AI Route Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-6 lg:col-span-2 bg-gradient-to-r from-navy-800 to-navy-900 border-primary-500/20">
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-500/20 text-primary-500 rounded-xl">
              <Map size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                AI Route Optimization
                <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                  Smart
                </span>
              </h3>
              <p className="text-navy-200 text-sm mt-2">
                Based on your upcoming sessions today, we recommend starting
                from <strong>Sector 4</strong> to minimize travel time between
                learners. Traffic is unusually high on Main St.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Lessons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-3xl p-6">
          
          <h2 className="text-xl font-semibold mb-6">Today's Schedule</h2>
          <div className="space-y-4">
            {upcomingLessons.map((lesson) =>
            <div
              key={lesson.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
              
                <div className="text-center shrink-0">
                  <p className="text-sm font-bold text-primary-400">
                    {lesson.time_slot}
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                  <p className="font-semibold">{lesson.learner_name}</p>
                  <p className="text-xs text-navy-200">{lesson.vehicle_type}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>);
}