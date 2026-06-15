import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, ShieldOff, Search } from 'lucide-react';
import { supabaseService } from '../../lib/supabaseService';
import { toast } from 'sonner';
import { InstructorProfile } from '../../lib/types';

export function AdminInstructors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstructors = async () => {
    try {
      const data = await supabaseService.getInstructors();
      setInstructors(data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      toast.error('Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleToggleStatus = async (email: string) => {
    try {
      await supabaseService.toggleInstructorStatus(email);
      await fetchInstructors();
      const updatedList = await supabaseService.getInstructors();
      const instructor = updatedList.find((i) => i.email === email);
      toast.success(
        `Instructor ${instructor?.status === 'active' ? 'activated' : 'suspended'}`
      );
    } catch (error) {
      console.error('Error toggling instructor status:', error);
      toast.error('Failed to update status');
    }
  };
  const filteredInstructors = instructors.filter(
    (instructor) =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-display">
          Instructor Management
        </h1>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-200" />
          
          <input
            type="text"
            placeholder="Search instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-navy-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 w-full sm:w-64" />
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInstructors.map((instructor, i) =>
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
          key={instructor.email}
          className="glass p-6 rounded-2xl relative overflow-hidden">
          
            {instructor.status === 'suspended' &&
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                SUSPENDED
              </div>
          }

            <div className="flex items-start gap-4 mb-6">
              <img
              src={instructor.photo_url}
              alt={instructor.name}
              className={`w-16 h-16 rounded-full object-cover border-2 ${instructor.status === 'active' ? 'border-emerald-500/50' : 'border-red-500/50 grayscale'}`} />
            
              <div className="flex-1">
                <h3 className="text-lg font-bold">{instructor.name}</h3>
                <p className="text-sm text-navy-200">{instructor.email}</p>
                <div className="flex items-center gap-1 text-sm text-primary-400 mt-1">
                  <Star size={14} className="fill-primary-400" />
                  <span className="font-medium">{instructor.rating}</span>
                  <span className="text-navy-200">
                    ({instructor.total_reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-xs text-navy-200 mb-1">Experience</p>
                <p className="font-semibold">
                  {instructor.experience_years} Years
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-xs text-navy-200 mb-1">Total Sessions</p>
                <p className="font-semibold">{instructor.total_sessions}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-navy-200 mb-2">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {instructor.specialization.map((spec) =>
              <span
                key={spec}
                className="px-2.5 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg text-xs font-medium">
                
                    {spec}
                  </span>
              )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-sm">
                <span className="text-navy-200">Rate: </span>
                <span className="font-semibold">
                  ₹{instructor.price_per_session}/session
                </span>
              </div>
              <button
              onClick={() => handleToggleStatus(instructor.email)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${instructor.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
              
                {instructor.status === 'active' ?
              <>
                    <ShieldOff size={16} />
                    Suspend
                  </> :

              <>
                    <Shield size={16} />
                    Activate
                  </>
              }
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>);

}