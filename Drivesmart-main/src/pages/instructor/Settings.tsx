import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Clock, Shield, IndianRupee, Car, Bike, Truck, Check, FileCheck, Upload, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
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
  const [specialization, setSpecialization] = useState<string[]>(
    instructor.specialization && instructor.specialization.length > 0
      ? instructor.specialization
      : ['Car']
  );

  const [gender, setGender] = useState<'male' | 'female' | 'other'>(instructor.gender || 'female');
  const [dlNumber, setDlNumber] = useState(instructor.dl_number || '');
  const [experienceYears, setExperienceYears] = useState<number | string>(
    instructor.experience_years !== undefined && instructor.experience_years > 0
      ? instructor.experience_years
      : ''
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dlFileName, setDlFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setDlFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDlDocumentUrl(result);
      toast.success(`Selected file "${file.name}" from your machine!`);
    };
    reader.readAsDataURL(file);
  };
  const [dlDocumentUrl, setDlDocumentUrl] = useState(instructor.dl_document_url || '');
  const [verificationStatus, setVerificationStatus] = useState<
    'verified' | 'pending' | 'under_review' | 'rejected'
  >(instructor.verification_status || 'pending');

  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(
    instructor.photo_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80'
  );

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      await updateInstructorProfile({ photo_url: result });
      toast.success('Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (instructor) {
      setName(instructor.name || '');
      setPhone(instructor.phone || '');
      setBio(instructor.bio || '');
      if (instructor.photo_url) setPhotoUrl(instructor.photo_url);
      if (instructor.gender) setGender(instructor.gender);

      const loadedDl = instructor.dl_number && instructor.dl_number !== 'DL-2024-VERIFIED' ? instructor.dl_number : '';
      setDlNumber(loadedDl);
      setExperienceYears(instructor.experience_years !== undefined && instructor.experience_years > 0 ? instructor.experience_years : '');
      setDlDocumentUrl(instructor.dl_document_url || '');

      const docUploaded = Boolean(instructor.dl_document_url);
      const dlValid = Boolean(loadedDl);
      const isApprovedByAdmin = instructor.verification_status === 'verified' && docUploaded && dlValid;

      setVerificationStatus(
        isApprovedByAdmin
          ? 'verified'
          : instructor.verification_status === 'under_review' || instructor.verification_status === 'rejected'
          ? instructor.verification_status
          : 'pending'
      );

      setAutoAccept(instructor.auto_accept);
      setPrice(instructor.price_per_session || 250);
      setAvailability(instructor.availability || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      if (instructor.specialization && instructor.specialization.length > 0) {
        setSpecialization(instructor.specialization);
      }
    }
  }, [instructor]);

  const handleToggleDay = (day: string) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter((d) => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  const handleToggleSpecialization = (veh: string) => {
    const isSelected = specialization.includes(veh) || (veh === 'Truck' && specialization.includes('Heavy Vehicle'));
    if (isSelected) {
      if (specialization.length <= 1) {
        toast.error('You must select at least one vehicle type');
        return;
      }
      setSpecialization(specialization.filter((s) => s !== veh && s !== 'Heavy Vehicle'));
    } else {
      setSpecialization([...specialization, veh]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlNumber) {
      toast.error('Please enter your Driving License (DL) Number');
      return;
    }

    try {
      await updateInstructorProfile({
        name,
        phone,
        bio,
        photo_url: photoUrl,
        gender,
        dl_number: dlNumber,
        experience_years: Number(experienceYears),
        dl_document_url: dlDocumentUrl,
        verification_status: 'pending',
        specialization,
        auto_accept: autoAccept,
        price_per_session: price,
        availability
      });
      setVerificationStatus('pending');
      toast.success('Verification details submitted to Admin! Your profile will be visible to learners once audited & approved by Admin.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit verification details');
    }
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
            {/* Hidden Profile Photo Input */}
            <input
              type="file"
              ref={photoInputRef}
              onChange={handlePhotoFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div className="col-span-1 md:col-span-2 flex items-center gap-6">
              <img
                src={photoUrl || instructor.photo_url}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-primary-500/50 object-cover shadow-md"
              />
              
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload size={16} /> Change Photo
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

            {/* Gender Selection Section */}
            <div className="col-span-1 md:col-span-2 space-y-2.5 bg-navy-950/60 border border-white/10 p-4 rounded-2xl">
              <label className="text-sm text-white font-bold flex items-center gap-2">
                Instructor Gender / Verification Identity
              </label>
              <p className="text-xs text-navy-200">
                Select your gender so female learners requesting female driving instructors can be automatically mapped to your profile.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                {[
                  { id: 'female', label: '🌸 Female Instructor' },
                  { id: 'male', label: '👨 Male Instructor' },
                  { id: 'other', label: '✨ Prefer Not to Say' }
                ].map((g) => {
                  const isSelected = gender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-primary-500 text-white border-primary-400 shadow-glow-sm scale-[1.02]'
                          : 'bg-navy-900/50 text-navy-200 border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {g.label} {isSelected ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
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

        {/* Account Verification & Driving License Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="glass rounded-3xl p-6 md:p-8 space-y-6 border border-white/10"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <FileCheck className="text-primary-500" />
              <div>
                <h2 className="text-xl font-semibold">Account Verification & License Upload</h2>
                <p className="text-xs text-navy-200 mt-0.5">Submit your Driving License & Experience details for Admin Audit & Approval.</p>
              </div>
            </div>

            {/* Live Verification Status Pill */}
            <div>
              {verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 size={14} /> Verified & Visible to Students
                </span>
              )}
              {verificationStatus === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Clock3 size={14} /> Pending Admin Audit & Approval
                </span>
              )}
              {(verificationStatus === 'under_review' || verificationStatus === 'rejected') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                  <AlertTriangle size={14} /> Under Review / Re-upload Required
                </span>
              )}
            </div>
          </div>

          {/* Verification Status Banner Alert */}
          {verificationStatus === 'pending' && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
              <Clock3 className="text-amber-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm text-amber-300">Verification Pending Admin Approval</h4>
                <p className="text-xs text-navy-200 mt-0.5">
                  Your verification dossier (DL Number: <strong>{dlNumber}</strong>, Experience: <strong>{experienceYears} Years</strong>) is submitted. You will automatically become visible on the Learner Dashboard once the Admin approves your account!
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'verified' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-sm text-emerald-300">Account Approved & Live</h4>
                <p className="text-xs text-navy-200 mt-0.5">
                  Your instructor profile is audited and approved by Admin. Students can view your profile and book lessons!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Driving License Number */}
            <div className="space-y-2">
              <label className="text-sm text-navy-200 font-medium">Driving License (DL) Number *</label>
              <input
                type="text"
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                placeholder="Enter your DL Number (e.g. DL-142011001234)"
                className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors uppercase font-mono text-sm placeholder:text-navy-400 placeholder:font-sans placeholder:normal-case"
              />
            </div>

            {/* Years of Driving Experience */}
            <div className="space-y-2">
              <label className="text-sm text-navy-200 font-medium font-display">Years of Driving Experience *</label>
              <input
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter years of driving experience"
                className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors text-sm placeholder:text-navy-400"
              />
            </div>

            {/* Hidden native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, application/pdf"
              className="hidden"
            />

            {/* DL Document Upload Dropzone */}
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm text-navy-200 font-medium">Driving License Document / Photo *</label>
              {dlDocumentUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-navy-950/60 p-4 rounded-2xl border border-white/10">
                  {dlDocumentUrl.startsWith('data:application/pdf') ? (
                    <div className="w-32 h-20 rounded-xl bg-primary-500/20 border border-primary-500/40 flex flex-col items-center justify-center text-primary-300 shrink-0 p-2 text-center">
                      <FileCheck size={28} />
                      <span className="text-[10px] font-bold mt-1 truncate max-w-full">{dlFileName || 'DL_Document.pdf'}</span>
                    </div>
                  ) : (
                    <img
                      src={dlDocumentUrl}
                      alt="Driving License Document"
                      className="w-32 h-20 rounded-xl object-cover border border-white/20 shrink-0"
                    />
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-white">License Document Selected</h4>
                    <p className="text-[11px] text-navy-300 mt-0.5">{dlFileName ? `File: ${dlFileName}` : 'Government Driving License document attached.'}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      <Upload size={13} /> Select Different File from Machine
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 bg-navy-950/40 hover:bg-navy-900/60 p-6 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="p-3 rounded-full bg-primary-500/10 text-primary-400 group-hover:scale-110 transition-transform">
                    <Upload size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Click to Choose Driving License File from Machine</p>
                    <p className="text-xs text-navy-300 mt-0.5">Select a photo (PNG/JPG) or PDF file from your computer (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Vehicles Taught / Specializations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-3xl p-6 md:p-8">
          
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Car className="text-primary-500" />
            <div>
              <h2 className="text-xl font-semibold">Vehicles Taught (Specializations)</h2>
              <p className="text-xs text-navy-200 mt-0.5">Select all vehicle categories you offer instruction for. Students filtering by vehicle will see your profile.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'Car', label: 'Car', icon: Car, desc: 'Four-Wheeler Driving' },
              { id: 'Bike', label: 'Bike / Two-Wheeler', icon: Bike, desc: 'Motorcycle & Scooter' },
              { id: 'Truck', label: 'Heavy Vehicle', icon: Truck, desc: 'Commercial & Trucks' }
            ].map((v) => {
              const isSelected = specialization.includes(v.id) || (v.id === 'Truck' && specialization.includes('Heavy Vehicle'));
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleToggleSpecialization(v.id)}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 cursor-pointer relative ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/15 text-white shadow-glow-sm scale-[1.02]'
                      : 'bg-navy-900/40 border-white/10 text-navy-300 hover:border-white/30 hover:bg-navy-900/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                      <Check size={12} />
                    </div>
                  )}
                  <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary-500 text-white' : 'bg-navy-800 text-navy-400'}`}>
                    <v.icon size={26} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{v.label}</h4>
                    <p className="text-xs text-navy-200 mt-1">{v.desc}</p>
                  </div>
                  <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider mt-1 ${
                    isSelected ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40' : 'bg-navy-800 text-navy-400'
                  }`}>
                    {isSelected ? 'Selected' : '+ Select'}
                  </span>
                </button>
              );
            })}
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