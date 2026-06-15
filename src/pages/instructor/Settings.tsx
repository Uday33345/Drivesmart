import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Clock, Shield, IndianRupee } from 'lucide-react';
import { mockInstructorSelf } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function InstructorSettings() {
  const { instructorProfile, updateInstructorProfile } = useAuth();
  const instructor = instructorProfile || mockInstructorSelf;

  const [name, setName] = useState(instructor.name);
  const [phone, setPhone] = useState(instructor.phone);
  const [bio, setBio] = useState(instructor.bio);
  const [autoAccept, setAutoAccept] = useState(instructor.auto_accept);
  const [price, setPrice] = useState(instructor.price_per_session);
  const [availability, setAvailability] = useState<string[]>(instructor.availability);

  useEffect(() => {
    if (instructor) {
      setName(instructor.name);
      setPhone(instructor.phone);
      setBio(instructor.bio);
      setAutoAccept(instructor.auto_accept);
      setPrice(instructor.price_per_session);
      setAvailability(instructor.availability);
    }
  }, [instructor]);

  const handleToggleDay = (day: string) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter((d) => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateInstructorProfile({
      name,
      phone,
      bio,
      auto_accept: autoAccept,
      price_per_session: price,
      availability
    });
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Settings</h1>
        <p className="text-navy-200 mt-1">
          Manage your profile and preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 md:p-8">
          
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <User className="text-primary-500" />
            <h2 className="text-xl font-semibold">Public Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 flex items-center gap-6">
              <img
                src={instructor.photo_url}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-primary-500/50 object-cover" />
              
              <button
                type="button"
                onClick={() => toast.info('Photo upload simulation active')}
                className="glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                Change Photo
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-navy-200">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-navy-200">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm text-navy-200">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none" />
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 md:p-8">
          
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Shield className="text-primary-500" />
            <h2 className="text-xl font-semibold">Booking Preferences</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-navy-900/30 rounded-xl border border-white/5">
              <div>
                <h4 className="font-medium text-white">Auto-Accept Bookings</h4>
                <p className="text-sm text-navy-200 mt-1">
                  Automatically confirm booking requests that fit your schedule
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoAccept(!autoAccept)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoAccept ? 'bg-primary-500' : 'bg-navy-600'}`}>
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${autoAccept ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-navy-200 flex items-center gap-2">
                <IndianRupee size={16} /> Base Price per Session (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full md:w-1/2 bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors" />
            </div>
          </div>
        </motion.div>

        {/* Schedule Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6 md:p-8">
          
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Clock className="text-primary-500" />
            <h2 className="text-xl font-semibold">Availability</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-navy-200">
              Select the days you are available for lessons:
            </p>
            <div className="flex flex-wrap gap-3">
              {[
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday'].
              map((day) => {
                const isActive = availability.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' : 'glass text-navy-300 hover:text-white'}`}>
                    {day}
                  </button>);
              })}
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-glow-sm">
            <Save size={20} /> Save Changes
          </button>
        </div>
      </form>
    </div>);
}