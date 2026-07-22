import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  IndianRupee,
  Settings,
  LogOut,
  Bell,
  Menu,
  Car } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockInstructorSelf } from '../data/mockDb';

export function InstructorLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, instructorProfile } = useAuth();
  const navigate = useNavigate();

  const profile = instructorProfile || mockInstructorSelf;

  const handleLogout = () => {
    logout();
  };

  const navItems = [
  {
    path: '/instructor',
    icon: LayoutDashboard,
    label: 'Dashboard',
    end: true
  },
  {
    path: '/instructor/bookings',
    icon: CalendarDays,
    label: 'Bookings'
  },
  {
    path: '/instructor/students',
    icon: Users,
    label: 'Students'
  },
  {
    path: '/instructor/earnings',
    icon: IndianRupee,
    label: 'Earnings'
  },
  {
    path: '/instructor/settings',
    icon: Settings,
    label: 'Settings'
  }];

  const SidebarContent = () =>
  <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-500 flex items-center justify-center shadow-glow">
          <Car size={24} />
        </div>
        <span className="text-2xl font-bold font-heading">
          Drive<span className="text-primary-500">Pro</span>
        </span>
        <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/20">
          Instructor
        </span>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center gap-4 px-4 mb-8">
          <img
          src={profile.photo_url}
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-primary-500/50 object-cover" />
        
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-xs text-primary-400 flex items-center gap-1">
              ★ {profile.rating} ({profile.total_reviews})
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) =>
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]' : 'text-navy-200 hover:bg-white/5 hover:text-white'}`
          }>
          
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
        )}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
        
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>;

  return (
    <div className="min-h-screen app-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-white/10 glass">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen &&
      <div className="fixed inset-0 z-50 md:hidden">
          <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)} />
        
          <motion.aside
          initial={{
            x: '-100%'
          }}
          animate={{
            x: 0
          }}
          exit={{
            x: '-100%'
          }}
          className="absolute top-0 left-0 bottom-0 w-72 bg-navy-600 border-r border-white/10 flex flex-col">
          
            <SidebarContent />
          </motion.aside>
        </div>
      }

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/10 glass flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-navy-200 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}>
              
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold hidden sm:block">
              Instructor Portal
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-navy-200 hover:text-white transition-colors">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary-500 rounded-full shadow-glow"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-navy-900/50 px-4 py-2 rounded-full border border-white/10">
              <IndianRupee size={18} className="text-primary-500" />
              <span className="font-semibold">
                {profile.total_earnings.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>);
}