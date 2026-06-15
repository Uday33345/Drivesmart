import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function Splash() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const duration = 6000; // 6 seconds
    const intervalTime = 50;
    const stepsCount = duration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const percent = Math.min((currentStep / stepsCount) * 100, 100);
      setProgress(percent);

      if (percent < 25) {
        setLoadingStep(0);
      } else if (percent < 50) {
        setLoadingStep(1);
      } else if (percent < 75) {
        setLoadingStep(2);
      } else {
        setLoadingStep(3);
      }

      if (currentStep >= stepsCount) {
        clearInterval(progressInterval);
        setIsDone(true);
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, []);

  // Handle navigation after 6 seconds loader is completed
  useEffect(() => {
    if (isDone) {
      if (user) {
        if (user.onboarded && user.role) {
          navigate(`/${user.role}`, { replace: true });
        } else {
          navigate('/role-select', { replace: true });
        }
      } else {
        navigate('/role-select', { replace: true });
      }
    }
  }, [isDone, user, navigate]);

  return (
    <div className="min-h-screen app-bg flex flex-col items-center justify-center p-6 text-white font-body select-none">
      {/* Glowing floating steering wheel container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex items-center justify-center w-32 h-32 mb-8"
      >
        {/* Pulsing neon outer glow */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        
        {/* Logo Circle */}
        <div className="absolute inset-0 bg-navy-600 rounded-full border border-white/10 flex items-center justify-center shadow-2xl">
          {/* Steering Wheel SVG */}
          <svg viewBox="0 0 100 100" className="w-24 h-24 animate-[spin_10s_linear_infinite] text-amber-500">
            <circle cx="50" cy="50" r="42" fill="#0B1422" />
            <circle cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.6" />
            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="3.5" fill="none" />
            <circle cx="50" cy="50" r="7" fill="currentColor" />
            <path d="M50 12 L57 24 L52 24 L52 45 L48 45 L48 24 L43 24 Z" fill="currentColor" />
            <path d="M50 50 L25 42 L25 46 L17 46 L21 38 L27 42 Z" fill="currentColor" opacity="0.9" />
            <path d="M50 50 L75 42 L75 46 L83 46 L79 38 L73 42 Z" fill="currentColor" opacity="0.9" />
            <path d="M36 65 C40 70 46 72 50 72 C54 72 60 70 64 65" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      {/* Brand Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold font-heading tracking-wide mb-1">
          Drive<span className="text-amber-500">Pro</span> AI
        </h2>
        <p className="text-xs text-navy-200 uppercase tracking-widest font-semibold">
          Next Generation Driver Education
        </p>
      </motion.div>

      {/* Loader Progress & Status Texts */}
      <div className="w-full max-w-[280px] space-y-4">
        {/* Smooth loader bar */}
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated step status text */}
        <div className="text-center h-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {loadingStep === 0 && (
              <motion.p
                key="step0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-navy-100 font-medium font-mono"
              >
                Establishing secure connection...
              </motion.p>
            )}
            {loadingStep === 1 && (
              <motion.p
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-blue-400 font-medium font-mono"
              >
                Retrieving cloud profiles...
              </motion.p>
            )}
            {loadingStep === 2 && (
              <motion.p
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-amber-400 font-medium font-mono"
              >
                Syncing configurations...
              </motion.p>
            )}
            {loadingStep === 3 && (
              <motion.p
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-emerald-400 font-medium font-mono"
              >
                Welcome to DrivePro AI!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}