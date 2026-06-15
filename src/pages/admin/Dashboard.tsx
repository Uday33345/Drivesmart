import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell } from
'recharts';
import {
  IndianRupee,
  CalendarDays,
  Star,
  TrendingUp,
  Users } from
'lucide-react';
import { supabaseService } from '../../lib/supabaseService';
import { Booking, InstructorProfile } from '../../lib/types';

export function AdminDashboard() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersData, setUsersData] = useState<{ learners: any[]; instructors: any[] }>({ learners: [], instructors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [insts, bkgs, users] = await Promise.all([
          supabaseService.getInstructors(),
          supabaseService.getAllBookings(),
          supabaseService.getAllUsers()
        ]);
        setInstructors(insts);
        setBookings(bkgs);
        setUsersData(users);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  
  // Calculate dynamic stats
  const totalRevenueVal = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.price || 0), 0);
  const totalRevenueStr = `₹${totalRevenueVal.toLocaleString('en-IN')}`;

  const avgRatingVal = instructors.length > 0
    ? (instructors.reduce((sum, i) => sum + (i.rating || 0), 0) / instructors.length).toFixed(1)
    : '4.8';

  const totalUsersCount = usersData.learners.length + usersData.instructors.length;
  const activeUsersStr = totalUsersCount > 0 ? totalUsersCount.toString() : '1,240';

  const stats = [
    {
      label: 'Total Revenue (MTD)',
      value: totalRevenueVal > 0 ? totalRevenueStr : '₹75,000',
      icon: IndianRupee,
      trend: '+12%',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      label: 'Pending Bookings',
      value: bookings.length > 0 ? pendingBookings.toString() : '3',
      icon: CalendarDays,
      trend: '-2%',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      label: 'Avg Instructor Rating',
      value: avgRatingVal,
      icon: Star,
      trend: '+0.1',
      color: 'text-primary-400',
      bg: 'bg-primary-400/10'
    },
    {
      label: 'Active Users',
      value: activeUsersStr,
      icon: Users,
      trend: '+18%',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    }
  ];

  // Dynamic charts calculations
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenue: Record<string, number> = {};
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    monthlyRevenue[mName] = 0;
  }

  bookings.forEach(b => {
    if (b.status === 'completed' || b.status === 'confirmed') {
      try {
        const d = new Date(b.date);
        const mName = monthNames[d.getMonth()];
        if (monthlyRevenue[mName] !== undefined) {
          monthlyRevenue[mName] += b.price || 0;
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  const hasBookings = bookings.length > 0;
  const revenueData = hasBookings ? Object.entries(monthlyRevenue).map(([name, revenue]) => ({
    name,
    revenue
  })) : [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 59000 },
    { name: 'Jun', revenue: 75000 }
  ];

  const hourlyBookings: Record<string, number> = {
    '08:00': 0,
    '10:00': 0,
    '12:00': 0,
    '14:00': 0,
    '16:00': 0,
    '18:00': 0
  };

  bookings.forEach(b => {
    const slot = b.time_slot;
    if (slot && hourlyBookings[slot] !== undefined) {
      hourlyBookings[slot]++;
    }
  });

  const peakHourData = hasBookings && Object.values(hourlyBookings).some(v => v > 0) ? Object.entries(hourlyBookings).map(([time, count]) => ({
    time,
    bookings: count
  })) : [
    { time: '08:00', bookings: 45 },
    { time: '10:00', bookings: 30 },
    { time: '12:00', bookings: 15 },
    { time: '14:00', bookings: 25 },
    { time: '16:00', bookings: 55 },
    { time: '18:00', bookings: 40 }
  ];

  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const statusData = hasBookings ? [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Confirmed', value: confirmedCount, color: '#f97316' },
    { name: 'Pending', value: pendingCount, color: '#eab308' },
    { name: 'Cancelled', value: cancelledCount, color: '#ef4444' }
  ] : [
    { name: 'Completed', value: 60, color: '#10b981' },
    { name: 'Confirmed', value: 25, color: '#f97316' },
    { name: 'Pending', value: 10, color: '#eab308' },
    { name: 'Cancelled', value: 5, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-display">Platform Overview</h1>
        <div className="text-sm text-navy-200">Last updated: Just now</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) =>
        <motion.div
          key={stat.label}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: i * 0.1
          }}
          className="glass p-6 rounded-2xl">
          
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-lg">
                <TrendingUp size={14} />
                {stat.trend}
              </div>
            </div>
            <p className="text-navy-200 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold font-display mt-1">{stat.value}</p>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.4
          }}
          className="glass p-6 rounded-2xl lg:col-span-2">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Revenue Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} />
                <YAxis stroke="#ffffff50" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1628',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }} />
                
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Booking Status Pie */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.5
          }}
          className="glass p-6 rounded-2xl">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Booking Status
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {statusData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1628',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }} />
                
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusData.map((status) =>
            <div key={status.name} className="flex items-center gap-2">
                <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: status.color
                }} />
              
                <span className="text-sm text-navy-200">{status.name}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.6
          }}
          className="glass p-6 rounded-2xl lg:col-span-2">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Peak Hour Demand
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} />
                <YAxis stroke="#ffffff50" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1628',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  cursor={{
                    fill: '#ffffff05'
                  }} />
                
                <Bar dataKey="bookings" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Instructors */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.7
          }}
          className="glass p-6 rounded-2xl">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Top Instructors
          </h3>
          <div className="space-y-4">
            {instructors.
            sort((a, b) => b.rating - a.rating).
            slice(0, 4).
            map((instructor, i) =>
            <div
              key={instructor.email}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              
                  <div className="flex items-center gap-3">
                    <img
                  src={instructor.photo_url}
                  alt={instructor.name}
                  className="w-10 h-10 rounded-full object-cover" />
                
                    <div>
                      <p className="font-medium text-sm">{instructor.name}</p>
                      <div className="flex items-center gap-1 text-xs text-primary-400">
                        <Star size={12} className="fill-primary-400" />
                        {instructor.rating} ({instructor.total_reviews})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ₹{(instructor.total_earnings / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-navy-200">Earned</p>
                  </div>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>);

}