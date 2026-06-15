import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  GraduationCap,
  LineChart,
  LogOut,
  Bell,
  Menu,
  ShieldAlert } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
  };
  const navItems = [
  {
    path: '/admin',
    icon: LayoutDashboard,
    label: 'Overview',
    end: true
  },
  {
    path: '/admin/users',
    icon: Users,
    label: 'Users'
  },
  {
    path: '/admin/bookings',
    icon: CalendarDays,
    label: 'Bookings'
  },
  {
    path: '/admin/instructors',
    icon: GraduationCap,
    label: 'Instructors'
  },
  {
    path: '/admin/revenue',
    icon: LineChart,
    label: 'Revenue'
  }];

  const SidebarContent = () =>
  <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <ShieldAlert size={24} />
        </div>
        <span className="text-2xl font-bold font-display">
          Drive<span className="text-red-500">Admin</span>
        </span>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center gap-4 px-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center border-2 border-red-500/50">
            <ShieldAlert size={20} className="text-red-400" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold truncate">System Admin</p>
            <p className="text-xs text-red-400 truncate">{user?.email}</p>
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
          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : 'text-navy-200 hover:bg-white/5 hover:text-white'}`
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
          className="absolute top-0 left-0 bottom-0 w-72 bg-navy-900 border-r border-white/10 flex flex-col">
          
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
            <h2 className="text-xl font-semibold hidden sm:block font-display">
              Command Center
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-navy-200 hover:text-white transition-colors">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 text-red-400 text-sm font-medium">
              <ShieldAlert size={16} />
              Admin Access
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