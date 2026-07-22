import React from 'react';
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
  Bar } from
'recharts';
import { IndianRupee, TrendingUp, ArrowUpRight, Download } from 'lucide-react';
import { mockInstructorSelf, db } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 59000 },
  { month: 'Jun', revenue: 68000 }
];

const vehicleRevenue = [
  { name: 'Car', value: 45000 },
  { name: 'Bike', value: 15000 },
  { name: 'Truck', value: 8000 }
];

export function InstructorEarnings() {
  const { instructorProfile } = useAuth();
  const instructor = instructorProfile || mockInstructorSelf;

  const completedBookings = db.bookings.filter(
    (b) => b.instructor_email === instructor.email && b.status === 'completed'
  );
  const totalEarnings = instructor.total_earnings + completedBookings.reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">
            Earnings Analytics
          </h1>
          <p className="text-navy-200 mt-1">
            Track your revenue and financial growth
          </p>
        </div>
        <button className="flex items-center gap-2 glass px-4 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="glass-strong rounded-3xl p-6 bg-gradient-to-br from-navy-800 to-navy-900 border-primary-500/20">
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-500/20 text-primary-500 rounded-lg">
              <IndianRupee size={20} />
            </div>
            <h3 className="text-navy-200 font-medium">Total Earnings</h3>
          </div>
          <p className="text-4xl font-bold font-display text-white mb-2">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-green-400 flex items-center gap-1">
            <ArrowUpRight size={16} /> +12.5% from last month
          </p>
        </motion.div>

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
            delay: 0.1
          }}
          className="glass rounded-3xl p-6">
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-navy-200 font-medium">Avg. Monthly</h3>
          </div>
          <p className="text-4xl font-bold font-display text-white mb-2">
            ₹55,500
          </p>
          <p className="text-sm text-navy-300">Based on last 6 months</p>
        </motion.div>

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
            delay: 0.2
          }}
          className="glass rounded-3xl p-6">
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <IndianRupee size={20} />
            </div>
            <h3 className="text-navy-200 font-medium">Pending Payout</h3>
          </div>
          <p className="text-4xl font-bold font-display text-white mb-2">
            ₹12,400
          </p>
          <p className="text-sm text-navy-300">Clears on 15th Jun</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            delay: 0.3
          }}
          className="glass rounded-3xl p-6 lg:col-span-2 h-[400px]">
          
          <h3 className="text-xl font-semibold mb-6">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0
              }}>
              
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false} />
              
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{
                  fill: '#64748b'
                }}
                axisLine={false}
                tickLine={false} />
              
              <YAxis
                stroke="#64748b"
                tick={{
                  fill: '#64748b'
                }}
                axisLine={false}
                tickLine={false} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1628',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                itemStyle={{
                  color: '#f97316'
                }} />
              
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)" />
              
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

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
          className="glass rounded-3xl p-6 h-[400px]">
          
          <h3 className="text-xl font-semibold mb-6">By Vehicle Type</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={vehicleRevenue}
              layout="vertical"
              margin={{
                top: 0,
                right: 0,
                bottom: 0,
                left: -20
              }}>
              
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                horizontal={false} />
              
              <XAxis
                type="number"
                stroke="#64748b"
                tick={false}
                axisLine={false}
                tickLine={false} />
              
              <YAxis
                dataKey="name"
                type="category"
                stroke="#e2e8f0"
                axisLine={false}
                tickLine={false} />
              
              <Tooltip
                cursor={{
                  fill: 'rgba(255,255,255,0.05)'
                }}
                contentStyle={{
                  backgroundColor: '#0a1628',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }} />
              
              <Bar
                dataKey="value"
                fill="#f97316"
                radius={[0, 4, 4, 0]}
                barSize={30} />
              
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>);

}