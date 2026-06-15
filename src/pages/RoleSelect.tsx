import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ShieldAlert, BoxIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../lib/types';
import { toast } from 'sonner';
export function RoleSelect() {
  const { user, setRole } = useAuth();
  const navigate = useNavigate();
  const [selectingRole, setSelectingRole] = useState<Role | null>(null);
  
  useEffect(() => {
    if (user?.onboarded && user.role) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const handleSelectRole = async (role: Role) => {
    // Save selected role in sessionStorage so it is preserved
    sessionStorage.setItem('selected_role', role);

    if (user) {
      if (role === 'admin' && user.email !== 'udaybhanu33345@gmail.com') {
        toast.error('Unauthorized', {
          description: 'Only authorized administrators can access this role.'
        });
        return;
      }
      setSelectingRole(role);
      try {
        await setRole(role);
        navigate(`/${role}`);
      } catch (err: any) {
        console.error('Error selecting role:', err);
        toast.error(err.message || 'Failed to select role. Please try again.');
      } finally {
        setSelectingRole(null);
      }
    } else {
      // If not logged in, go to login screen configured for this role
      navigate(`/login?role=${role}`);
    }
  };

  const roles = [
    {
      id: 'learner' as Role,
      title: 'Learner',
      description: 'Book lessons, track progress, and get AI insights.',
      icon: GraduationCap,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'hover:border-blue-400/50'
    },
    {
      id: 'instructor' as Role,
      title: 'Instructor',
      description: 'Manage bookings, students, and track earnings.',
      icon: BoxIcon,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'hover:border-green-400/50'
    },
    {
      id: 'admin' as Role,
      title: 'Admin',
      description: 'Platform analytics and user management.',
      icon: ShieldAlert,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'hover:border-purple-400/50',
      restricted: true
    }
  ];

  return (
    <div className="min-h-screen app-bg flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="w-full max-w-4xl">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Path</h1>
          <p className="text-navy-200 text-lg">
            Select how you want to use DrivePro today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isRestricted =
            role.restricted && user?.email !== 'udaybhanu33345@gmail.com';
            const isProcessing = selectingRole !== null;
            const isThisSelected = selectingRole === role.id;
            const isDisabled = isRestricted || isProcessing;
            return (
              <motion.button
                key={role.id}
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
                onClick={() => !isDisabled && handleSelectRole(role.id)}
                disabled={isDisabled}
                className={`glass-strong rounded-3xl p-8 text-left transition-all duration-300 border border-white/10 ${role.border} group relative overflow-hidden ${isRestricted ? 'opacity-50 cursor-not-allowed' : isProcessing && !isThisSelected ? 'opacity-30 cursor-not-allowed' : isThisSelected ? 'border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'hover:-translate-y-2'}`}>
                
                <div
                  className={`w-16 h-16 rounded-2xl ${role.bg} ${role.color} flex items-center justify-center mb-6 transition-transform ${isThisSelected ? '' : 'group-hover:scale-110'}`}>
                  {isThisSelected ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : (
                    <Icon size={32} />
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                <p className="text-navy-200">{role.description}</p>

                {isRestricted &&
                <div className="absolute top-4 right-4 bg-navy-900/80 text-xs px-2 py-1 rounded text-navy-300 border border-white/10">
                    Restricted
                  </div>
                }
              </motion.button>);

          })}
        </div>
      </motion.div>
    </div>);

}