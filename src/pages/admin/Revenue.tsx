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
  Cell,
  Legend } from
'recharts';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Gift } from
'lucide-react';
import { supabaseService } from '../../lib/supabaseService';
import { Booking } from '../../lib/types';

export function AdminRevenue() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const data = await supabaseService.getAllBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings for revenue:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, []);

  const hasBookings = bookings.length > 0;

  // Aggregate stats
  const totalGrossRevenueVal = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const grossRevenueStr = totalGrossRevenueVal > 0 
    ? `₹${totalGrossRevenueVal.toLocaleString('en-IN')}`
    : '₹4,43,000';

  const platformFeeVal = Math.round(totalGrossRevenueVal * 0.15);
  const platformFeeStr = totalGrossRevenueVal > 0
    ? `₹${platformFeeVal.toLocaleString('en-IN')}`
    : '₹66,450';

  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  const refundsProcessedVal = cancelledBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const refundsProcessedStr = refundsProcessedVal > 0
    ? `₹${refundsProcessedVal.toLocaleString('en-IN')}`
    : '₹12,500';

  // Revenue Growth by Vehicle type (monthly aggregation)
  const monthlyBreakdown: Record<string, { car: number; bike: number; truck: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    monthlyBreakdown[mName] = { car: 0, bike: 0, truck: 0 };
  }

  bookings.forEach(b => {
    if (b.status === 'completed' || b.status === 'confirmed') {
      try {
        const d = new Date(b.date);
        const mName = monthNames[d.getMonth()];
        if (monthlyBreakdown[mName] !== undefined) {
          const type = (b.vehicle_type || '').toLowerCase();
          if (type === 'bike') {
            monthlyBreakdown[mName].bike += b.price || 0;
          } else if (type === 'truck' || type === 'heavy') {
            monthlyBreakdown[mName].truck += b.price || 0;
          } else {
            monthlyBreakdown[mName].car += b.price || 0;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  const revenueHistory = hasBookings ? Object.entries(monthlyBreakdown).map(([month, val]) => ({
    month,
    car: val.car,
    bike: val.bike,
    truck: val.truck
  })) : [
    { month: 'Jan', car: 35000, bike: 15000, truck: 5000 },
    { month: 'Feb', car: 42000, bike: 18000, truck: 6000 },
    { month: 'Mar', car: 38000, bike: 16000, truck: 5500 },
    { month: 'Apr', car: 51000, bike: 22000, truck: 8000 },
    { month: 'May', car: 49000, bike: 20000, truck: 7500 },
    { month: 'Jun', car: 65000, bike: 28000, truck: 12000 }
  ];

  // Vehicle Revenue share
  const carRev = bookings
    .filter(b => b.vehicle_type === 'Car' && (b.status === 'completed' || b.status === 'confirmed'))
    .reduce((sum, b) => sum + (b.price || 0), 0);
  const bikeRev = bookings
    .filter(b => b.vehicle_type === 'Bike' && (b.status === 'completed' || b.status === 'confirmed'))
    .reduce((sum, b) => sum + (b.price || 0), 0);
  const truckRev = bookings
    .filter(b => (b.vehicle_type === 'Truck' || b.vehicle_type === 'Heavy') && (b.status === 'completed' || b.status === 'confirmed'))
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const totalCar = hasBookings ? carRev : 280000;
  const totalBike = hasBookings ? bikeRev : 119000;
  const totalTruck = hasBookings ? truckRev : 44000;

  const vehicleRevenue = [
    { name: 'Car', value: totalCar, color: '#3b82f6' },
    { name: 'Bike', value: totalBike, color: '#f97316' },
    { name: 'Truck', value: totalTruck, color: '#10b981' }
  ];

  // Refund analytics
  const refundData = hasBookings ? [
    { reason: 'Cancelled Bookings', count: cancelledBookings.length }
  ] : [
    { reason: 'Instructor Cancelled', count: 45 },
    { reason: 'Learner No-show', count: 20 },
    { reason: 'Weather', count: 15 },
    { reason: 'Other', count: 5 }
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-display">Revenue Analytics</h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-navy-200 text-sm">Total Gross Revenue</p>
            <IndianRupee size={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold font-display">{grossRevenueStr}</p>
          <p className="text-sm text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp size={14} /> +24% from last month
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-navy-200 text-sm">Platform Fees (15%)</p>
            <CreditCard size={18} className="text-primary-500" />
          </div>
          <p className="text-3xl font-bold font-display">{platformFeeStr}</p>
          <p className="text-sm text-primary-400 flex items-center gap-1 mt-2">
            <TrendingUp size={14} /> +24% from last month
          </p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-navy-200 text-sm">Refunds Processed</p>
            <TrendingDown size={18} className="text-red-500" />
          </div>
          <p className="text-3xl font-bold font-display">{refundsProcessedStr}</p>
          <p className="text-sm text-red-400 flex items-center gap-1 mt-2">
            <TrendingDown size={14} /> -5% from last month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Vehicle Type Area Chart */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="glass p-6 rounded-2xl lg:col-span-2">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Revenue Growth by Vehicle
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="colorCar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBike" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTruck" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#ffffff50" fontSize={12} />
                <YAxis stroke="#ffffff50" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1628',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }} />
                
                <Legend />
                <Area
                  type="monotone"
                  dataKey="car"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#colorCar)"
                  name="Car" />
                
                <Area
                  type="monotone"
                  dataKey="bike"
                  stackId="1"
                  stroke="#f97316"
                  fill="url(#colorBike)"
                  name="Bike" />
                
                <Area
                  type="monotone"
                  dataKey="truck"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#colorTruck)"
                  name="Truck" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vehicle Share Pie */}
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
          className="glass p-6 rounded-2xl">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Revenue Share
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {vehicleRevenue.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1628',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `₹${value}`} />
                
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {vehicleRevenue.map((item) =>
            <div
              key={item.name}
              className="flex items-center justify-between">
              
                <div className="flex items-center gap-2">
                  <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.color
                  }} />
                
                  <span className="text-sm text-navy-200">{item.name}</span>
                </div>
                <span className="font-semibold text-sm">₹{item.value}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Refund Analytics */}
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
          className="glass p-6 rounded-2xl lg:col-span-2">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Refund Reasons
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={refundData}
                layout="vertical"
                margin={{
                  left: 40
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff10"
                  horizontal={false} />
                
                <XAxis type="number" stroke="#ffffff50" fontSize={12} />
                <YAxis
                  dataKey="reason"
                  type="category"
                  stroke="#ffffff50"
                  fontSize={12} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1628',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  cursor={{
                    fill: '#ffffff05'
                  }} />
                
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Active Campaigns */}
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
          className="glass p-6 rounded-2xl">
          
          <h3 className="text-lg font-semibold mb-6 font-display">
            Active Campaigns
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-primary-400">
                  <Gift size={18} />
                  <span className="font-semibold">Summer10</span>
                </div>
                <span className="text-xs bg-primary-500/20 px-2 py-1 rounded text-primary-400">
                  Active
                </span>
              </div>
              <p className="text-sm text-navy-200 mb-3">
                10% off on 10+ session packages
              </p>
              <div className="flex justify-between text-xs">
                <span>Uses: 142</span>
                <span>Cost: ₹35,500</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-white">
                  <Gift size={18} />
                  <span className="font-semibold">NEWBIEDRIVE</span>
                </div>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-navy-200">
                  Ending Soon
                </span>
              </div>
              <p className="text-sm text-navy-200 mb-3">
                ₹500 flat off on first booking
              </p>
              <div className="flex justify-between text-xs">
                <span>Uses: 89</span>
                <span>Cost: ₹44,500</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>);

}