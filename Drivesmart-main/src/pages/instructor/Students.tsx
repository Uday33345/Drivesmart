import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Award, Calendar } from 'lucide-react';
import { db, mockInstructorSelf } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../lib/supabaseService';
import { useEffect } from 'react';

export function InstructorStudents() {
  const { instructorProfile } = useAuth();
  const instructor = instructorProfile || mockInstructorSelf;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentsAndBookings = async () => {
      const sData = await supabaseService.getInstructorStudents(instructor.email);
      setStudents(sData);
      const bData = await supabaseService.getInstructorBookings(instructor.email);
      setBookings(bData);
    };
    fetchStudentsAndBookings();
  }, [instructor.email]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">My Students</h1>
          <p className="text-navy-200 mt-1">
            Track progress and manage your learners
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300"
            size={18} />
          
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-navy-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 text-white w-full sm:w-64" />
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => {
          const sessionsWithMe = bookings.filter(
            (b) => b.learner_email === student.email && (b.status === 'confirmed' || b.status === 'completed')
          ).length;

          return (
            <motion.div
              key={student.email}
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                delay: index * 0.1
              }}
              className="glass rounded-3xl p-6 hover:border-primary-500/30 transition-colors group cursor-pointer">
              
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={student.photo_url}
                  alt={student.name}
                  className="w-16 h-16 rounded-full border-2 border-white/10 group-hover:border-primary-500 transition-colors object-cover" />
                
                <div>
                  <h3 className="text-lg font-semibold">{student.name}</h3>
                  <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full font-medium">
                    {student.level}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-navy-200 flex items-center gap-1">
                      <TrendingUp size={14} /> Driving Score
                    </span>
                    <span className="font-semibold text-white">
                      {student.driving_score}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-navy-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{
                        width: `${student.driving_score}%`
                      }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-navy-300 flex items-center gap-1 mb-1">
                      <Calendar size={12} /> Total Sessions
                    </p>
                    <p className="font-semibold">{student.total_sessions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-300 flex items-center gap-1 mb-1">
                      <Award size={12} /> With Me
                    </p>
                    <p className="font-semibold">{sessionsWithMe}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center py-12 text-navy-300">
            No students found.
          </div>
        )}
      </div>
    </div>
  );
}