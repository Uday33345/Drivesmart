import React, { useState, createContext, useContext, useEffect } from 'react';
import { User, Role, LearnerProfile, InstructorProfile } from '../lib/types';
import { db, mockLearner, mockInstructorSelf } from '../data/mockDb';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  learnerProfile: LearnerProfile | null;
  instructorProfile: InstructorProfile | null;
  updateLearnerProfile: (updates: Partial<LearnerProfile>) => Promise<void>;
  updateInstructorProfile: (updates: Partial<InstructorProfile>) => Promise<void>;
  loading: boolean;
  checkRoleConflict: (email: string, targetRole: Role) => Promise<{ conflict: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getNameFromEmail(email: string): string {
  const namePart = email.split('@')[0];
  const cleaned = namePart.replace(/[0-9]+/g, '').replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'User';
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function checkRoleConflict(email: string, targetRole: Role): Promise<{ conflict: boolean; message?: string }> {
  if (targetRole === 'admin') {
    return { conflict: false };
  }

  const conflictingRole = targetRole === 'learner' ? 'instructor' : 'learner';

  if (isSupabaseConfigured) {
    try {
      const table = conflictingRole === 'learner' ? 'learners' : 'instructors';
      const { data, error } = await supabase
        .from(table)
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error checking role conflict:', error);
        return { conflict: false };
      }

      if (data) {
        const registeredRole = conflictingRole === 'learner' ? 'Student (Learner)' : 'Instructor';
        const attemptedRole = targetRole === 'learner' ? 'Student (Learner)' : 'Instructor';
        return {
          conflict: true,
          message: `This email is permanently registered as a ${registeredRole} account. A ${registeredRole} account cannot be used or converted into a ${attemptedRole} account.`,
        };
      }
    } catch (err) {
      console.error('Error checking role conflict:', err);
    }
  } else {
    if (conflictingRole === 'learner') {
      const learner = db.getLearner(email);
      if (learner) {
        return {
          conflict: true,
          message: `This email is already registered as a Learner. A learner account cannot be used as an Instructor.`,
        };
      }
    } else {
      const instructor = db.getInstructor(email);
      if (instructor) {
        return {
          conflict: true,
          message: `This email is already registered as an Instructor. An instructor account cannot be used as a Learner.`,
        };
      }
    }
  }

  return { conflict: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string) => {
    setLoading(true);

    if (email.toLowerCase() === 'udaybhanu33345@gmail.com') {
      sessionStorage.setItem('selected_role', 'admin');
      setUser({
        email,
        role: 'admin',
        onboarded: true,
      });
      setLoading(false);
      return;
    }

    const selectedRole = sessionStorage.getItem('selected_role') as Role | null;
    
    if (selectedRole) {
      if (selectedRole === 'learner') {
        let profile = db.getLearner(email);
        if (!profile) {
          profile = {
            email,
            name: getNameFromEmail(email),
            phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
            level: 'Beginner',
            driving_score: 0,
            total_sessions: 0,
            wallet_balance: 0,
            preferred_vehicle: 'Car',
            goal: 'Obtain my driving license',
            test_ready: false,
            photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
          };
          db.learners.push(profile);
        }
        setLearnerProfile(profile);
      } else if (selectedRole === 'instructor') {
        let profile = db.getInstructor(email);
        if (!profile) {
          profile = {
            email,
            name: getNameFromEmail(email),
            phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
            specialization: ['Car'],
            experience_years: 5,
            rating: 4.8,
            total_reviews: 12,
            availability: ['Monday', 'Wednesday', 'Friday'],
            time_slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
            auto_accept: true,
            price_per_session: 260,
            bio: 'Experienced and friendly driving instructor certified for safe driving lessons.',
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            status: 'active',
            total_earnings: 0,
            total_sessions: 0,
          };
          db.instructors.push(profile);
        }
        setInstructorProfile(profile);
      }
      setUser({
        email,
        role: selectedRole,
        onboarded: true,
      });
    } else {
      setUser({
        email,
        role: null,
        onboarded: false,
      });
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    setLearnerProfile(null);
    setInstructorProfile(null);
    sessionStorage.removeItem('selected_role');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out from Supabase Auth:', err);
      }
    }
    setLoading(false);
  };

  const setRole = async (role: Role) => {
    if (!user) return;
    setLoading(true);

    if (role === 'admin' && user.email.toLowerCase() !== 'udaybhanu33345@gmail.com') {
      setLoading(false);
      throw new Error('Unauthorized: Only udaybhanu33345@gmail.com is allowed Admin access.');
    }

    if (user.email.toLowerCase() === 'udaybhanu33345@gmail.com') {
      sessionStorage.setItem('selected_role', 'admin');
      setUser({
        ...user,
        role: 'admin',
        onboarded: true,
      });
      setLoading(false);
      return;
    }

    const conflictCheck = await checkRoleConflict(user.email, role);
    if (conflictCheck.conflict) {
      setLoading(false);
      throw new Error(conflictCheck.message);
    }

    if (isSupabaseConfigured) {
      try {
        if (role === 'learner') {
          const { data: existing } = await supabase
            .from('learners')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          if (!existing) {
            const newProfile = {
              email: user.email,
              name: getNameFromEmail(user.email),
              phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
              level: 'Beginner' as const,
              driving_score: 0,
              total_sessions: 0,
              wallet_balance: 0,
              preferred_vehicle: 'Car' as const,
              goal: 'Obtain my driving license',
              test_ready: false,
              photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
            };
            await supabase.from('learners').insert([newProfile]);
            setLearnerProfile(newProfile as LearnerProfile);
          } else {
            setLearnerProfile(existing as LearnerProfile);
          }
        } else if (role === 'instructor') {
          const { data: existing } = await supabase
            .from('instructors')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          if (!existing) {
            const newProfile = {
              email: user.email,
              name: getNameFromEmail(user.email),
              phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
              specialization: ['Car' as const],
              experience_years: 0,
              rating: 5.0,
              total_reviews: 0,
              availability: ['Monday', 'Wednesday', 'Friday'],
              time_slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
              auto_accept: true,
              price_per_session: 250,
              bio: 'Certified driving instructor.',
              photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              status: 'active' as const,
              verification_status: 'pending' as const,
              dl_number: '',
              dl_document_url: '',
              total_earnings: 0,
              total_sessions: 0,
            };
            await supabase.from('instructors').insert([newProfile]);
            setInstructorProfile(newProfile as InstructorProfile);
          } else {
            setInstructorProfile(existing as InstructorProfile);
          }
        }
      } catch (err) {
        console.error('Error setting role in Supabase:', err);
      } finally {
        setLoading(false);
      }
    } else {
      if (role === 'learner') {
        let profile = db.getLearner(user.email);
        if (!profile) {
          profile = {
            email: user.email,
            name: getNameFromEmail(user.email),
            phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
            level: 'Beginner',
            driving_score: 0,
            total_sessions: 0,
            wallet_balance: 0,
            preferred_vehicle: 'Car',
            goal: 'Obtain my driving license',
            test_ready: false,
            photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
          };
          db.learners.push(profile);
        }
        setLearnerProfile(profile);
      } else if (role === 'instructor') {
        let profile = db.getInstructor(user.email);
        if (!profile) {
          profile = {
            email: user.email,
            name: getNameFromEmail(user.email),
            phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
            specialization: ['Car'],
            experience_years: 5,
            rating: 4.8,
            total_reviews: 12,
            availability: ['Monday', 'Wednesday', 'Friday'],
            time_slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
            auto_accept: true,
            price_per_session: 260,
            bio: 'Experienced and friendly driving instructor certified for safe driving lessons.',
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            status: 'active',
            total_earnings: 0,
            total_sessions: 0,
          };
          db.instructors.push(profile);
        }
        setInstructorProfile(profile);
      }
      setLoading(false);
    }

    sessionStorage.setItem('selected_role', role);
    setUser({
      ...user,
      role,
      onboarded: true,
    });
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkAndSync = async (sessionUserEmail: string | undefined) => {
      if (!sessionUserEmail) {
        setUser(null);
        setLearnerProfile(null);
        setInstructorProfile(null);
        return;
      }
      
      setLoading(true);
      try {
        // Exclusive Super Admin email check: udaybhanu33345@gmail.com
        if (sessionUserEmail.toLowerCase() === 'udaybhanu33345@gmail.com') {
          sessionStorage.setItem('selected_role', 'admin');
          setUser({ email: sessionUserEmail, role: 'admin', onboarded: true });
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const urlRole = urlParams.get('role') as Role | null;
        if (urlRole) {
          sessionStorage.setItem('selected_role', urlRole);
        }

        const selectedRole = (urlRole || sessionStorage.getItem('selected_role')) as Role | null;
        if (selectedRole === 'admin' && sessionUserEmail.toLowerCase() !== 'udaybhanu33345@gmail.com') {
          toast.error('Unauthorized: Only udaybhanu33345@gmail.com can access the Admin dashboard.');
          sessionStorage.removeItem('selected_role');
          setUser({ email: sessionUserEmail, role: null, onboarded: false });
          return;
        }

        if (selectedRole) {
          const conflictCheck = await checkRoleConflict(sessionUserEmail, selectedRole);
          if (conflictCheck.conflict) {
            toast.error(conflictCheck.message || 'Role conflict detected.');
            setUser(null);
            setLearnerProfile(null);
            setInstructorProfile(null);
            sessionStorage.removeItem('selected_role');
            if (isSupabaseConfigured) {
              await supabase.auth.signOut();
            }
            return;
          }

          if (selectedRole === 'learner') {
            const { data: learner } = await supabase
              .from('learners')
              .select('*')
              .eq('email', sessionUserEmail)
              .maybeSingle();
            if (learner) {
              setUser({ email: sessionUserEmail, role: 'learner', onboarded: true });
              setLearnerProfile(learner as LearnerProfile);
              return;
            } else {
              const newProfile = {
                email: sessionUserEmail,
                name: getNameFromEmail(sessionUserEmail),
                phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
                level: 'Beginner' as const,
                driving_score: 0,
                total_sessions: 0,
                wallet_balance: 0,
                preferred_vehicle: 'Car' as const,
                goal: 'Obtain my driving license',
                test_ready: false,
                photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
              };
              await supabase.from('learners').insert([newProfile]);
              setUser({ email: sessionUserEmail, role: 'learner', onboarded: true });
              setLearnerProfile(newProfile as LearnerProfile);
              return;
            }
          } else if (selectedRole === 'instructor') {
            const { data: instructor } = await supabase
              .from('instructors')
              .select('*')
              .eq('email', sessionUserEmail)
              .maybeSingle();
            if (instructor) {
              setUser({ email: sessionUserEmail, role: 'instructor', onboarded: true });
              setInstructorProfile(instructor as InstructorProfile);
              return;
            } else {
              const newProfile = {
                email: sessionUserEmail,
                name: getNameFromEmail(sessionUserEmail),
                phone: `+91 ${Math.floor(6000000000 + Math.random() * 4000000000)}`,
                specialization: ['Car' as const],
                experience_years: 5,
                rating: 4.8,
                total_reviews: 12,
                availability: ['Monday', 'Wednesday', 'Friday'],
                time_slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
                auto_accept: true,
                price_per_session: 260,
                bio: 'Experienced and friendly driving instructor certified for safe driving lessons.',
                photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                status: 'active' as const,
                total_earnings: 0,
                total_sessions: 0,
              };
              await supabase.from('instructors').insert([newProfile]);
              setUser({ email: sessionUserEmail, role: 'instructor', onboarded: true });
              setInstructorProfile(newProfile as InstructorProfile);
              return;
            }
          }
        }

        // If no role has been chosen for this tab session yet, check existing database tables for role permanence!
        const { data: existingLearner } = await supabase
          .from('learners')
          .select('*')
          .eq('email', sessionUserEmail)
          .maybeSingle();

        if (existingLearner) {
          sessionStorage.setItem('selected_role', 'learner');
          setUser({ email: sessionUserEmail, role: 'learner', onboarded: true });
          setLearnerProfile(existingLearner as LearnerProfile);
          return;
        }

        const { data: existingInstructor } = await supabase
          .from('instructors')
          .select('*')
          .eq('email', sessionUserEmail)
          .maybeSingle();

        if (existingInstructor) {
          sessionStorage.setItem('selected_role', 'instructor');
          setUser({ email: sessionUserEmail, role: 'instructor', onboarded: true });
          setInstructorProfile(existingInstructor as InstructorProfile);
          return;
        }

        // If user is brand new and has not selected a role yet
        setUser({ email: sessionUserEmail, role: null, onboarded: false });
      } catch (err) {
        console.error('Error checking user session profile:', err);
        setUser({ email: sessionUserEmail, role: null, onboarded: false });
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAndSync(session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await checkAndSync(session.user.email);
      } else {
        setUser(null);
        setLearnerProfile(null);
        setInstructorProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) return;

    const syncProfile = async () => {
      if (!user) {
        setLearnerProfile(null);
        setInstructorProfile(null);
        return;
      }

      setLoading(true);
      if (user.role === 'learner') {
        setLearnerProfile(db.getLearner(user.email) || mockLearner);
      } else if (user.role === 'instructor') {
        setInstructorProfile(db.getInstructor(user.email) || mockInstructorSelf);
      }
      setLoading(false);
    };

    if (user?.onboarded && user.role) {
      syncProfile();
    }
  }, [user]);

  const updateLearnerProfile = async (updates: Partial<LearnerProfile>) => {
    const targetEmail = user?.email || learnerProfile?.email || 'learner@example.com';
    const learnerName = learnerProfile?.name || getNameFromEmail(targetEmail) || 'Learner';

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('learners')
          .update(updates)
          .eq('email', targetEmail);

        if (error) {
          console.error('Supabase update error:', error);
          await supabase.from('learners').upsert([{ email: targetEmail, name: learnerName, ...updates }]);
        }
        setLearnerProfile((prev) => (prev ? { ...prev, ...updates } : ({ email: targetEmail, name: learnerName, ...updates } as any)));
      } catch (err) {
        console.error('Error updating learner profile:', err);
        setLearnerProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } else {
      db.updateLearner(targetEmail, updates);
      const updated = db.getLearner(targetEmail);
      if (updated) setLearnerProfile({ ...updated });
      else setLearnerProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const updateInstructorProfile = async (updates: Partial<InstructorProfile>) => {
    const targetEmail = user?.email || instructorProfile?.email || 'instructor@example.com';
    const instructorName = instructorProfile?.name || getNameFromEmail(targetEmail) || 'Instructor';

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('instructors')
          .update(updates)
          .eq('email', targetEmail);

        if (error) {
          console.error('Supabase instructor update error:', error);
          await supabase.from('instructors').upsert([{ email: targetEmail, name: instructorName, ...updates }]);
        }
        setInstructorProfile((prev) => (prev ? { ...prev, ...updates } : ({ email: targetEmail, name: instructorName, ...updates } as any)));
      } catch (err) {
        console.error('Error updating instructor profile:', err);
        setInstructorProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } else {
      db.updateInstructor(targetEmail, updates);
      const updated = db.getInstructor(targetEmail);
      if (updated) setInstructorProfile({ ...updated });
      else setInstructorProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        setRole,
        learnerProfile,
        instructorProfile,
        updateLearnerProfile,
        updateInstructorProfile,
        loading,
        checkRoleConflict,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}