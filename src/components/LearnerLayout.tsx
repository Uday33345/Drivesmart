import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  TrendingUp,
  Wallet,
  LogOut,
  Bell,
  Menu,
  X,
  Car } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockLearner } from '../data/mockDb';
import { supabaseService } from '../lib/supabaseService';

export function LearnerLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, learnerProfile } = useAuth();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

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

  const profile = learnerProfile || mockLearner || safeMockLearner;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (profile.email) {
        const data = await supabaseService.getLearnerNotifications(profile.email);
        setNotifications(data);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [profile.email]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await supabaseService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    {
      path: '/learner',
      icon: LayoutDashboard,
      label: 'Dashboard',
      end: true
    },
    {
      path: '/learner/book',
      icon: CalendarPlus,
      label: 'Book Slot'
    },
    {
      path: '/learner/bookings',
      icon: History,
      label: 'My Bookings'
    },
    {
      path: '/learner/progress',
      icon: TrendingUp,
      label: 'Progress'
    },
    {
      path: '/learner/wallet',
      icon: Wallet,
      label: 'Wallet'
    }
  ];

  const SidebarContent = () => (
    <>
      {/* Brand logo at the top */}
      <div className="p-6 flex items-center gap-3">
        {/* Custom Steering Wheel / Car Icon in blue background */}
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
          <Car size={20} />
        </div>
        <span className="text-xl font-bold font-heading text-white tracking-wide">
          DrivePro
        </span>
      </div>

      {/* Portal label with green indicator dot */}
      <div className="px-6 mb-4">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/5 text-slate-300 border border-white/10 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Learner Portal
        </span>
      </div>

      {/* Navigation menu */}
      <div className="px-4 py-3 flex-1">
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <item.icon size={18} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                    <span className="text-[14px] font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="text-blue-500">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Profile Section & Sign Out */}
      <div className="p-4 border-t border-white/5 mt-auto flex flex-col gap-4">
        {/* User profile card */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
          {/* Blue initials avatar */}
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-[14px] leading-tight truncate">{profile.name}</p>
            <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{profile.email}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-[13px] font-semibold"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-body antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B1422] text-white shrink-0 shadow-xl select-none">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute top-0 left-0 bottom-0 w-64 bg-[#0B1422] text-white flex flex-col shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-md font-semibold text-slate-800 hidden sm:block">
              Learner Portal
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 text-slate-800 font-sans">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                          !notif.read ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-slate-800">{notif.title}</h4>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-normal">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200/50">
              <Wallet size={16} className="text-blue-600" />
              <span className="font-semibold text-slate-700 text-sm">
                ₹{profile.wallet_balance}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-50 learner-portal-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}