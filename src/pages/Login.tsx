import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Capacitor } from '@capacitor/core';

// Official Google SVG Logo
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

// Custom High-Fidelity SVG Steering Wheel Logo
function DriveSmartLogo() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
      {/* Outer shadow circles */}
      <div className="absolute inset-0 bg-slate-100 rounded-full scale-105 shadow-inner"></div>
      <div className="absolute inset-2 bg-white rounded-full shadow-md"></div>
      
      {/* SVG Logo Graphic */}
      <svg viewBox="0 0 100 100" className="w-20 h-20 relative z-10">
        {/* Dark Blue Center Disc */}
        <circle cx="50" cy="50" r="42" fill="#0B1422" />
        
        {/* Yellow dashed guide ring */}
        <circle cx="50" cy="50" r="33" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.6" />
        
        {/* Steering Wheel Outer Ring */}
        <circle cx="50" cy="50" r="28" stroke="#F59E0B" strokeWidth="3.5" fill="none" />
        
        {/* Center Hub */}
        <circle cx="50" cy="50" r="7" fill="#F59E0B" />
        
        {/* Top Spoke & Pointer Arrow */}
        <path d="M50 12 L57 24 L52 24 L52 45 L48 45 L48 24 L43 24 Z" fill="#F59E0B" />
        
        {/* Left Spoke & Pointer Arrow */}
        <path d="M50 50 L25 42 L25 46 L17 46 L21 38 L27 42 Z" fill="#F59E0B" opacity="0.9" />
        
        {/* Right Spoke & Pointer Arrow */}
        <path d="M50 50 L75 42 L75 46 L83 46 L79 38 L73 42 Z" fill="#F59E0B" opacity="0.9" />
        
        {/* Bottom Curved Grip Line */}
        <path d="M36 65 C40 70 46 72 50 72 C54 72 60 70 64 65" stroke="#F59E0B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [showEmailInputStep, setShowEmailInputStep] = useState(false);

  // Verification code states
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpInputs, setOtpInputs] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(59);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { user, login, checkRoleConflict } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get current selected role from URL or sessionStorage
  const role = searchParams.get('role') || sessionStorage.getItem('selected_role') || 'learner';

  // Redirect if user session already exists
  useEffect(() => {
    // If we are currently handling an OAuth redirect hash, don't redirect yet.
    // This prevents clearing the hash before Supabase finishes parsing it.
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('id_token=') || hash.includes('error='))) {
      return;
    }

    if (user) {
      if (user.onboarded && user.role) {
        navigate(`/${user.role}`, { replace: true });
      } else {
        navigate('/role-select', { replace: true });
      }
    }
  }, [user, navigate]);

  // Handle otp countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifying && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isVerifying, countdown]);

  // Generate and send verification code
  const triggerVerification = async (targetEmail: string) => {
    if (!targetEmail) return;
    
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            emailRedirectTo: Capacitor.isNativePlatform()
              ? 'com.drivepro.app://login'
              : window.location.origin + '/login',
          }
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        setIsVerifying(true);
        setGeneratedCode('');
        setOtpInputs(Array(6).fill(''));
        setCountdown(59);
        toast.success("Verification code sent to your email!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to send verification code.");
      }
    } else {
      // Generate a random 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setIsVerifying(true);
      setCountdown(59);
      setOtpInputs(Array(6).fill(''));
      
      // Send beautiful feedback toast to mimic email reception
      toast.success(`Verification code generated!`, {
        description: `Sent to ${targetEmail}. Enter code: ${code}`,
        duration: 15000,
        action: {
          label: "Copy Code",
          onClick: () => {
            navigator.clipboard.writeText(code);
            toast.success("Code copied to clipboard!");
          }
        }
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const conflictCheck = await checkRoleConflict(email, role as any);
    if (conflictCheck.conflict) {
      toast.error(conflictCheck.message || "Role conflict detected");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: Capacitor.isNativePlatform()
                ? 'com.drivepro.app://login'
                : window.location.origin + '/login',
            }
          });
          if (error) {
            toast.error(error.message);
            return;
          }
          setIsVerifying(true);
          setGeneratedCode('');
          setOtpInputs(Array(6).fill(''));
          setCountdown(59);
          toast.success("Verification email sent! Please check your inbox for the code.");
        } catch (err) {
          console.error(err);
          toast.error("Registration failed. Please try again.");
        }
      } else {
        triggerVerification(email);
      }
    } else {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            if (error.message.includes("Email not confirmed")) {
              setIsVerifying(true);
              setGeneratedCode('');
              setOtpInputs(Array(6).fill(''));
              setCountdown(59);
              toast.info("Please verify your email address to continue.");
            } else {
              toast.error(error.message);
            }
            return;
          }
          toast.success("Logged in successfully!");
        } catch (err) {
          console.error(err);
          toast.error("Sign in failed. Please try again.");
        }
      } else {
        triggerVerification(email);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: Capacitor.isNativePlatform()
              ? 'com.drivepro.app://login'
              : window.location.origin + '/login',
          }
        });
        if (error) {
          toast.error(error.message);
        }
      } catch (err) {
        console.error('Google Sign-In error:', err);
        toast.error("Failed to initialize Google Sign-In");
      }
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (googleEmailInput) {
      const conflictCheck = await checkRoleConflict(googleEmailInput, role as any);
      if (conflictCheck.conflict) {
        toast.error(conflictCheck.message || "Role conflict detected");
        return;
      }
      setEmail(googleEmailInput);
      setShowGoogleModal(false);
      triggerVerification(googleEmailInput);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeEntered = otpInputs.join('');
    
    if (isSupabaseConfigured) {
      try {
        const targetEmail = email || googleEmailInput;
        const { error } = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: codeEntered,
          type: 'signup',
        });
        if (error) {
          // Fallback to type 'email' or 'magiclink' if they signed in via magic link OTP
          const { error: error2 } = await supabase.auth.verifyOtp({
            email: targetEmail,
            token: codeEntered,
            type: 'email',
          });
          if (error2) {
            toast.error(error2.message);
            return;
          }
        }
        toast.success("Email verified successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Verification failed. Please check the code.");
      }
    } else {
      if (codeEntered === generatedCode) {
        toast.success("Email verified successfully!");
        await login(email || googleEmailInput || 'learner@example.com');
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    }
  };

  const handleOtpInputChange = (value: string, index: number) => {
    const newInputs = [...otpInputs];
    newInputs[index] = value.slice(-1);
    setOtpInputs(newInputs);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    const targetEmail = email || googleEmailInput || 'learner@example.com';
    triggerVerification(targetEmail);
  };

  // Harmonized styling variables depending on the role selected
  const getThemeColorClass = () => {
    if (role === 'instructor') return 'text-green-500 hover:text-green-600';
    if (role === 'admin') return 'text-purple-500 hover:text-purple-600';
    return 'text-amber-500 hover:text-amber-600'; // learner / default
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[450px]">
        
        {/* Card Panel */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isVerifying ? (
              <motion.div
                key="signin-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back to role selection */}
                <button
                  type="button"
                  onClick={() => navigate('/role-select')}
                  className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center">
                  <ArrowLeft size={18} />
                </button>

                {/* Custom Steering Wheel Logo */}
                <DriveSmartLogo />

                <div className="text-center mb-8">
                  <h1 className="text-[26px] font-bold text-[#0B1422] tracking-tight mb-2 font-heading">
                    Sign in as <span className="capitalize text-slate-700">{role}</span>
                  </h1>
                  <p className="text-slate-400 text-[14px]">
                    Access your personalized portal
                  </p>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all border border-slate-200 shadow-sm active:scale-[0.98]">
                  <GoogleLogo />
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative px-4 bg-white text-xs font-semibold text-slate-400 uppercase tracking-widest">Or</span>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5" autoComplete="off">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoComplete="new-email"
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-[15px]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-[15px]"
                        required
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-[15px]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#0B1422] hover:bg-[#1A2E4C] text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-8 active:scale-[0.98] shadow-sm text-[16px]">
                    {isSignUp ? "Sign up" : "Sign in"}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className={`text-sm font-semibold transition-colors ${getThemeColorClass()}`}
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="verify-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center">
                  <ArrowLeft size={18} />
                </button>

                <DriveSmartLogo />

                <div className="text-center mb-8">
                  <h1 className="text-[26px] font-bold text-[#0B1422] tracking-tight mb-2 font-heading">
                    Verify Your Email
                  </h1>
                  <p className="text-slate-400 text-sm leading-relaxed px-4">
                    We've sent a 6-digit verification code to<br />
                    <span className="font-semibold text-slate-700">{email || googleEmailInput || 'your email'}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  {/* OTP 6-Box Grid */}
                  <div className="grid grid-cols-6 gap-2.5 max-w-[320px] mx-auto">
                    {otpInputs.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        onChange={(e) => handleOtpInputChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-11 h-13 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-800 focus:outline-none focus:border-[#0B1422] focus:bg-white transition-all shadow-sm"
                        required
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Resend Code Section */}
                  <div className="text-center pt-2">
                    {countdown > 0 ? (
                      <p className="text-slate-400 text-sm">
                        Resend code in <span className="font-medium text-slate-600">0:{countdown < 10 ? `0${countdown}` : countdown}</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1422] hover:text-[#1A2E4C] hover:underline transition-all">
                        <RotateCw size={14} /> Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0B1422] hover:bg-[#1A2E4C] text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 active:scale-[0.98] shadow-sm text-[16px]">
                    Verify & Continue
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Simulated Google Accounts Drawer/Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1422]/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-[450px] rounded-[24px] shadow-2xl overflow-hidden border border-slate-200 text-slate-700 font-sans flex flex-col p-8 md:p-10 select-none relative">
              
              {/* Google branding logo */}
              <div className="flex justify-center mb-6">
                <svg viewBox="0 0 24 24" width="75" height="30" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.896 0-8.91-4.014-8.91-8.91s4.014-8.91 8.91-8.91c2.478 0 4.545.923 6.136 2.454l3.164-3.164C18.6 1.159 15.655 0 12.24 0 5.482 0 0 5.482 0 12.24s5.482 12.24 12.24 12.24c7.05 0 11.727-4.964 11.727-11.945 0-.805-.073-1.425-.227-2.25H12.24z" fill="#4285F4"/>
                </svg>
              </div>

              {!showEmailInputStep ? (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Choose an account</h2>
                    <p className="text-sm text-slate-400 mt-1">to continue to <span className="font-semibold text-[#F59E0B]">DriveSmart AI</span></p>
                  </div>

                  {/* Account List */}
                  <div className="space-y-1 mb-8 divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
                    {[
                      {
                        name: 'Aarav Sharma',
                        email: 'learner@example.com',
                        label: 'Student',
                        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'
                      },
                      {
                        name: 'Vikram Singh',
                        email: 'vikram@drivepro.com',
                        label: 'Instructor',
                        photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=100&q=80'
                      }
                    ].map((account) => (
                      <button
                        key={account.email}
                        onClick={async () => {
                          const conflictCheck = await checkRoleConflict(account.email, role as any);
                          if (conflictCheck.conflict) {
                            toast.error(conflictCheck.message || "Role conflict detected");
                            return;
                          }
                          setEmail(account.email);
                          setGoogleEmailInput(account.email);
                          setShowGoogleModal(false);
                          triggerVerification(account.email);
                        }}
                        className="w-full text-left py-3 px-2 flex items-center gap-4 hover:bg-slate-50 transition-colors rounded-lg group">
                        <img src={account.photo} alt={account.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-[15px] group-hover:text-[#F59E0B] transition-colors">{account.name}</p>
                          <p className="text-xs text-slate-400">{account.email}</p>
                        </div>
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full capitalize">{account.label}</span>
                      </button>
                    ))}

                    <button
                      onClick={() => setShowEmailInputStep(true)}
                      className="w-full text-left py-4 px-2 flex items-center gap-4 hover:bg-slate-50 transition-colors rounded-lg text-slate-600 hover:text-slate-800 font-semibold text-[15px]">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Mail size={18} />
                      </div>
                      <span>Use another account</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sign in</h2>
                    <p className="text-sm text-slate-400 mt-1">with your Google Account to continue to <span className="font-semibold text-slate-700">DriveSmart AI</span></p>
                  </div>

                  <form onSubmit={handleGoogleSubmit} className="space-y-6">
                    <div>
                      <input
                        type="email"
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        placeholder="Email or phone"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all text-[15px]"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEmailInputStep(false)}
                        className="text-slate-500 font-semibold hover:text-slate-700 text-sm py-2 px-3 rounded-lg hover:bg-slate-100 transition-all">
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-[#0B1422] hover:bg-[#1A2E4C] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]">
                        Next
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Bottom footer bar */}
              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-6 mt-6">
                <div>English (United States)</div>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-slate-600">Help</a>
                  <a href="#" className="hover:text-slate-600">Privacy</a>
                  <a href="#" className="hover:text-slate-600">Terms</a>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowGoogleModal(false);
                  setShowEmailInputStep(false);
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
