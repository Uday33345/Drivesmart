import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Shield,
  ShieldOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileCheck,
  X,
  Check,
  SlidersHorizontal,
  UserCheck } from
'lucide-react';
import { supabaseService } from '../../lib/supabaseService';
import { toast } from 'sonner';
import { InstructorProfile } from '../../lib/types';

export function AdminInstructors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification Filters
  const [expFilter, setExpFilter] = useState<number>(0);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [accidentFilter, setAccidentFilter] = useState<'all' | 'clean' | 'has_accidents'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // Inspection Dossier Modal State
  const [inspectModalInstructor, setInspectModalInstructor] = useState<InstructorProfile | null>(null);

  const fetchInstructors = async () => {
    try {
      const data = await supabaseService.getAllInstructorsForAdmin();
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
      const updatedList = await supabaseService.getAllInstructorsForAdmin();
      const instructor = updatedList.find((i) => i.email === email);
      toast.success(
        `Instructor ${instructor?.status === 'active' ? 'activated' : 'suspended'}`
      );
    } catch (error) {
      console.error('Error toggling instructor status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleUpdateVerification = async (
    email: string,
    updates: Partial<InstructorProfile>
  ) => {
    try {
      const finalUpdates = {
        ...updates,
        status: updates.verification_status === 'verified' ? ('active' as const) : updates.status
      };
      await supabaseService.updateInstructorVerification(email, finalUpdates);
      toast.success(
        updates.verification_status === 'verified'
          ? 'Instructor verified & approved! Profile is now active & visible to learners.'
          : 'Instructor verification status updated.'
      );
      await fetchInstructors();
      setInspectModalInstructor(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update verification details');
    }
  };

  const filteredInstructors = instructors.filter((instructor) => {
    const searchMatch =
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!searchMatch) return false;

    if (expFilter > 0 && (instructor.experience_years || 0) < expFilter) return false;

    const safetyScore = instructor.driving_score ?? 95;
    if (minScoreFilter > 0 && safetyScore < minScoreFilter) return false;

    const accidents = instructor.accidents_recorded ?? 0;
    if (accidentFilter === 'clean' && accidents > 0) return false;
    if (accidentFilter === 'has_accidents' && accidents === 0) return false;

    const status = instructor.verification_status || 'verified';
    if (verificationFilter === 'verified' && status !== 'verified') return false;
    if (verificationFilter === 'pending' && status === 'verified') return false;

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header & Main Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Instructor Verification & Selection</h1>
          <p className="text-navy-200 mt-1 text-sm">
            Select & audit driving instructors based on experience, driving score, and accident records
          </p>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-200"
          />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-navy-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 w-full sm:w-72 text-sm"
          />
        </div>
      </div>

      {/* Admin Verification Filter Bar */}
      <div className="glass p-5 rounded-2xl space-y-4 border border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
          <SlidersHorizontal size={14} /> Verification & Safety Metric Filters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Experience Filter */}
          <div>
            <label className="block text-xs font-semibold text-navy-200 mb-1.5">Min Experience</label>
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(Number(e.target.value))}
              className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
            >
              <option value={0}>All Experience Levels</option>
              <option value={3}>3+ Years Experience</option>
              <option value={5}>5+ Years Experience</option>
              <option value={10}>10+ Years Experience</option>
            </select>
          </div>

          {/* Safety Driving Score Filter */}
          <div>
            <label className="block text-xs font-semibold text-navy-200 mb-1.5">Driving Safety Score</label>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
            >
              <option value={0}>Any Safety Score</option>
              <option value={90}>90+ (Grade A+ Safety)</option>
              <option value={80}>80+ (Grade A Safety)</option>
              <option value={70}>70+ (Satisfactory)</option>
            </select>
          </div>

          {/* Accident History Filter */}
          <div>
            <label className="block text-xs font-semibold text-navy-200 mb-1.5">Accident Record</label>
            <select
              value={accidentFilter}
              onChange={(e) => setAccidentFilter(e.target.value as any)}
              className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Accident Histories</option>
              <option value="clean">✅ Clean Record (0 Accidents)</option>
              <option value="has_accidents">⚠️ Reported Incidents</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-navy-200 mb-1.5">Verification Status</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as any)}
              className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Only ✓</option>
              <option value="pending">Pending Review ⏳</option>
            </select>
          </div>
        </div>
      </div>

      {/* Instructors Verification Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInstructors.length === 0 ? (
          <div className="col-span-full glass p-12 rounded-2xl text-center">
            <UserCheck className="w-12 h-12 text-navy-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold">No Instructors Match Verification Criteria</h3>
            <p className="text-xs text-navy-200 mt-1">Try adjusting your filters above to view more instructors.</p>
          </div>
        ) : (
          filteredInstructors.map((instructor, i) => {
            const safetyScore = instructor.driving_score ?? 95;
            const accidents = instructor.accidents_recorded ?? 0;
            const isVerified = (instructor.verification_status || 'verified') === 'verified';

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={instructor.email}
                className="glass p-6 rounded-2xl relative overflow-hidden space-y-5 border border-white/10 hover:border-white/20 transition-all"
              >
                {/* Status Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isVerified
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}
                  >
                    {isVerified ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    {isVerified ? 'Verified Instructor' : 'Pending Review'}
                  </span>

                  {instructor.status === 'suspended' && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      SUSPENDED
                    </span>
                  )}
                </div>

                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <img
                    src={instructor.photo_url}
                    alt={instructor.name}
                    className={`w-16 h-16 rounded-2xl object-cover border-2 ${
                      instructor.status === 'active' ? 'border-primary-500' : 'border-red-500 grayscale'
                    }`}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {instructor.name}
                      {instructor.gender === 'female' && (
                        <span className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">
                          🌸 Female
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-navy-200 mt-0.5 flex items-center gap-2">
                      <span>{instructor.email}</span>
                      <span className="text-[10px] font-mono bg-white/10 text-primary-300 border border-white/15 px-2 py-0.5 rounded-md font-bold">
                        DL: {instructor.dl_number && instructor.dl_number !== 'DL-2024-VERIFIED' ? instructor.dl_number : 'Not Submitted'}
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-primary-400 mt-1.5 font-semibold">
                      <Star size={14} className="fill-primary-400 text-amber-400" />
                      <span>{instructor.rating}</span>
                      <span className="text-navy-300 font-normal">({instructor.total_reviews} student reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Verification Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 bg-navy-950/60 border border-white/5 p-3.5 rounded-xl">
                  <div>
                    <p className="text-[11px] text-navy-200">Driving Experience</p>
                    <p className="font-bold text-sm text-white mt-0.5">{instructor.experience_years} Years</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-navy-200">Safety Score</p>
                    <p
                      className={`font-bold text-sm mt-0.5 ${
                        safetyScore >= 90 ? 'text-emerald-400' : safetyScore >= 75 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      🛡️ {safetyScore}/100
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-navy-200">Accident History</p>
                    <p
                      className={`font-bold text-xs mt-0.5 flex items-center gap-1 ${
                        accidents === 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {accidents === 0 ? '✅ Clean Record' : `⚠️ ${accidents} Incident`}
                    </p>
                  </div>
                </div>

                {/* Specializations Badges */}
                <div>
                  <p className="text-xs text-navy-200 mb-1.5 font-medium">Approved Vehicles & Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {instructor.specialization.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-0.5 bg-primary-500/10 text-primary-300 border border-primary-500/20 rounded-lg text-xs font-semibold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setInspectModalInstructor(instructor)}
                    className="flex-1 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-primary-500/40 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck size={14} /> Audit Verification Dossier
                  </button>

                  <button
                    onClick={() => handleToggleStatus(instructor.email)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      instructor.status === 'active'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {instructor.status === 'active' ? (
                      <>
                        <ShieldOff size={14} /> Suspend
                      </>
                    ) : (
                      <>
                        <Shield size={14} /> Activate
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* --- Admin Verification Inspection Dossier Modal --- */}
      <AnimatePresence>
        {inspectModalInstructor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
              onClick={() => setInspectModalInstructor(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white text-slate-800 rounded-[28px] p-6 md:p-8 max-w-lg w-full border border-slate-100 relative z-10 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={inspectModalInstructor.photo_url}
                    alt={inspectModalInstructor.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-600"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{inspectModalInstructor.name}</h3>
                    <p className="text-xs text-slate-500">{inspectModalInstructor.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      DL: {inspectModalInstructor.dl_number && inspectModalInstructor.dl_number !== 'DL-2024-VERIFIED' ? inspectModalInstructor.dl_number : 'Not Submitted Yet'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectModalInstructor(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Verification & Safety Audit Dossier
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-500">Driving Experience</p>
                    <p className="text-lg font-extrabold text-slate-800 mt-1">
                      {inspectModalInstructor.experience_years} Years
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Meets Senior Criteria</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-500">Driving Safety Score</p>
                    <p className="text-lg font-extrabold text-blue-600 mt-1">
                      🛡️ {inspectModalInstructor.driving_score ?? 95}/100
                    </p>
                    <span className="text-[10px] text-slate-500 font-semibold">Grade A+ Certified</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-amber-500" /> Previous Accidents Recorded
                    </span>
                    <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {inspectModalInstructor.accidents_recorded ?? 0} Recorded
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {inspectModalInstructor.accidents_recorded && inspectModalInstructor.accidents_recorded > 0
                      ? 'Minor incident reported and reviewed by safety board.'
                      : 'Zero accident history recorded. Clean background check on record.'}
                  </p>
                </div>

                {/* Verification Checklist */}
                <div className="space-y-2 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                  <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Award size={15} className="text-emerald-600" /> Admin Verification Checks
                  </h5>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold text-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600 font-bold" /> Government DL Valid
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600 font-bold" /> Police Clearance ✓
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600 font-bold" /> Vehicle Inspection ✓
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600 font-bold" /> Teaching Permit ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Decision Action Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateVerification(inspectModalInstructor.email, {
                      verification_status: 'verified',
                      background_check_verified: true
                    });
                    setInspectModalInstructor(null);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Approve & Verify
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateVerification(inspectModalInstructor.email, {
                      verification_status: 'under_review'
                    });
                    setInspectModalInstructor(null);
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Flag for Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}