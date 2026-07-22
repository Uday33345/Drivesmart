import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Shield,
  Car,
  GraduationCap,
  MoreVertical,
  Trash2,
  AlertTriangle,
  UserX,
  UserCheck } from
'lucide-react';
import { supabaseService } from '../../lib/supabaseService';
import { toast } from 'sonner';

export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'learner' | 'instructor'>('all');
  
  const [usersData, setUsersData] = useState<{ learners: any[]; instructors: any[] }>({
    learners: [],
    instructors: []
  });
  const [loading, setLoading] = useState(true);
  const [activeActionEmail, setActiveActionEmail] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await supabaseService.getAllUsers();
      setUsersData(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const { learners, instructors } = usersData;
  const allUsers = [
    ...learners.map((l) => ({ ...l, role: 'learner' as const, status: 'active' })),
    ...instructors.map((i) => ({ ...i, role: 'instructor' as const, status: i.status }))
  ];

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (email: string, role: 'learner' | 'instructor') => {
    try {
      await supabaseService.deleteUser(email, role);
      await fetchUsers();
      setActiveActionEmail(null);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleSuspension = async (email: string) => {
    try {
      await supabaseService.toggleInstructorStatus(email);
      await fetchUsers();
      setActiveActionEmail(null);
      
      const updatedData = await supabaseService.getAllUsers();
      const inst = updatedData.instructors.find(i => i.email === email);
      toast.success(`Instructor status updated to ${inst?.status || 'active'}`);
    } catch (error) {
      console.error('Error toggling instructor status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-display">User Management</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-200" />
            
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-navy-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 w-full sm:w-64" />
          </div>
          
          <div className="flex bg-navy-900/50 p-1 rounded-xl border border-white/10">
            {(['all', 'learner', 'instructor'] as const).map((role) =>
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterRole === role ? 'bg-primary-500 text-white shadow-glow-sm' : 'text-navy-200 hover:text-white'}`}>
                {role}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-navy-200 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{allUsers.length}</p>
          </div>
        </div>
        <div className="glass p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Car size={24} />
          </div>
          <div>
            <p className="text-navy-200 text-sm">Learners</p>
            <p className="text-2xl font-bold">{learners.length}</p>
          </div>
        </div>
        <div className="glass p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-navy-200 text-sm">Instructors</p>
            <p className="text-2xl font-bold">{instructors.length}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-visible">
        <div className="overflow-x-auto overflow-visible">
          <table className="w-full text-left overflow-visible">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium text-navy-200">User</th>
                <th className="p-4 font-medium text-navy-200">Role</th>
                <th className="p-4 font-medium text-navy-200">Contact</th>
                <th className="p-4 font-medium text-navy-200">Status</th>
                <th className="p-4 font-medium text-navy-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 overflow-visible">
              {filteredUsers.map((user, i) =>
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={user.email}
                  className="hover:bg-white/5 transition-colors overflow-visible">
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photo_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover" />
                      
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-navy-200">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'instructor' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                      {user.role === 'instructor' ? <GraduationCap size={12} /> : <Car size={12} />}
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <p className="text-sm">{user.phone}</p>
                  </td>
                  
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  
                  <td className="p-4 text-right overflow-visible relative">
                    <button 
                      onClick={() => setActiveActionEmail(activeActionEmail === user.email ? null : user.email)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-navy-200 hover:text-white">
                      <MoreVertical size={18} />
                    </button>
                    
                    {/* Action Dropdown Menu */}
                    <AnimatePresence>
                      {activeActionEmail === user.email && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveActionEmail(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-4 mt-2 w-48 rounded-xl glass-strong border border-white/10 shadow-2xl z-20 overflow-hidden text-left">
                            
                            {user.role === 'instructor' && (
                              <button
                                onClick={() => handleToggleSuspension(user.email)}
                                className="w-full px-4 py-3 text-sm text-white hover:bg-white/5 flex items-center gap-2 border-b border-white/5 transition-colors">
                                {user.status === 'active' ? (
                                  <>
                                    <UserX size={16} className="text-red-400" />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={16} className="text-green-400" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                                  handleDeleteUser(user.email, user.role);
                                }
                              }}
                              className="w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                              <Trash2 size={16} />
                              <span>Delete User</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              )}
              {filteredUsers.length === 0 &&
                <tr>
                  <td colSpan={5} className="p-8 text-center text-navy-200">
                    No users found matching your criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Users({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}