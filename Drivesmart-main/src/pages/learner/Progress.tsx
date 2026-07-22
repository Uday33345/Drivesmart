import React from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip } from
'recharts';
import {
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle2,
  Brain } from
'lucide-react';
import { mockLearner } from '../../data/mockDb';
import { useAuth } from '../../context/AuthContext';
const skillData = [
{
  subject: 'Steering',
  A: 85,
  fullMark: 100
},
{
  subject: 'Parking',
  A: 65,
  fullMark: 100
},
{
  subject: 'Traffic Rules',
  A: 90,
  fullMark: 100
},
{
  subject: 'Defensive',
  A: 70,
  fullMark: 100
},
{
  subject: 'Highway',
  A: 60,
  fullMark: 100
},
{
  subject: 'Night',
  A: 45,
  fullMark: 100
}];

const progressHistory = [
{
  session: '1',
  score: 20
},
{
  session: '3',
  score: 35
},
{
  session: '5',
  score: 45
},
{
  session: '7',
  score: 60
},
{
  session: '10',
  score: 72
},
{
  session: '12',
  score: 78
}];

const milestones = [
{
  title: 'Basic Controls',
  completed: true
},
{
  title: 'Traffic Signals',
  completed: true
},
{
  title: 'Parallel Parking',
  completed: false
},
{
  title: 'Highway Merging',
  completed: false
},
{
  title: 'Night Driving',
  completed: false
}];

export function LearnerProgress() {
  const { learnerProfile } = useAuth();
  
  // Safe fallback learner object to prevent runtime import/database resolution issues
  const safeMockLearner = {
    email: 'learner@example.com',
    name: 'Aarav Sharma',
    phone: '+91 9876543210',
    level: 'Intermediate',
    driving_score: 78,
    total_sessions: 12,
    wallet_balance: 1500,
    preferred_vehicle: 'Car',
    goal: "Get Driver's License by next month",
    test_ready: false,
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  };

  const learner = learnerProfile || mockLearner || safeMockLearner;
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Progress Tracker</h1>
        <p className="text-navy-200 mt-1">
          AI-powered insights into your driving journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Readiness Card */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="glass-strong rounded-3xl p-6 lg:col-span-2 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Target size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-500/20 rounded-lg text-primary-500">
                <Brain size={24} />
              </div>
              <h2 className="text-xl font-semibold">AI Test Readiness</h2>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-6xl font-bold font-display text-primary-500">
                {learner.driving_score}%
              </span>
              <span className="text-navy-200 mb-2">overall readiness</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Estimated sessions to test</span>
                  <span className="font-semibold text-primary-400">
                    4-6 sessions
                  </span>
                </div>
                <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full shadow-glow-sm" 
                    style={{ width: `${learner.driving_score}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl flex gap-4">
              <AlertTriangle className="text-primary-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-primary-400">
                  AI Recommendation
                </h4>
                <p className="text-sm text-navy-100 mt-1">
                  Your steering and traffic rules knowledge are excellent. To
                  reach 90% readiness, focus your next 2 sessions on Parallel
                  Parking and Highway Merging.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}
          className="glass rounded-3xl p-6">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Trophy size={24} />
            </div>
            <h2 className="text-xl font-semibold">Milestones</h2>
          </div>

          <div className="space-y-4">
            {milestones.map((m, i) =>
            <div key={i} className="flex items-center gap-3">
                {m.completed ?
              <CheckCircle2 className="text-green-400 shrink-0" size={20} /> :

              <div className="w-5 h-5 rounded-full border-2 border-navy-400 shrink-0" />
              }
                <span className={m.completed ? 'text-white' : 'text-navy-300'}>
                  {m.title}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.2
          }}
          className="glass rounded-3xl p-6 lg:col-span-1 h-[400px]">
          
          <h2 className="text-xl font-semibold mb-4">Skill Analysis</h2>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: '#94a3b8',
                  fontSize: 12
                }} />
              
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false} />
              
              <Radar
                name="Score"
                dataKey="A"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.3} />
              
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Progress Chart */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.3
          }}
          className="glass rounded-3xl p-6 lg:col-span-2 h-[400px]">
          
          <h2 className="text-xl font-semibold mb-4">Score Progression</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressHistory}
              margin={{
                top: 5,
                right: 20,
                bottom: 5,
                left: 0
              }}>
              
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false} />
              
              <XAxis
                dataKey="session"
                stroke="#64748b"
                tick={{
                  fill: '#64748b'
                }}
                axisLine={false}
                tickLine={false} />
              
              <YAxis
                stroke="#64748b"
                tick={{
                  fill: '#64748b'
                }}
                axisLine={false}
                tickLine={false} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1628',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                itemStyle={{
                  color: '#f97316'
                }} />
              
              <Line
                type="monotone"
                dataKey="score"
                stroke="#f97316"
                strokeWidth={3}
                dot={{
                  fill: '#0a1628',
                  stroke: '#f97316',
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  fill: '#f97316'
                }} />
              
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>);

}