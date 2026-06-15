import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Bike,
  Truck,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wallet,
  QrCode,
  ShieldCheck,
  Star } from
'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { db, mockLearner } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
import { InstructorProfile } from '../../lib/types';
import { getBasePrice, calculateTotalPrice, getSlotDisplay } from '../../lib/pricing';
import { supabaseService } from '../../lib/supabaseService';
import { useEffect } from 'react';
// --- Types ---
type VehicleType = 'Car' | 'Bike' | 'Truck';
type ModeType = 'single' | 'package_10' | 'package_20';
interface BookingState {
  vehicle: VehicleType | null;
  mode: ModeType | null;
  date: Date | null;
  timeSlot: string | null;
  instructor: InstructorProfile | null;
  paymentMethod: 'wallet' | 'upi' | null;
}
const TIME_SLOTS = [
'08:00',
'09:00',
'10:00',
'11:00',
'12:00',
'13:00',
'14:00',
'15:00',
'16:00',
'17:00'];

const isTimeSlotPassed = (date: Date, slot: string) => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (!isToday) {
    return date.getTime() < startOfDay(now).getTime();
  }
  const [hour, minute] = slot.split(':').map(Number);
  const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  return isBefore(slotTime, now);
};

export function BookingWizard() {
  const navigate = useNavigate();
  const { learnerProfile, updateLearnerProfile } = useAuth();
  const learner = learnerProfile || mockLearner;
  const [step, setStep] = useState(1);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [state, setState] = useState<BookingState>({
    vehicle: null,
    mode: null,
    date: null,
    timeSlot: null,
    instructor: null,
    paymentMethod: null
  });
  const [instructorsList, setInstructorsList] = useState<InstructorProfile[]>([]);
  useEffect(() => {
    const fetchInstructors = async () => {
      const data = await supabaseService.getInstructors();
      setInstructorsList(data);
    };
    fetchInstructors();
  }, []);
  const nextStep = () => setStep((s) => Math.min(5, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  // --- Step 1: Vehicle & Mode ---
  const Step1 = () =>
  <motion.div
    initial={{
      opacity: 0,
      x: 20
    }}
    animate={{
      opacity: 1,
      x: 0
    }}
    exit={{
      opacity: 0,
      x: -20
    }}
    className="space-y-8">
    
      <div>
        <h3 className="text-xl font-semibold mb-4">Select Vehicle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
        {
          id: 'Car',
          icon: Car,
          label: 'Car'
        },
        {
          id: 'Bike',
          icon: Bike,
          label: 'Two-Wheeler'
        },
        {
          id: 'Truck',
          icon: Truck,
          label: 'Heavy Vehicle'
        }].
        map((v) =>
        <button
          key={v.id}
          onClick={() =>
          setState({
            ...state,
            vehicle: v.id as VehicleType
          })
          }
          className={`glass-strong p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer ${state.vehicle === v.id ? 'border-primary-500 bg-primary-500/10 shadow-glow scale-105' : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'}`}>
          
              <v.icon
            size={40}
            className={
            state.vehicle === v.id ? 'text-primary-500' : 'text-navy-200'
            } />
          
              <span className={`font-semibold text-lg transition-colors ${state.vehicle === v.id ? 'text-primary-400' : 'text-white'}`}>{v.label}</span>
            </button>
        )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Select Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
        {
          id: 'single',
          label: 'Single Session',
          desc: '1 x 45 min',
          badge: null
        },
        {
          id: 'package_10',
          label: '10 Sessions',
          desc: '10% OFF',
          badge: 'Popular'
        },
        {
          id: 'package_20',
          label: '20 Sessions',
          desc: '20% OFF',
          badge: 'Best Value'
        }].
        map((m) =>
        <button
          key={m.id}
          onClick={() =>
          setState({
            ...state,
            mode: m.id as ModeType
          })
          }
          className={`glass p-4 rounded-2xl border-2 transition-all duration-300 relative cursor-pointer ${state.mode === m.id ? 'border-primary-500 bg-primary-500/10 scale-105 shadow-glow' : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'}`}>
          
              {m.badge &&
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {m.badge}
                </span>
          }
              <div className={`font-semibold transition-colors ${state.mode === m.id ? 'text-primary-400' : 'text-white'}`}>{m.label}</div>
              <div className={`text-sm mt-1 transition-colors ${state.mode === m.id ? 'text-primary-300' : 'text-primary-400'}`}>{m.desc}</div>
            </button>
        )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
        onClick={nextStep}
        disabled={!state.vehicle || !state.mode}
        className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
        
          Continue <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>;

  // --- Step 2: Date & Time ---
  const Step2 = () => {
    // Generate today and the next 6 days (total 7 days)
    const dates = Array.from({
      length: 7
    }).map((_, i) => addDays(new Date(), i));
    return (
      <motion.div
        initial={{
          opacity: 0,
          x: 20
        }}
        animate={{
          opacity: 1,
          x: 0
        }}
        exit={{
          opacity: 0,
          x: -20
        }}
        className="space-y-8">
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Select Date</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
            {dates.map((d, i) => {
              const isSelected = state.date?.toDateString() === d.toDateString();
              return (
                <button
                  key={i}
                  onClick={() =>
                  setState({
                    ...state,
                    date: d,
                    timeSlot: null
                  })
                  }
                  className={`snap-start shrink-0 w-20 h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? 'border-primary-500 bg-primary-500/10 shadow-glow' : 'glass border-transparent hover:border-white/20'}`}>
                  
                  <span className="text-xs text-navy-200 uppercase">
                    {format(d, 'MMM')}
                  </span>
                  <span
                    className={`text-2xl font-bold ${isSelected ? 'text-primary-500' : ''}`}>
                    
                    {format(d, 'dd')}
                  </span>
                  <span className="text-xs text-navy-200">
                    {format(d, 'EEE')}
                  </span>
                </button>);

            })}
          </div>
        </div>

        <AnimatePresence>
          {state.date &&
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}>
            
              <h3 className="text-xl font-semibold mb-4">Select Time Slot (45 min sessions)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {TIME_SLOTS.map((time) => {
                const isSelected = state.timeSlot === time;
                const price = getBasePrice(time);
                const isPeak = price === 300;
                const isPassed = isTimeSlotPassed(state.date!, time);
                return (
                  <button
                    key={time}
                    disabled={isPassed}
                    onClick={() =>
                    setState({
                      ...state,
                      timeSlot: time
                    })
                    }
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden ${
                      isPassed ? 'opacity-30 cursor-not-allowed bg-white/5 border-transparent' :
                      isSelected ? 'border-primary-500 bg-primary-500/10' : 'glass border-transparent hover:border-white/20'
                    }`}>
                    
                      {isPeak && !isPassed &&
                    <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500/20 rounded-bl-full" />
                    }
                      <span className="font-semibold">{getSlotDisplay(time)}</span>
                      <span
                      className={`text-xs ${isPassed ? 'text-navy-400' : isPeak ? 'text-orange-400' : 'text-navy-200'}`}>
                      
                        {isPassed ? 'Already passed' : `₹${price}`}
                      </span>
                    </button>);

              })}
              </div>
              <div className="mt-4 flex gap-4 text-sm text-navy-200">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-navy-700"></div>{' '}
                  Off-peak (₹260)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500/50"></div>{' '}
                  Peak (₹300)
                </span>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        <div className="flex justify-between pt-4">
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-xl font-medium text-navy-200 hover:text-white transition-colors">
            
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!state.date || !state.timeSlot}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
            
            Continue <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>);

  };
  const Step3 = () => {
    // Filter instructors based on vehicle
    const availableInstructors = instructorsList.filter((i) =>
    i.specialization.includes(state.vehicle!)
    );
    // Mock AI recommendation (pick highest rated)
    const recommended = [...availableInstructors].sort(
      (a, b) => b.rating - a.rating
    )[0];
    return (
      <motion.div
        initial={{
          opacity: 0,
          x: 20
        }}
        animate={{
          opacity: 1,
          x: 0
        }}
        exit={{
          opacity: 0,
          x: -20
        }}
        className="space-y-6">
        
        {/* AI Recommendation */}
        {recommended &&
        <div className="relative">
            <div className="absolute -top-3 left-6 bg-gradient-to-r from-primary-600 to-primary-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10 shadow-glow">
              <Sparkles size={12} /> AI Recommended
            </div>
            <div
            onClick={() =>
            setState({
              ...state,
              instructor: recommended
            })
            }
            className={`glass-strong p-6 rounded-2xl border-2 cursor-pointer transition-all ${state.instructor?.email === recommended.email ? 'border-primary-500 bg-primary-500/10 shadow-glow' : 'border-primary-500/30 hover:border-primary-500/50'}`}>
            
              <div className="flex items-start gap-4">
                <img
                src={recommended.photo_url}
                alt={recommended.name}
                className="w-16 h-16 rounded-xl object-cover" />
              
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        {recommended.name}
                        {recommended.auto_accept &&
                      <ShieldCheck
                        size={16}
                        className="text-green-400"
                        title="Auto-accepts bookings" />

                      }
                      </h4>
                      <p className="text-sm text-navy-200">
                        {recommended.experience_years} years exp •{' '}
                        {recommended.specialization.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-navy-900/80 px-2 py-1 rounded-lg">
                      <Star
                      size={14}
                      className="text-yellow-400 fill-yellow-400" />
                    
                      <span className="font-bold">{recommended.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-navy-300 mt-3 italic">
                    "{recommended.bio}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        }

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Other Available Instructors</h3>
          {availableInstructors.
          filter((i) => i.email !== recommended?.email).
          map((instructor) =>
          <div
            key={instructor.email}
            onClick={() =>
            setState({
              ...state,
              instructor
            })
            }
            className={`glass p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${state.instructor?.email === instructor.email ? 'border-primary-500 bg-primary-500/10' : 'border-transparent hover:border-white/20'}`}>
            
                <img
              src={instructor.photo_url}
              alt={instructor.name}
              className="w-12 h-12 rounded-full object-cover" />
            
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    {instructor.name}
                    {instructor.auto_accept &&
                <ShieldCheck size={14} className="text-green-400" />
                }
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-navy-200 mt-1">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400" />{' '}
                      {instructor.rating}
                    </span>
                    <span>{instructor.experience_years}y exp</span>
                  </div>
                </div>
              </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-xl font-medium text-navy-200 hover:text-white transition-colors">
            
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!state.instructor}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
            
            Continue <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>);

  };
  // --- Step 4: Payment ---
  const Step4 = () => {
    const sessionsCount =
    state.mode === 'single' ? 1 : state.mode === 'package_10' ? 10 : 20;
    const pricing = calculateTotalPrice([state.timeSlot!], sessionsCount);
    return (
      <motion.div
        initial={{
          opacity: 0,
          x: 20
        }}
        animate={{
          opacity: 1,
          x: 0
        }}
        exit={{
          opacity: 0,
          x: -20
        }}
        className="space-y-6">
        
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-4">
            Booking Summary
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-navy-200">Vehicle</span>
              <span className="font-medium">{state.vehicle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-200">Date & Time</span>
              <span className="font-medium">
                {state.date ? format(state.date, 'MMM dd, yyyy') : ''} at{' '}
                {getSlotDisplay(state.timeSlot || '')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-200">Instructor</span>
              <span className="font-medium">{state.instructor?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-200">Package</span>
              <span className="font-medium">{sessionsCount} Session(s)</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-navy-200">Subtotal</span>
              <span>₹{pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.discountAmount > 0 &&
            <div className="flex justify-between text-sm text-green-400">
                <span>Package Discount</span>
                <span>-₹{pricing.discountAmount.toFixed(2)}</span>
              </div>
            }
            <div className="flex justify-between text-sm">
              <span className="text-navy-200">GST (18%)</span>
              <span>₹{pricing.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10 mt-2">
              <span>Total</span>
              <span className="text-primary-500">
                ₹{pricing.final.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
              setState({
                ...state,
                paymentMethod: 'wallet'
              })
              }
              className={`glass p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${state.paymentMethod === 'wallet' ? 'border-primary-500 bg-primary-500/10' : 'border-transparent hover:border-white/20'}`}>
              
              <Wallet
                size={24}
                className={
                state.paymentMethod === 'wallet' ?
                'text-primary-500' :
                'text-navy-200'
                } />
              
              <span className="font-medium">Wallet</span>
              <span className="text-xs text-navy-300">
                Bal: ₹{learner.wallet_balance}
              </span>
            </button>
            <button
              onClick={() =>
              setState({
                ...state,
                paymentMethod: 'upi'
              })
              }
              className={`glass p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${state.paymentMethod === 'upi' ? 'border-primary-500 bg-primary-500/10' : 'border-transparent hover:border-white/20'}`}>
              
              <QrCode
                size={24}
                className={
                state.paymentMethod === 'upi' ?
                'text-primary-500' :
                'text-navy-200'
                } />
              
              <span className="font-medium">UPI / QR</span>
              <span className="text-xs text-navy-300">Instant</span>
            </button>
          </div>
          {state.paymentMethod === 'wallet' &&
          learner.wallet_balance < pricing.final &&
          <p className="text-red-400 text-sm mt-2 text-center">
                Insufficient wallet balance.
              </p>
          }
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={prevStep}
            className="px-6 py-3 rounded-xl font-medium text-navy-200 hover:text-white transition-colors">
            
            Back
          </button>
          <button
            onClick={() => {
              if (
              state.paymentMethod === 'wallet' &&
              learner.wallet_balance < pricing.final)
              {
                toast.error('Insufficient balance');
                return;
              }
              // Simulate API call
              const isAutoConfirm = state.instructor?.auto_accept;
              toast.promise(
                new Promise(async (resolve, reject) => {
                  try {
                    if (state.paymentMethod === 'wallet') {
                      await updateLearnerProfile({
                        wallet_balance: learner.wallet_balance - pricing.final,
                        total_sessions: learner.total_sessions + sessionsCount
                      });
                    } else {
                      await updateLearnerProfile({
                        total_sessions: learner.total_sessions + sessionsCount
                      });
                    }

                    // Record the debit transaction
                    const newTx = {
                      type: 'debit',
                      title: `Session with ${state.instructor!.name}`,
                      amount: pricing.final,
                      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    };
                    await supabaseService.addLearnerTransaction(learner.email, newTx);

                    const bId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;
                    setConfirmedBookingId(bId);
                    await supabaseService.addBooking({
                      id: bId,
                      learner_email: learner.email,
                      learner_name: learner.name,
                      instructor_email: state.instructor!.email,
                      instructor_name: state.instructor!.name,
                      date: format(state.date!, 'yyyy-MM-dd'),
                      time_slot: state.timeSlot!,
                      status: 'pending',
                      vehicle_type: state.vehicle!,
                      price: pricing.final,
                      payment_status: 'paid'
                    });
                    
                    setTimeout(() => resolve(true), 1000);
                  } catch (err) {
                    reject(err);
                  }
                }),
                {
                  loading: 'Processing payment...',
                  success: () => {
                    nextStep();
                    return 'Booking request sent!';
                  },
                  error: 'Payment failed'
                }
              );
            }}
            disabled={!state.paymentMethod}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-glow">
            
            Pay ₹{pricing.final.toFixed(0)}
          </button>
        </div>
      </motion.div>);

  };
  // --- Step 5: Confirmation ---
  const Step5 = () => {
    return (
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        className="text-center space-y-6 py-8">
        
        <motion.div
          initial={{
            scale: 0
          }}
          animate={{
            scale: 1
          }}
          transition={{
            type: 'spring',
            bounce: 0.5
          }}
          className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          
          <CheckCircle2 size={48} />
        </motion.div>

        <h2 className="text-3xl font-bold">
          Request Sent!
        </h2>

        <p className="text-navy-200 max-w-md mx-auto">
          Your request has been sent to {state.instructor?.name}. You will be notified once they accept.
        </p>

        <div className="glass inline-block p-4 rounded-xl border border-white/10 mt-8">
          <p className="text-sm text-navy-300 mb-1">Booking Reference</p>
          <p className="font-mono font-bold text-lg tracking-wider">
            {confirmedBookingId || `BKG-${Math.floor(1000 + Math.random() * 9000)}`}
          </p>
        </div>

        <div className="pt-8">
          <button
            onClick={() => navigate('/learner')}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all">
            
            Return to Dashboard
          </button>
        </div>
      </motion.div>);

  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book a Lesson</h1>
        <p className="text-navy-200">
          Follow the steps to schedule your next drive.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-navy-800 -translate-y-1/2 rounded-full z-0"></div>
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
            style={{
              width: `${(step - 1) / 4 * 100}%`
            }}>
          </motion.div>

          {[
          {
            num: 1,
            icon: Car
          },
          {
            num: 2,
            icon: CalendarIcon
          },
          {
            num: 3,
            icon: User
          },
          {
            num: 4,
            icon: Wallet
          },
          {
            num: 5,
            icon: CheckCircle2
          }].
          map((s) =>
          <div
            key={s.num}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${step >= s.num ? 'bg-primary-500 text-white shadow-glow' : 'bg-navy-800 text-navy-400'}`}>
            
              <s.icon size={18} />
            </div>
          )}
        </div>
      </div>

      {/* Wizard Content */}
      <div className="glass-strong rounded-3xl p-6 md:p-10 border border-white/10 min-h-[500px]">
        <AnimatePresence mode="wait">
          {step === 1 && <Step1 key="step1" />}
          {step === 2 && <Step2 key="step2" />}
          {step === 3 && <Step3 key="step3" />}
          {step === 4 && <Step4 key="step4" />}
          {step === 5 && <Step5 key="step5" />}
        </AnimatePresence>
      </div>
    </div>);

}